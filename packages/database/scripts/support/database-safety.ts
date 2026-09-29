import { getDatabaseName, postgresConnectionUrlSchema } from '../../src/config/database-url.js';

type EnvironmentSource = Readonly<Record<string, string | undefined>>;

const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export function readDatabaseToolingUrl(
    environment: EnvironmentSource,
    variableName: string,
): string {
    const result = postgresConnectionUrlSchema.safeParse(environment[variableName]);

    if (!result.success) {
        throw new Error(
            `Invalid database tooling configuration:\n- ${variableName}: must be a valid PostgreSQL connection URL.`,
        );
    }

    return result.data;
}

export function assertSafeDevelopmentResetTarget(connectionUrl: string): void {
    const url = new URL(connectionUrl);

    const isLocalHost = loopbackHosts.has(url.hostname);
    const databaseName = getDatabaseName(connectionUrl);

    if (!isLocalHost || databaseName !== 'manasiness_dev') {
        throw new Error(
            'Development reset refused: DATABASE_URL must target the local manasiness_dev database.',
        );
    }
}

export function assertSafeTestResetTarget(connectionUrl: string): void {
    const databaseName = getDatabaseName(connectionUrl);

    if (databaseName !== 'manasiness_test' && !databaseName.startsWith('manasiness_test_')) {
        throw new Error(
            'Test reset refused: DATABASE_TEST_URL must target a dedicated Manasiness test database.',
        );
    }
}

export function assertSafeMigrationValidationTarget(connectionUrl: string): void {
    const databaseName = getDatabaseName(connectionUrl);

    if (
        databaseName !== 'manasiness_migration_validation' &&
        !databaseName.startsWith('manasiness_migration_validation_')
    ) {
        throw new Error(
            'Migration validation refused: DATABASE_MIGRATION_VALIDATION_URL must target a dedicated migration-validation database.',
        );
    }
}
