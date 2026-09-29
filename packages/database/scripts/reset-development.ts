import {
    applyDatabaseMigrations,
    createDatabaseConnection,
    loadDatabaseRuntimeConfig,
} from '../src/index.js';
import {
    assertSafeDevelopmentResetTarget,
    readDatabaseToolingUrl,
} from './support/database-safety.js';
import { resetDatabaseSchemas } from './support/reset-database-schemas.js';
import { loadDatabaseToolingEnvironmentFileIfPresent } from './support/tooling-environment.js';

loadDatabaseToolingEnvironmentFileIfPresent();

const databaseUrl = readDatabaseToolingUrl(process.env, 'DATABASE_URL');

assertSafeDevelopmentResetTarget(databaseUrl);

const config = loadDatabaseRuntimeConfig(process.env);

await resetDatabaseSchemas(databaseUrl);

const connection = createDatabaseConnection(config, {
    applicationName: 'manasiness-development-reset',
});

try {
    await connection.verify();
    await applyDatabaseMigrations(connection.db);

    console.info('Development database reset and migrations completed successfully.');
} finally {
    await connection.close();
}
