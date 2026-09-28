import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import type { DatabaseRuntimeConfig } from '../config/database-runtime-config.js';

export interface CreateDatabaseConnectionOptions {
    readonly applicationName?: string;
}

export function createDatabaseConnection(
    config: DatabaseRuntimeConfig,
    options: CreateDatabaseConnectionOptions = {},
) {
    const pool = new Pool({
        connectionString: config.url,
        max: config.pool.maxConnections,
        idleTimeoutMillis: config.pool.idleTimeoutMs,
        connectionTimeoutMillis:
            config.pool.connectionTimeoutMs,
        ...(options.applicationName === undefined
            ? {}
            : {
                  application_name:
                      options.applicationName,
              }),
    });

    const db = drizzle({
        client: pool,
    });

    let closed = false;

    return Object.freeze({
        db,

        async verify(): Promise<void> {
            if (closed) {
                throw new Error(
                    'Cannot verify a closed database connection.',
                );
            }

            await pool.query('SELECT 1');
        },

        async close(): Promise<void> {
            if (closed) {
                return;
            }

            closed = true;

            await pool.end();
        },
    });
}

export type DatabaseConnection = ReturnType<
    typeof createDatabaseConnection
>;

export type DatabaseClient = DatabaseConnection['db'];