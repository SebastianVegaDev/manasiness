import assert from 'node:assert/strict';
import test from 'node:test';

import { sql } from 'drizzle-orm';

import {
    NestedDatabaseTransactionError,
    type DatabaseExecutor,
} from '../../src/index.js';
import { withDatabaseTestConnection } from '../../src/testing/index.js';
import { loadDatabaseTestEnvironmentFileIfPresent } from '../support/load-test-environment.js';

const transactionProbeTable =
    '__manasiness_transaction_probe';

loadDatabaseTestEnvironmentFileIfPresent();

void test(
    'database transaction boundary',
    async (t) => {
        await withDatabaseTestConnection(
            {
                ...process.env,

                // A single available pooled connection makes
                // connection leaks immediately observable.
                DATABASE_POOL_MAX: '1',

                DATABASE_CONNECTION_TIMEOUT_MS:
                    '2000',
            },
            async (connection) => {
                await createProbeTable(
                    connection.db,
                );

                try {
                    await t.test(
                        'the same persistence operation works with normal and transactional executors',
                        async () => {
                            await clearProbeTable(
                                connection.db,
                            );

                            await insertProbe(
                                connection.db,
                                'normal',
                            );

                            await connection.transactions.run(
                                async ({
                                    executor,
                                }) => {
                                    await insertProbe(
                                        executor,
                                        'transactional',
                                    );
                                },
                            );

                            assert.deepEqual(
                                await readProbeValues(
                                    connection.db,
                                ),
                                [
                                    'normal',
                                    'transactional',
                                ],
                            );
                        },
                    );

                    await t.test(
                        'successful transaction commits all operations',
                        async () => {
                            await clearProbeTable(
                                connection.db,
                            );

                            await connection.transactions.run(
                                async ({
                                    executor,
                                }) => {
                                    await insertProbe(
                                        executor,
                                        'first',
                                    );

                                    await insertProbe(
                                        executor,
                                        'second',
                                    );
                                },
                            );

                            assert.deepEqual(
                                await readProbeValues(
                                    connection.db,
                                ),
                                ['first', 'second'],
                            );
                        },
                    );

                    await t.test(
                        'failure rolls back the complete transaction',
                        async () => {
                            await clearProbeTable(
                                connection.db,
                            );

                            await assert.rejects(
                                connection.transactions.run(
                                    async ({
                                        executor,
                                    }) => {
                                        await insertProbe(
                                            executor,
                                            'first',
                                        );

                                        await insertProbe(
                                            executor,
                                            'second',
                                        );

                                        throw new Error(
                                            'forced transaction failure',
                                        );
                                    },
                                ),
                                /forced transaction failure/,
                            );

                            assert.deepEqual(
                                await readProbeValues(
                                    connection.db,
                                ),
                                [],
                            );
                        },
                    );

                    await t.test(
                        'connection is reusable after rollback',
                        async () => {
                            await clearProbeTable(
                                connection.db,
                            );

                            await assert.rejects(
                                connection.transactions.run(
                                    async ({
                                        executor,
                                    }) => {
                                        await insertProbe(
                                            executor,
                                            'rolled-back',
                                        );

                                        throw new Error(
                                            'rollback probe',
                                        );
                                    },
                                ),
                                /rollback probe/,
                            );

                            await connection.transactions.run(
                                async ({
                                    executor,
                                }) => {
                                    await insertProbe(
                                        executor,
                                        'recovered',
                                    );
                                },
                            );

                            assert.deepEqual(
                                await readProbeValues(
                                    connection.db,
                                ),
                                ['recovered'],
                            );
                        },
                    );

                    await t.test(
                        'nested application transactions are rejected and the outer transaction rolls back',
                        async () => {
                            await clearProbeTable(
                                connection.db,
                            );

                            await assert.rejects(
                                connection.transactions.run(
                                    async ({
                                        executor,
                                    }) => {
                                        await insertProbe(
                                            executor,
                                            'outer',
                                        );

                                        await connection.transactions.run(
                                            async ({
                                                executor:
                                                    nestedExecutor,
                                            }) => {
                                                await insertProbe(
                                                    nestedExecutor,
                                                    'nested',
                                                );
                                            },
                                        );
                                    },
                                ),
                                NestedDatabaseTransactionError,
                            );

                            assert.deepEqual(
                                await readProbeValues(
                                    connection.db,
                                ),
                                [],
                            );
                        },
                    );

                    await t.test(
                        'transaction isolation baseline is read committed',
                        async () => {
                            await connection.transactions.run(
                                async ({
                                    executor,
                                }) => {
                                    const result =
                                        await executor.execute<{
                                            transaction_isolation: string;
                                        }>(
                                            sql`
                                                SHOW transaction_isolation
                                            `,
                                        );

                                    assert.equal(
                                        result.rows[0]
                                            ?.transaction_isolation,
                                        'read committed',
                                    );
                                },
                            );
                        },
                    );
                } finally {
                    await dropProbeTable(
                        connection.db,
                    );
                }
            },
        );
    },
);

async function createProbeTable(
    executor: DatabaseExecutor,
): Promise<void> {
    await executor.execute(
        sql.raw(`
            CREATE TABLE IF NOT EXISTS "${transactionProbeTable}" (
                "sequence" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                "value" text NOT NULL
            )
        `),
    );
}

async function clearProbeTable(
    executor: DatabaseExecutor,
): Promise<void> {
    await executor.execute(
        sql.raw(
            `TRUNCATE TABLE "${transactionProbeTable}" RESTART IDENTITY`,
        ),
    );
}

async function dropProbeTable(
    executor: DatabaseExecutor,
): Promise<void> {
    await executor.execute(
        sql.raw(
            `DROP TABLE IF EXISTS "${transactionProbeTable}"`,
        ),
    );
}

async function insertProbe(
    executor: DatabaseExecutor,
    value: string,
): Promise<void> {
    await executor.execute(
        sql`
            INSERT INTO "__manasiness_transaction_probe" ("value")
            VALUES (${value})
        `,
    );
}

async function readProbeValues(
    executor: DatabaseExecutor,
): Promise<string[]> {
    const result = await executor.execute<{
        value: string;
    }>(
        sql`
            SELECT "value"
            FROM "__manasiness_transaction_probe"
            ORDER BY "sequence"
        `,
    );

    return result.rows.map((row) => row.value);
}
