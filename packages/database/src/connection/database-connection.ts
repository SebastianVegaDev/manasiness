import { Pool } from 'pg';

import type { DatabaseRuntimeConfig } from '../config/database-runtime-config.js';
import {
    createTenantDatabaseScope,
    type TenantDatabaseScope,
} from '../tenant/tenant-database-scope.js';
import {
    createDatabaseTransactionRunner,
    type DatabaseTransactionRunner,
} from '../transaction/database-transaction-runner.js';
import {
    createDatabaseClient,
    type DatabaseClient,
} from './database-client.js';

export interface CreateDatabaseConnectionOptions {
    readonly applicationName?: string;

    readonly onPoolError?: (
        error: unknown,
    ) => void;
}

export function createDatabaseConnection(
    config: DatabaseRuntimeConfig,
    options: CreateDatabaseConnectionOptions = {},
) {
    const pool = new Pool({
        connectionString: config.url,

        max: config.pool.maxConnections,

        idleTimeoutMillis:
            config.pool.idleTimeoutMs,

        connectionTimeoutMillis:
            config.pool
                .connectionTimeoutMs,

        ...(options.applicationName ===
        undefined
            ? {}
            : {
                  application_name:
                      options.applicationName,
              }),
    });

    pool.on(
        'error',
        (error: unknown) => {
            try {
                options.onPoolError?.(
                    error,
                );
            } catch {
                // Logging/diagnostic callbacks must
                // never crash the database pool.
            }
        },
    );

    const db: DatabaseClient =
        createDatabaseClient(pool);

    const transactions: DatabaseTransactionRunner =
        createDatabaseTransactionRunner(
            pool,
        );

    const tenantScope: TenantDatabaseScope =
        createTenantDatabaseScope(
            transactions,
        );

    let closed = false;

    async function runProbe(
        timeoutMs: number,
    ): Promise<void> {
        assertOpen();

        assertValidProbeTimeout(
            timeoutMs,
        );

        const query = pool
            .query('SELECT 1')
            .then(() => undefined);

        await settleWithin(
            query,
            timeoutMs,
        );
    }

    function assertOpen(): void {
        if (closed) {
            throw new Error(
                'Database connection is closed.',
            );
        }
    }

    return Object.freeze({
        db,
        transactions,
        tenantScope,

        async verify(): Promise<void> {
            await runProbe(
                config.pool
                    .connectionTimeoutMs,
            );
        },

        async probeReadiness(
            timeoutMs: number,
        ): Promise<void> {
            await runProbe(timeoutMs);
        },

        async close(): Promise<void> {
            if (closed) {
                return;
            }

            closed = true;

            await pool.end();
        },
    });
}

export type DatabaseConnection = ReturnType<
    typeof createDatabaseConnection
>;

function assertValidProbeTimeout(
    timeoutMs: number,
): void {
    if (
        !Number.isSafeInteger(
            timeoutMs,
        ) ||
        timeoutMs <= 0
    ) {
        throw new RangeError(
            'Database probe timeout must be a positive safe integer.',
        );
    }
}

async function settleWithin<T>(
    operation: Promise<T>,
    timeoutMs: number,
): Promise<T> {
    let timeout:
        | NodeJS.Timeout
        | undefined;

    const timeoutPromise =
        new Promise<never>(
            (_resolve, reject) => {
                timeout = setTimeout(
                    () => {
                        reject(
                            new Error(
                                'Database readiness probe timed out.',
                            ),
                        );
                    },
                    timeoutMs,
                );

                timeout.unref();
            },
        );

    try {
        return await Promise.race([
            operation,
            timeoutPromise,
        ]);
    } finally {
        if (timeout !== undefined) {
            clearTimeout(timeout);
        }
    }
}
