import {
    applyDatabaseMigrations,
    createDatabaseConnection,
    loadDatabaseRuntimeConfig,
} from '../src/index.js';
import {
    assertSafeTestResetTarget,
    readDatabaseToolingUrl,
} from './support/database-safety.js';
import { resetDatabaseSchemas } from './support/reset-database-schemas.js';
import { loadDatabaseToolingEnvironmentFileIfPresent } from './support/tooling-environment.js';

loadDatabaseToolingEnvironmentFileIfPresent();

const databaseUrl = readDatabaseToolingUrl(
    process.env,
    'DATABASE_TEST_URL',
);

assertSafeTestResetTarget(databaseUrl);

const config = loadDatabaseRuntimeConfig({
    DATABASE_URL: databaseUrl,
    DATABASE_POOL_MAX:
        process.env['DATABASE_POOL_MAX'],
    DATABASE_IDLE_TIMEOUT_MS:
        process.env['DATABASE_IDLE_TIMEOUT_MS'],
    DATABASE_CONNECTION_TIMEOUT_MS:
        process.env[
            'DATABASE_CONNECTION_TIMEOUT_MS'
        ],
});

await resetDatabaseSchemas(databaseUrl);

const connection = createDatabaseConnection(config, {
    applicationName: 'manasiness-test-reset',
});

try {
    await connection.verify();
    await applyDatabaseMigrations(connection.db);

    console.info(
        'Test database reset and migrations completed successfully.',
    );
} finally {
    await connection.close();
}