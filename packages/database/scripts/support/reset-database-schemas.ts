import { Client } from 'pg';

export async function resetDatabaseSchemas(
    connectionUrl: string,
): Promise<void> {
    const client = new Client({
        connectionString: connectionUrl,
    });

    await client.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            'DROP SCHEMA IF EXISTS drizzle CASCADE',
        );

        await client.query(
            'DROP SCHEMA IF EXISTS public CASCADE',
        );

        await client.query(
            'CREATE SCHEMA public',
        );

        await client.query('COMMIT');
    } catch (error: unknown) {
        await client
            .query('ROLLBACK')
            .catch(() => undefined);

        throw error;
    } finally {
        await client.end();
    }
}