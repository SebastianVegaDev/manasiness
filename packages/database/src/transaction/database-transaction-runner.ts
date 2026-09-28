import { AsyncLocalStorage } from 'node:async_hooks';

import type { Pool, PoolClient } from 'pg';

import { createDatabaseClient } from '../connection/database-client.js';
import type { DatabaseExecutor } from './database-executor.js';

const beginTransactionStatement =
    'BEGIN ISOLATION LEVEL READ COMMITTED READ WRITE';

export interface DatabaseTransactionContext {
    readonly executor: DatabaseExecutor;
}

export type DatabaseTransactionOperation<T> = (
    context: DatabaseTransactionContext,
) => Promise<T>;

export interface DatabaseTransactionRunner {
    run<T>(
        operation: DatabaseTransactionOperation<T>,
    ): Promise<T>;
}

export class NestedDatabaseTransactionError extends Error {
    constructor() {
        super(
            'Nested application database transactions are not supported. Reuse the existing transaction context instead.',
        );

        this.name = 'NestedDatabaseTransactionError';
    }
}

export function createDatabaseTransactionRunner(
    pool: Pool,
): DatabaseTransactionRunner {
    const transactionScope =
        new AsyncLocalStorage<boolean>();

    return Object.freeze({
        async run<T>(
            operation: DatabaseTransactionOperation<T>,
        ): Promise<T> {
            if (transactionScope.getStore() === true) {
                throw new NestedDatabaseTransactionError();
            }

            return transactionScope.run(
                true,
                async (): Promise<T> =>
                    executeTopLevelTransaction(
                        pool,
                        operation,
                    ),
            );
        },
    });
}

async function executeTopLevelTransaction<T>(
    pool: Pool,
    operation: DatabaseTransactionOperation<T>,
): Promise<T> {
    const client = await pool.connect();

    let transactionOpen = false;
    let destroyClient = false;

    try {
        try {
            await client.query(
                beginTransactionStatement,
            );

            transactionOpen = true;
        } catch (beginError: unknown) {
            destroyClient = true;

            throw beginError;
        }

        const executor: DatabaseExecutor =
            createDatabaseClient(client);

        const context =
            Object.freeze<DatabaseTransactionContext>({
                executor,
            });

        let result: T;

        try {
            result = await operation(context);
        } catch (operationError: unknown) {
            const rollbackError =
                await tryRollback(client);

            transactionOpen = false;

            if (rollbackError !== undefined) {
                destroyClient = true;

                throw createRollbackFailureError(
                    operationError,
                    rollbackError.error,
                );
            }

            throw operationError;
        }

        try {
            await client.query('COMMIT');

            transactionOpen = false;

            return result;
        } catch (commitError: unknown) {
            destroyClient = true;

            const rollbackError =
                await tryRollback(client);

            transactionOpen = false;

            if (rollbackError !== undefined) {
                throw createRollbackFailureError(
                    commitError,
                    rollbackError.error,
                );
            }

            throw commitError;
        }
    } finally {
        if (transactionOpen) {
            const rollbackError =
                await tryRollback(client);

            if (rollbackError !== undefined) {
                destroyClient = true;
            }
        }

        client.release(destroyClient);
    }
}

async function tryRollback(
    client: PoolClient,
): Promise<{ error: unknown } | undefined> {
    try {
        await client.query('ROLLBACK');

        return undefined;
    } catch (rollbackError: unknown) {
        return { error: rollbackError };
    }
}

function createRollbackFailureError(
    originalError: unknown,
    rollbackError: unknown,
): AggregateError {
    return new AggregateError(
        [originalError, rollbackError],
        'Database transaction failed and rollback could not complete.',
    );
}
