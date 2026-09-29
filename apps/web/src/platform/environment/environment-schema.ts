import { z } from 'zod';

export type EnvironmentSource = Readonly<Record<string, string | undefined>>;

export const runtimeEnvironmentSchema = z.enum(['development', 'test', 'production']);

export const httpOriginSchema = z
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

export function createRuntimeConfigurationError(scope: string, error: z.ZodError): Error {
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
