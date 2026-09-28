import { z } from 'zod';

import { postgresConnectionUrlSchema } from './database-url.js';

export type DatabaseEnvironmentSource = Readonly<
    Record<string, string | undefined>
>;

const databaseEnvironmentSchema = z.object({
    DATABASE_URL: postgresConnectionUrlSchema,

    DATABASE_POOL_MAX: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10),

    DATABASE_IDLE_TIMEOUT_MS: z.coerce
        .number()
        .int()
        .min(0)
        .max(600_000)
        .default(30_000),

    DATABASE_CONNECTION_TIMEOUT_MS: z.coerce
        .number()
        .int()
        .min(1)
        .max(120_000)
        .default(5_000),
});

export interface DatabasePoolRuntimeConfig {
    readonly maxConnections: number;
    readonly idleTimeoutMs: number;
    readonly connectionTimeoutMs: number;
}

export interface DatabaseRuntimeConfig {
    readonly url: string;
    readonly pool: DatabasePoolRuntimeConfig;
}

export function loadDatabaseRuntimeConfig(
    environment: DatabaseEnvironmentSource = process.env,
): DatabaseRuntimeConfig {
    const result = databaseEnvironmentSchema.safeParse({
        DATABASE_URL: environment['DATABASE_URL'],
        DATABASE_POOL_MAX:
            environment['DATABASE_POOL_MAX'],
        DATABASE_IDLE_TIMEOUT_MS:
            environment['DATABASE_IDLE_TIMEOUT_MS'],
        DATABASE_CONNECTION_TIMEOUT_MS:
            environment[
                'DATABASE_CONNECTION_TIMEOUT_MS'
            ],
    });

    if (!result.success) {
        throw createDatabaseConfigurationError(
            result.error,
        );
    }

    const pool =
        Object.freeze<DatabasePoolRuntimeConfig>({
            maxConnections:
                result.data.DATABASE_POOL_MAX,
            idleTimeoutMs:
                result.data.DATABASE_IDLE_TIMEOUT_MS,
            connectionTimeoutMs:
                result.data
                    .DATABASE_CONNECTION_TIMEOUT_MS,
        });

    return Object.freeze<DatabaseRuntimeConfig>({
        url: result.data.DATABASE_URL,
        pool,
    });
}

function createDatabaseConfigurationError(
    error: z.ZodError,
): Error {
    const issues = error.issues
        .map((issue) => {
            const path =
                issue.path.length === 0
                    ? 'database'
                    : issue.path
                          .map((segment) => String(segment))
                          .join('.');

            return `- ${path}: ${issue.message}`;
        })
        .join('\n');

    return new Error(
        `Invalid database runtime configuration:\n${issues}`,
    );
}