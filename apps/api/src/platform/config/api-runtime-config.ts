import { z } from 'zod';

export type EnvironmentSource = Readonly<Record<string, string | undefined>>;

const runtimeEnvironmentSchema = z.enum(['development', 'test', 'production']);

const runtimeLogLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);

const httpOriginSchema = z
    .url({
        protocol: /^https?$/,
    })
    .refine(
        (value) => {
            const url = new URL(value);

            return (
                url.username.length === 0 &&
                url.password.length === 0 &&
                url.pathname === '/' &&
                url.search.length === 0 &&
                url.hash.length === 0
            );
        },
        {
            error: 'must be an HTTP(S) origin without credentials, path, query, or fragment',
        },
    )
    .transform((value) => new URL(value).origin);

const corsOriginsSchema = z.preprocess((value) => {
    if (value === undefined) {
        return [];
    }

    if (typeof value !== 'string') {
        return value;
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
        return [];
    }

    return trimmedValue.split(',').map((origin) => origin.trim());
}, z.array(httpOriginSchema));

const environmentBooleanSchema = z.preprocess((value) => {
    if (value === undefined) {
        return false;
    }

    if (typeof value !== 'string') {
        return value;
    }

    const normalized = value.trim().toLowerCase();

    if (normalized === 'true') {
        return true;
    }

    if (normalized === 'false') {
        return false;
    }

    return value;
}, z.boolean());

const apiEnvironmentSchema = z
    .object({
        APP_ENV: runtimeEnvironmentSchema,

        API_SERVICE_NAME: z.string().trim().min(1).default('manasiness-api'),

        API_LOG_LEVEL: runtimeLogLevelSchema.default('info'),

        API_LOG_PRETTY: environmentBooleanSchema,

        API_HOST: z.string().trim().min(1).default('127.0.0.1'),

        API_PORT: z.coerce.number().int().min(1).max(65_535).default(3001),

        API_BODY_LIMIT_BYTES: z.coerce
            .number()
            .int()
            .min(1)
            .max(Number.MAX_SAFE_INTEGER)
            .default(1_048_576),

        API_CORS_ORIGINS: corsOriginsSchema,

        API_DOCS_ENABLED: environmentBooleanSchema,

        API_READINESS_TIMEOUT_MS: z.coerce.number().int().min(100).max(10_000).default(2_000),
    })
    .superRefine((value, context) => {
        if (value.API_LOG_PRETTY && value.APP_ENV !== 'development') {
            context.addIssue({
                code: 'custom',

                path: ['API_LOG_PRETTY'],

                message: 'may only be enabled in development',
            });
        }
    });

export type RuntimeEnvironment = z.infer<typeof runtimeEnvironmentSchema>;

export type RuntimeLogLevel = z.infer<typeof runtimeLogLevelSchema>;

export interface ApiServiceRuntimeConfig {
    readonly name: string;
}

export interface ApiLoggingRuntimeConfig {
    readonly level: RuntimeLogLevel;

    readonly pretty: boolean;
}

export interface ApiHttpRuntimeConfig {
    readonly host: string;

    readonly port: number;

    readonly bodyLimitBytes: number;

    readonly corsOrigins: readonly string[];
}

export interface ApiDocumentationRuntimeConfig {
    readonly enabled: boolean;
}

export interface ApiHealthRuntimeConfig {
    readonly readinessTimeoutMs: number;
}

export interface ApiRuntimeConfig {
    readonly environment: RuntimeEnvironment;

    readonly service: ApiServiceRuntimeConfig;

    readonly logging: ApiLoggingRuntimeConfig;

    readonly http: ApiHttpRuntimeConfig;

    readonly documentation: ApiDocumentationRuntimeConfig;

    readonly health: ApiHealthRuntimeConfig;
}

export function loadApiRuntimeConfig(
    environment: EnvironmentSource = process.env,
): ApiRuntimeConfig {
    const result = apiEnvironmentSchema.safeParse({
        APP_ENV: environment['APP_ENV'],

        API_SERVICE_NAME: environment['API_SERVICE_NAME'],

        API_LOG_LEVEL: environment['API_LOG_LEVEL'],

        API_LOG_PRETTY: environment['API_LOG_PRETTY'],

        API_HOST: environment['API_HOST'],

        API_PORT: environment['API_PORT'],

        API_BODY_LIMIT_BYTES: environment['API_BODY_LIMIT_BYTES'],

        API_CORS_ORIGINS: environment['API_CORS_ORIGINS'],

        API_DOCS_ENABLED: environment['API_DOCS_ENABLED'],

        API_READINESS_TIMEOUT_MS: environment['API_READINESS_TIMEOUT_MS'],
    });

    if (!result.success) {
        throw createRuntimeConfigurationError('API', result.error);
    }

    const corsOrigins = Object.freeze([...new Set(result.data.API_CORS_ORIGINS)]);

    return Object.freeze<ApiRuntimeConfig>({
        environment: result.data.APP_ENV,

        service: Object.freeze({
            name: result.data.API_SERVICE_NAME,
        }),

        logging: Object.freeze({
            level: result.data.API_LOG_LEVEL,

            pretty: result.data.API_LOG_PRETTY,
        }),

        http: Object.freeze({
            host: result.data.API_HOST,

            port: result.data.API_PORT,

            bodyLimitBytes: result.data.API_BODY_LIMIT_BYTES,

            corsOrigins,
        }),

        documentation: Object.freeze({
            enabled: result.data.API_DOCS_ENABLED,
        }),

        health: Object.freeze({
            readinessTimeoutMs: result.data.API_READINESS_TIMEOUT_MS,
        }),
    });
}

function createRuntimeConfigurationError(scope: string, error: z.ZodError): Error {
    const issues = error.issues
        .map((issue) => {
            const path =
                issue.path.length === 0
                    ? 'environment'
                    : issue.path.map((segment) => String(segment)).join('.');

            return `- ${path}: ${issue.message}`;
        })
        .join('\n');

    return new Error(`Invalid ${scope} runtime configuration:\n${issues}`);
}
