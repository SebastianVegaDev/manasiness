import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool, PoolClient } from 'pg';

type NodePostgresClient = Pool | PoolClient;

export function createDatabaseClient(
    client: NodePostgresClient,
) {
    return drizzle({
        client,
    });
}

export type DatabaseClient = ReturnType<
    typeof createDatabaseClient
>;