import { z } from 'zod';

export const postgresConnectionUrlSchema = z
    .string()
    .trim()
    .min(1)
    .refine(isValidPostgresConnectionUrl, {
        error:
            'must be a valid PostgreSQL connection URL with an explicit database name',
    });

export function getDatabaseName(
    connectionUrl: string,
): string {
    const url = new URL(connectionUrl);

    return url.pathname.slice(1);
}

function isValidPostgresConnectionUrl(
    value: string,
): boolean {
    let url: URL;

    try {
        url = new URL(value);
    } catch {
        return false;
    }

    const isPostgresProtocol =
        url.protocol === 'postgres:' ||
        url.protocol === 'postgresql:';

    const databaseName = url.pathname.slice(1);

    return (
        isPostgresProtocol &&
        url.hostname.length > 0 &&
        databaseName.length > 0 &&
        !databaseName.includes('/') &&
        url.hash.length === 0
    );
}