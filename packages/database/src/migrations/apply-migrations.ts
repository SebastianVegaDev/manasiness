import { fileURLToPath } from 'node:url';

import { migrate } from 'drizzle-orm/node-postgres/migrator';

import type { DatabaseClient } from '../connection/database-client.js';

const migrationsFolder = fileURLToPath(new URL('../../drizzle/', import.meta.url));

export async function applyDatabaseMigrations(database: DatabaseClient): Promise<void> {
    await migrate(database, {
        migrationsFolder,
    });
}
