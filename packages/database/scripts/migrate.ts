import {
    applyDatabaseMigrations,
    createDatabaseConnection,
    loadDatabaseRuntimeConfig,
} from '../src/index.js';
import { loadDatabaseToolingEnvironmentFileIfPresent } from './support/tooling-environment.js';

loadDatabaseToolingEnvironmentFileIfPresent();

const config = loadDatabaseRuntimeConfig(process.env);
const connection = createDatabaseConnection(config, {
    applicationName: 'manasiness-migrations',
});

try {
    await connection.verify();
    await applyDatabaseMigrations(connection.db);

    console.info(
        'Database migrations applied successfully.',
    );
} finally {
    await connection.close();
}