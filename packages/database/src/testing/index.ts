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

export function loadDatabaseTestRuntimeConfig(
    environment: DatabaseEnvironmentSource = process.env,
): DatabaseRuntimeConfig {
    const result = postgresConnectionUrlSchema.safeParse(
        environment['DATABASE_TEST_URL'],
    );

    if (!result.success) {
        throw new Error(
            'Invalid test database configuration:\n- DATABASE_TEST_URL: must be a valid PostgreSQL connection URL.',
        );
    }

    const databaseName = getDatabaseName(result.data);

    if (
        databaseName !== 'manasiness_test' &&
        !databaseName.startsWith('manasiness_test_')
    ) {
        throw new Error(
            'Refusing test database configuration: DATABASE_TEST_URL must target a dedicated Manasiness test database.',
        );
    }

    return loadDatabaseRuntimeConfig({
        DATABASE_URL: result.data,
        DATABASE_POOL_MAX:
            environment['DATABASE_POOL_MAX'],
        DATABASE_IDLE_TIMEOUT_MS:
            environment['DATABASE_IDLE_TIMEOUT_MS'],
        DATABASE_CONNECTION_TIMEOUT_MS:
            environment[
                'DATABASE_CONNECTION_TIMEOUT_MS'
            ],
    });
}

export async function withDatabaseTestConnection<T>(
    environment: DatabaseEnvironmentSource,
    operation: (
        connection: DatabaseConnection,
    ) => Promise<T>,
): Promise<T> {
    const config =
        loadDatabaseTestRuntimeConfig(environment);

    const connection = createDatabaseConnection(
        config,
        {
            applicationName:
                'manasiness-database-integration-test',
        },
    );

    try {
        await connection.verify();

        return await operation(connection);
    } finally {
        await connection.close();
    }
}