import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { sql } from 'drizzle-orm';

import { generateEntityId, type EntityId } from '@manasiness/platform-primitives';

import {
    assertRlsSafeRuntimeDatabaseRole,
    createDatabaseConnection,
    type DatabaseConnection,
    type DatabaseExecutor,
} from '../../src/index.js';
import {
    assertTenantTableRlsProtected,
    loadDatabaseTestApplicationRuntimeConfig,
    loadDatabaseTestRuntimeConfig,
} from '../../src/testing/index.js';
import { loadDatabaseTestEnvironmentFileIfPresent } from '../support/load-test-environment.js';

const parentTable = '__manasiness_tenant_parent_probe';

const childTable = '__manasiness_tenant_child_probe';

describe('tenant persistence guardrails', () => {
    let adminConnection: DatabaseConnection;

    let runtimeConnection: DatabaseConnection;

    let adminConnectionCreated = false;

    let runtimeConnectionCreated = false;

    let organizationA: EntityId;

    let organizationB: EntityId;

    let parentA: EntityId;

    let parentB: EntityId;

    beforeAll(async () => {
        loadDatabaseTestEnvironmentFileIfPresent();

        adminConnection = createDatabaseConnection(loadDatabaseTestRuntimeConfig(process.env), {
            applicationName: 'manasiness-tenant-test-admin',
        });

        runtimeConnection = createDatabaseConnection(
            loadDatabaseTestApplicationRuntimeConfig(process.env),
            {
                applicationName: 'manasiness-tenant-test-runtime',
            },
        );

        adminConnectionCreated = true;

        runtimeConnectionCreated = true;

        await adminConnection.verify();
        await runtimeConnection.verify();

        await createTenantProbeTables(adminConnection.db);

        organizationA = generateEntityId();

        organizationB = generateEntityId();

        parentA = generateEntityId();

        parentB = generateEntityId();

        await seedParent(adminConnection.db, organizationA, parentA, 'organization-a-parent');

        await seedParent(adminConnection.db, organizationB, parentB, 'organization-b-parent');
    });

    beforeEach(async () => {
        await clearChildren(adminConnection.db);
    });

    afterAll(async () => {
        if (adminConnectionCreated) {
            await dropTenantProbeTables(adminConnection.db);
        }

        if (runtimeConnectionCreated) {
            await runtimeConnection.close();
        }

        if (adminConnectionCreated) {
            await adminConnection.close();
        }
    });

    test('administrative connection is rejected as application runtime', async () => {
        await expect(assertRlsSafeRuntimeDatabaseRole(adminConnection.db)).rejects.toThrow(
            /Unsafe database runtime role/u,
        );
    });

    test('tenant tables enable and force RLS', async () => {
        await assertTenantTableRlsProtected(adminConnection.db, {
            tableName: parentTable,
        });

        await assertTenantTableRlsProtected(adminConnection.db, {
            tableName: childTable,
        });
    });

    test('runtime role cannot bypass RLS', async () => {
        await expect(
            assertRlsSafeRuntimeDatabaseRole(runtimeConnection.db),
        ).resolves.toBeUndefined();
    });

    test('missing tenant context exposes no tenant rows', async () => {
        expect(await readParentLabels(runtimeConnection.db)).toEqual([]);
    });

    test('tenant A sees only tenant A', async () => {
        const labels = await runtimeConnection.tenantScope.run(
            {
                organizationId: organizationA,
            },
            async ({ executor }) => readParentLabels(executor),
        );

        expect(labels).toEqual(['organization-a-parent']);
    });

    test('tenant B sees only tenant B', async () => {
        const labels = await runtimeConnection.tenantScope.run(
            {
                organizationId: organizationB,
            },
            async ({ executor }) => readParentLabels(executor),
        );

        expect(labels).toEqual(['organization-b-parent']);
    });

    test('RLS rejects writes carrying another Organization ID', async () => {
        await expectPostgresError(
            runtimeConnection.tenantScope.run(
                {
                    organizationId: organizationA,
                },
                async ({ executor }) => {
                    await insertParent(
                        executor,
                        organizationB,
                        generateEntityId(),
                        'invalid-cross-tenant-write',
                    );
                },
            ),
            '42501',
        );
    });

    test('tenant-qualified foreign key rejects cross-tenant references', async () => {
        await expectPostgresError(
            runtimeConnection.tenantScope.run(
                {
                    organizationId: organizationA,
                },
                async ({ executor }) => {
                    await insertChild(
                        executor,
                        organizationA,
                        generateEntityId(),
                        parentB,
                        'invalid-cross-tenant-reference',
                    );
                },
            ),
            '23503',
        );
    });

    test('same-tenant reference succeeds', async () => {
        await expect(
            runtimeConnection.tenantScope.run(
                {
                    organizationId: organizationA,
                },
                async ({ executor }) => {
                    await insertChild(
                        executor,
                        organizationA,
                        generateEntityId(),
                        parentA,
                        'valid-reference',
                    );
                },
            ),
        ).resolves.toBeUndefined();
    });

    test('tenant context does not leak after transaction completion', async () => {
        await runtimeConnection.tenantScope.run(
            {
                organizationId: organizationA,
            },
            async ({ executor }) => {
                expect(await readParentLabels(executor)).toEqual(['organization-a-parent']);
            },
        );

        expect(await readParentLabels(runtimeConnection.db)).toEqual([]);
    });
});

