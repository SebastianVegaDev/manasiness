import assert from 'node:assert/strict';
import test from 'node:test';

import {
    generateEntityId,
    type EntityId,
} from '@manasiness/platform-primitives';
import { sql } from 'drizzle-orm';

import {
    assertRlsSafeRuntimeDatabaseRole,
    type DatabaseExecutor,
} from '../../src/index.js';
import {
    assertTenantTableRlsProtected,
    withDatabaseTestConnection,
    withDatabaseTestRuntimeConnection,
} from '../../src/testing/index.js';
import { loadDatabaseTestEnvironmentFileIfPresent } from '../support/load-test-environment.js';

const parentTable =
    '__manasiness_tenant_parent_probe';

const childTable =
    '__manasiness_tenant_child_probe';

loadDatabaseTestEnvironmentFileIfPresent();

void test(
    'tenant persistence guardrails',
    async (t) => {
        await withDatabaseTestConnection(
            process.env,
            async (adminConnection) => {
                await createTenantProbeTables(
                    adminConnection.db,
                );

                const organizationA =
                    generateEntityId();

                const organizationB =
                    generateEntityId();

                const parentA =
                    generateEntityId();

                const parentB =
                    generateEntityId();

                try {
                    await seedParent(
                        adminConnection.db,
                        organizationA,
                        parentA,
                        'organization-a-parent',
                    );

                    await seedParent(
                        adminConnection.db,
                        organizationB,
                        parentB,
                        'organization-b-parent',
                    );

                    await t.test(
                        'administrative connection is rejected as an application runtime role',
                        async () => {
                            await assert.rejects(
                                assertRlsSafeRuntimeDatabaseRole(
                                    adminConnection.db,
                                ),
                                /Unsafe database runtime role/,
                            );
                        },
                    );

                    await t.test(
                        'fixture tables enable and force RLS',
                        async () => {
                            await assertTenantTableRlsProtected(
                                adminConnection.db,
                                {
                                    tableName:
                                        parentTable,
                                },
                            );

                            await assertTenantTableRlsProtected(
                                adminConnection.db,
                                {
                                    tableName:
                                        childTable,
                                },
                            );
                        },
                    );

                    await withDatabaseTestRuntimeConnection(
                        process.env,
                        async (
                            runtimeConnection,
                        ) => {
                            await t.test(
                                'runtime role is safe for RLS',
                                async () => {
                                    await assert.doesNotReject(
                                        assertRlsSafeRuntimeDatabaseRole(
                                            runtimeConnection.db,
                                        ),
                                    );
                                },
                            );

                            await t.test(
                                'unscoped runtime access sees no tenant rows',
                                async () => {
                                    assert.deepEqual(
                                        await readParentLabels(
                                            runtimeConnection.db,
                                        ),
                                        [],
                                    );
                                },
                            );

                            await t.test(
                                'tenant A sees only tenant A rows',
                                async () => {
                                    const labels =
                                        await runtimeConnection.tenantScope.run(
                                            {
                                                organizationId:
                                                    organizationA,
                                            },
                                            async ({
                                                executor,
                                            }) =>
                                                readParentLabels(
                                                    executor,
                                                ),
                                        );

                                    assert.deepEqual(
                                        labels,
                                        [
                                            'organization-a-parent',
                                        ],
                                    );
                                },
                            );

                            await t.test(
                                'tenant B sees only tenant B rows',
                                async () => {
                                    const labels =
                                        await runtimeConnection.tenantScope.run(
                                            {
                                                organizationId:
                                                    organizationB,
                                            },
                                            async ({
                                                executor,
                                            }) =>
                                                readParentLabels(
                                                    executor,
                                                ),
                                        );

                                    assert.deepEqual(
                                        labels,
                                        [
                                            'organization-b-parent',
                                        ],
                                    );
                                },
                            );

                            await t.test(
                                'RLS rejects a write carrying another tenant organization id',
                                async () => {
                                    await assert.rejects(
                                        runtimeConnection.tenantScope.run(
                                            {
                                                organizationId:
                                                    organizationA,
                                            },
                                            async ({
                                                executor,
                                            }) => {
                                                await insertParent(
                                                    executor,
                                                    organizationB,
                                                    generateEntityId(),
                                                    'invalid-cross-tenant-write',
                                                );
                                            },
                                        ),
                                        hasPostgresErrorCode(
                                            '42501',
                                        ),
                                    );
                                },
                            );

                            await t.test(
                                'tenant-qualified foreign key rejects cross-tenant references',
                                async () => {
                                    await assert.rejects(
                                        runtimeConnection.tenantScope.run(
                                            {
                                                organizationId:
                                                    organizationA,
                                            },
                                            async ({
                                                executor,
                                            }) => {
                                                await insertChild(
                                                    executor,
                                                    organizationA,
                                                    generateEntityId(),
                                                    parentB,
                                                    'invalid-cross-tenant-reference',
                                                );
                                            },
                                        ),
                                        hasPostgresErrorCode(
                                            '23503',
                                        ),
                                    );
                                },
                            );

                            await t.test(
                                'same-tenant reference succeeds',
                                async () => {
                                    await runtimeConnection.tenantScope.run(
                                        {
                                            organizationId:
                                                organizationA,
                                        },
                                        async ({
                                            executor,
                                        }) => {
                                            await insertChild(
                                                executor,
                                                organizationA,
                                                generateEntityId(),
                                                parentA,
                                                'valid-reference',
                                            );
                                        },
                                    );
                                },
                            );

                            await t.test(
                                'tenant context does not leak after transaction completion',
                                async () => {
                                    await runtimeConnection.tenantScope.run(
                                        {
                                            organizationId:
                                                organizationA,
                                        },
                                        async ({
                                            executor,
                                        }) => {
                                            assert.deepEqual(
                                                await readParentLabels(
                                                    executor,
                                                ),
                                                [
                                                    'organization-a-parent',
                                                ],
                                            );
                                        },
                                    );

                                    assert.deepEqual(
                                        await readParentLabels(
                                            runtimeConnection.db,
                                        ),
                                        [],
                                    );
                                },
                            );
                        },
                    );
                } finally {
                    await dropTenantProbeTables(
                        adminConnection.db,
                    );
                }
            },
        );
    },
);

async function createTenantProbeTables(
    executor: DatabaseExecutor,
): Promise<void> {
    await executor.execute(
        sql.raw(`
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

async function dropTenantProbeTables(
    executor: DatabaseExecutor,
): Promise<void> {
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
    await insertParent(
        executor,
        organizationId,
        id,
        label,
    );
}

async function insertParent(
    executor: DatabaseExecutor,
    organizationId: EntityId,
    id: EntityId,
    label: string,
): Promise<void> {
    await executor.execute(sql`
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
    `);
}

async function insertChild(
    executor: DatabaseExecutor,
    organizationId: EntityId,
    id: EntityId,
    parentId: EntityId,
    label: string,
): Promise<void> {
    await executor.execute(sql`
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
    `);
}

async function readParentLabels(
    executor: DatabaseExecutor,
): Promise<string[]> {
    const result = await executor.execute<{
        label: string;
    }>(sql`
        SELECT "label"
        FROM "__manasiness_tenant_parent_probe"
        ORDER BY "label"
    `);

    return result.rows.map(
        (row) => row.label,
    );
}

function hasPostgresErrorCode(
    expectedCode: string,
): (error: unknown) => boolean {
    return (error: unknown): boolean => {
        if (
            typeof error !== 'object' ||
            error === null ||
            !('code' in error)
        ) {
            return false;
        }

        return (
            (error as { readonly code?: unknown })
                .code === expectedCode
        );
    };
}
