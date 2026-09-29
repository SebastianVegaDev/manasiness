import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from 'vitest';
import {
    sql,
} from 'drizzle-orm';

import {
    createDatabaseConnection,
    NestedDatabaseTransactionError,
    type DatabaseConnection,
    type DatabaseExecutor,
} from '../../src/index.js';
import {
    loadDatabaseTestRuntimeConfig,
} from '../../src/testing/index.js';
import {
    loadDatabaseTestEnvironmentFileIfPresent,
} from '../support/load-test-environment.js';

const transactionProbeTable =
    '__manasiness_transaction_probe';

describe(
    'database transaction boundary',
    () => {
        let connection:
            DatabaseConnection;

        let connectionCreated =
            false;

        beforeAll(
            async () => {
                loadDatabaseTestEnvironmentFileIfPresent();

                const config =
                    loadDatabaseTestRuntimeConfig(
                        {
                            ...process.env,

                            DATABASE_POOL_MAX:
                                '1',

                            DATABASE_CONNECTION_TIMEOUT_MS:
                                '2000',
                        },
                    );

                connection =
                    createDatabaseConnection(
                        config,
                        {
                            applicationName:
                                'manasiness-transaction-integration-test',
                        },
                    );

                connectionCreated =
                    true;

                await connection.verify();

                await createProbeTable(
                    connection.db,
                );
            },
        );

        beforeEach(
            async () => {
                await clearProbeTable(
                    connection.db,
                );
            },
        );

        afterAll(
            async () => {
                if (connectionCreated) {
                    await dropProbeTable(
                        connection.db,
                    );

                    await connection.close();
                }
            },
        );

        test('the same persistence operation works with normal and transactional executors', async () => {
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

            expect(
                await readProbeValues(
                    connection.db,
                ),
            ).toEqual([
                'normal',
                'transactional',
            ]);
        });

        test('successful transaction commits every operation', async () => {
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

            expect(
                await readProbeValues(
                    connection.db,
                ),
            ).toEqual([
                'first',
                'second',
            ]);
        });

        test('failure rolls back the complete transaction', async () => {
            await expect(
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
            ).rejects.toThrow(
                'forced transaction failure',
            );

            expect(
                await readProbeValues(
                    connection.db,
                ),
            ).toEqual([]);
        });

        test('the pool connection is reusable after rollback', async () => {
            await expect(
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
            ).rejects.toThrow(
                'rollback probe',
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

            expect(
                await readProbeValues(
                    connection.db,
                ),
            ).toEqual([
                'recovered',
            ]);
        });

        test('nested application transactions are rejected and roll back the outer transaction', async () => {
            await expect(
                connection.transactions.run(
                    async ({
                        executor,
                    }) => {
                        await insertProbe(
                            executor,
                            'outer',
                        );

                        await connection
                            .transactions
                            .run(
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
            ).rejects.toBeInstanceOf(
                NestedDatabaseTransactionError,
            );

            expect(
                await readProbeValues(
                    connection.db,
                ),
            ).toEqual([]);
        });

        test('transaction isolation baseline is read committed', async () => {
            await connection.transactions.run(
                async ({
                    executor,
                }) => {
                    const result =
                        await executor.execute<{
                            transaction_isolation:
                                string;
                        }>(
                            sql`
                                SHOW transaction_isolation
                            `,
                        );

                    expect(
                        result.rows[0]
                            ?.transaction_isolation,
                    ).toBe(
                        'read committed',
                    );
                },
            );
        });
    },
);

async function createProbeTable(
    executor:
        DatabaseExecutor,
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
    executor:
        DatabaseExecutor,
): Promise<void> {
    await executor.execute(
        sql.raw(
            `TRUNCATE TABLE "${transactionProbeTable}" RESTART IDENTITY`,
        ),
    );
}

async function dropProbeTable(
    executor:
        DatabaseExecutor,
): Promise<void> {
    await executor.execute(
        sql.raw(
            `DROP TABLE IF EXISTS "${transactionProbeTable}"`,
        ),
    );
}

async function insertProbe(
    executor:
        DatabaseExecutor,
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
    executor:
        DatabaseExecutor,
): Promise<string[]> {
    const result =
        await executor.execute<{
            value: string;
        }>(
            sql`
                SELECT "value"
                FROM "__manasiness_transaction_probe"
                ORDER BY "sequence"
            `,
        );

    return result.rows.map(
        (row) =>
            row.value,
    );
}