async function createTenantProbeTables(executor: DatabaseExecutor): Promise<void> {
    await executor.execute(
        sql.raw(`
            DROP TABLE IF EXISTS "${childTable}";
            DROP TABLE IF EXISTS "${parentTable}";

            CREATE TABLE "${parentTable}" (
                "id" uuid PRIMARY KEY,
                "organization_id" uuid NOT NULL,
                "label" text NOT NULL,
                CONSTRAINT "${parentTable}_organization_id_id_unique"
                    UNIQUE ("organization_id", "id")
            );

            CREATE TABLE "${childTable}" (
                "id" uuid PRIMARY KEY,
                "organization_id" uuid NOT NULL,
                "parent_id" uuid NOT NULL,
                "label" text NOT NULL,
                CONSTRAINT "${childTable}_parent_tenant_fk"
                    FOREIGN KEY ("organization_id", "parent_id")
                    REFERENCES "${parentTable}" ("organization_id", "id")
            );

            ALTER TABLE "${parentTable}"
                ENABLE ROW LEVEL SECURITY;

            ALTER TABLE "${parentTable}"
                FORCE ROW LEVEL SECURITY;

            ALTER TABLE "${childTable}"
                ENABLE ROW LEVEL SECURITY;

            ALTER TABLE "${childTable}"
                FORCE ROW LEVEL SECURITY;

            CREATE POLICY "${parentTable}_tenant_isolation"
                ON "${parentTable}"
                FOR ALL
                TO PUBLIC
                USING (
                    "organization_id" =
                    nullif(
                        current_setting(
                            'manasiness.organization_id',
                            true
                        ),
                        ''
                    )::uuid
                )
                WITH CHECK (
                    "organization_id" =
                    nullif(
                        current_setting(
                            'manasiness.organization_id',
                            true
                        ),
                        ''
                    )::uuid
                );

            CREATE POLICY "${childTable}_tenant_isolation"
                ON "${childTable}"
                FOR ALL
                TO PUBLIC
                USING (
                    "organization_id" =
                    nullif(
                        current_setting(
                            'manasiness.organization_id',
                            true
                        ),
                        ''
                    )::uuid
                )
                WITH CHECK (
                    "organization_id" =
                    nullif(
                        current_setting(
                            'manasiness.organization_id',
                            true
                        ),
                        ''
                    )::uuid
                );
        `),
    );
}

async function clearChildren(executor: DatabaseExecutor): Promise<void> {
    await executor.execute(sql.raw(`TRUNCATE TABLE "${childTable}"`));
}

async function dropTenantProbeTables(executor: DatabaseExecutor): Promise<void> {
    await executor.execute(
        sql.raw(`
            DROP TABLE IF EXISTS "${childTable}";
            DROP TABLE IF EXISTS "${parentTable}";
        `),
    );
}

async function seedParent(
    executor: DatabaseExecutor,
    organizationId: EntityId,
    id: EntityId,
    label: string,
): Promise<void> {
    await insertParent(executor, organizationId, id, label);
}

async function insertParent(
    executor: DatabaseExecutor,
    organizationId: EntityId,
    id: EntityId,
    label: string,
): Promise<void> {
    await executor.execute(
        sql`
            INSERT INTO "__manasiness_tenant_parent_probe" (
                "id",
                "organization_id",
                "label"
            )
            VALUES (
                ${id},
                ${organizationId},
                ${label}
            )
        `,
    );
}

async function insertChild(
    executor: DatabaseExecutor,
    organizationId: EntityId,
    id: EntityId,
    parentId: EntityId,
    label: string,
): Promise<void> {
    await executor.execute(
        sql`
            INSERT INTO "__manasiness_tenant_child_probe" (
                "id",
                "organization_id",
                "parent_id",
                "label"
            )
            VALUES (
                ${id},
                ${organizationId},
                ${parentId},
                ${label}
            )
        `,
    );
}

async function readParentLabels(executor: DatabaseExecutor): Promise<string[]> {
    const result = await executor.execute<{
        label: string;
    }>(
        sql`
                SELECT "label"
                FROM "__manasiness_tenant_parent_probe"
                ORDER BY "label"
            `,
    );

    return result.rows.map((row) => row.label);
}

async function expectPostgresError(
    operation: Promise<unknown>,
    expectedCode: string,
): Promise<void> {
    let thrown: unknown;

    try {
        await operation;
    } catch (error: unknown) {
        thrown = error;
    }

    const databaseError =
        thrown instanceof Error && thrown.cause !== undefined ? thrown.cause : thrown;

    expect(databaseError).toMatchObject({
        code: expectedCode,
    });
}
