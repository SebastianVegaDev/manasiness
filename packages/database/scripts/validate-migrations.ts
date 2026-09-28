import {
    applyDatabaseMigrations,
    createDatabaseConnection,
    loadDatabaseRuntimeConfig,
} from '../src/index.js';
import {
    assertSafeMigrationValidationTarget,
    readDatabaseToolingUrl,
} from './support/database-safety.js';
import { resetDatabaseSchemas } from './support/reset-database-schemas.js';
import { loadDatabaseToolingEnvironmentFileIfPresent } from './support/tooling-environment.js';

loadDatabaseToolingEnvironmentFileIfPresent();

const databaseUrl = readDatabaseToolingUrl(
    process.env,
    'DATABASE_MIGRATION_VALIDATION_URL',
);

assertSafeMigrationValidationTarget(databaseUrl);

const config = loadDatabaseRuntimeConfig({
    DATABASE_URL: databaseUrl,
    DATABASE_POOL_MAX: '2',
    DATABASE_IDLE_TIMEOUT_MS: '5000',
    DATABASE_CONNECTION_TIMEOUT_MS: '5000',
});

await resetDatabaseSchemas(databaseUrl);

const connection = createDatabaseConnection(config, {
    applicationName:
        'manasiness-migration-validation',
});

try {
    await connection.verify();

    await applyDatabaseMigrations(connection.db);

    await connection.verify();

    console.info(
        'Complete migration history applied successfully to a clean validation database.',
    );
} finally {
    await connection.close();
}