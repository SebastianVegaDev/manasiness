import { sql } from 'drizzle-orm';

import {
    createDatabaseConnection,
    type DatabaseConnection,
} from '../connection/database-connection.js';
import {
    loadDatabaseRuntimeConfig,
    type DatabaseEnvironmentSource,
    type DatabaseRuntimeConfig,
} from '../config/database-runtime-config.js';
import {
    getDatabaseName,
    postgresConnectionUrlSchema,
} from '../config/database-url.js';
import type { DatabaseExecutor } from '../transaction/database-executor.js';

type TestDatabaseVariable =
    | 'DATABASE_TEST_URL'
    | 'DATABASE_TEST_RUNTIME_URL';

export function loadDatabaseTestRuntimeConfig(
    environment: DatabaseEnvironmentSource = process.env,
): DatabaseRuntimeConfig {
    return loadDedicatedTestDatabaseConfig(
        environment,
        'DATABASE_TEST_URL',
    );
}

export function loadDatabaseTestApplicationRuntimeConfig(
    environment: DatabaseEnvironmentSource = process.env,
): DatabaseRuntimeConfig {
    return loadDedicatedTestDatabaseConfig(
        environment,
        'DATABASE_TEST_RUNTIME_URL',
    );
}

export async function withDatabaseTestConnection<T>(
    environment: DatabaseEnvironmentSource,
    operation: (
        connection: DatabaseConnection,
    ) => Promise<T>,
): Promise<T> {
    return withConfiguredTestConnection(
        loadDatabaseTestRuntimeConfig(environment),
        'manasiness-database-integration-test-admin',
        operation,
    );
}

export async function withDatabaseTestRuntimeConnection<T>(
    environment: DatabaseEnvironmentSource,
    operation: (
        connection: DatabaseConnection,
    ) => Promise<T>,
): Promise<T> {
    return withConfiguredTestConnection(
        loadDatabaseTestApplicationRuntimeConfig(
            environment,
        ),
        'manasiness-database-integration-test-runtime',
        operation,
    );
}

export interface TenantTableReference {
    readonly schemaName?: string;
    readonly tableName: string;
}

interface TenantTableSecurityRow extends Record<string, unknown> {
    readonly rlsEnabled: boolean;
    readonly rlsForced: boolean;
    readonly policyCount: number;
}

export async function assertTenantTableRlsProtected(
    executor: DatabaseExecutor,
    reference: TenantTableReference,
): Promise<void> {
    const schemaName =
        reference.schemaName ?? 'public';

    const result =
        await executor.execute<TenantTableSecurityRow>(
            sql`
                SELECT
                    relation.relrowsecurity
                        AS "rlsEnabled",
                    relation.relforcerowsecurity
                        AS "rlsForced",
                    (
                        SELECT count(*)::integer
                        FROM pg_policy AS policy
                        WHERE
                            policy.polrelid =
                            relation.oid
                    ) AS "policyCount"
                FROM pg_class AS relation
                INNER JOIN pg_namespace AS namespace
                    ON namespace.oid =
                        relation.relnamespace
                WHERE
                    namespace.nspname =
                        ${schemaName}
                    AND relation.relname =
                        ${reference.tableName}
                    AND relation.relkind = 'r'
            `,
        );

    const state = result.rows[0];

    if (state === undefined) {
        throw new Error(
            `Tenant table "${schemaName}.${reference.tableName}" does not exist.`,
        );
    }

    if (!state.rlsEnabled) {
        throw new Error(
            `Tenant table "${schemaName}.${reference.tableName}" does not have Row Level Security enabled.`,
        );
    }

    if (!state.rlsForced) {
        throw new Error(
            `Tenant table "${schemaName}.${reference.tableName}" does not FORCE Row Level Security.`,
        );
    }

    if (state.policyCount < 1) {
        throw new Error(
            `Tenant table "${schemaName}.${reference.tableName}" has no Row Level Security policy.`,
        );
    }
}

function loadDedicatedTestDatabaseConfig(
    environment: DatabaseEnvironmentSource,
    variableName: TestDatabaseVariable,
): DatabaseRuntimeConfig {
    const result =
        postgresConnectionUrlSchema.safeParse(
            environment[variableName],
        );

    if (!result.success) {
        throw new Error(
            `Invalid test database configuration:\n- ${variableName}: must be a valid PostgreSQL connection URL.`,
        );
    }

    const databaseName = getDatabaseName(result.data);

    if (
        databaseName !== 'manasiness_test' &&
        !databaseName.startsWith(
            'manasiness_test_',
        )
    ) {
        throw new Error(
            `Refusing test database configuration: ${variableName} must target a dedicated Manasiness test database.`,
        );
    }

    return loadDatabaseRuntimeConfig({
        DATABASE_URL: result.data,
        DATABASE_POOL_MAX:
            environment['DATABASE_POOL_MAX'],
        DATABASE_IDLE_TIMEOUT_MS:
            environment[
                'DATABASE_IDLE_TIMEOUT_MS'
            ],
        DATABASE_CONNECTION_TIMEOUT_MS:
            environment[
                'DATABASE_CONNECTION_TIMEOUT_MS'
            ],
    });
}

async function withConfiguredTestConnection<T>(
    config: DatabaseRuntimeConfig,
    applicationName: string,
    operation: (
        connection: DatabaseConnection,
    ) => Promise<T>,
): Promise<T> {
    const connection = createDatabaseConnection(
        config,
        {
            applicationName,
        },
    );

    try {
        await connection.verify();

        return await operation(connection);
    } finally {
        await connection.close();
    }
}
