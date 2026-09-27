import { URL } from 'node:url';

export interface ApiBootstrapOptions {
    readonly host: string;
    readonly port: number;
    readonly bodyLimitBytes: number;
    readonly corsOrigins: readonly string[];
}

const DEFAULT_API_HOST = '127.0.0.1';
const DEFAULT_API_PORT = 3001;
const DEFAULT_BODY_LIMIT_BYTES = 1_048_576;

const MINIMUM_PORT = 1;
const MAXIMUM_PORT = 65_535;
const MINIMUM_BODY_LIMIT_BYTES = 1;

export function readApiBootstrapOptions(
    environment: NodeJS.ProcessEnv,
): ApiBootstrapOptions {
    return {
        host: readHost(environment['API_HOST']),
        port: readIntegerInRange(
            environment['API_PORT'],
            'API_PORT',
            DEFAULT_API_PORT,
            MINIMUM_PORT,
            MAXIMUM_PORT,
        ),
        bodyLimitBytes: readIntegerInRange(
            environment['API_BODY_LIMIT_BYTES'],
            'API_BODY_LIMIT_BYTES',
            DEFAULT_BODY_LIMIT_BYTES,
            MINIMUM_BODY_LIMIT_BYTES,
            Number.MAX_SAFE_INTEGER,
        ),
        corsOrigins: readCorsOrigins(environment['API_CORS_ORIGINS']),
    };
}

function readHost(value: string | undefined): string {
    const host = value?.trim();

    return host === undefined || host.length === 0 ? DEFAULT_API_HOST : host;
}

function readIntegerInRange(
    rawValue: string | undefined,
    variableName: string,
    defaultValue: number,
    minimum: number,
    maximum: number,
): number {
    const value = rawValue?.trim();

    if (value === undefined || value.length === 0) {
        return defaultValue;
    }

    if (!/^\d+$/.test(value)) {
        throw new Error(`${variableName} must contain an integer value.`);
    }

    const parsedValue = Number(value);

    if (
        !Number.isSafeInteger(parsedValue) ||
        parsedValue < minimum ||
        parsedValue > maximum
    ) {
        throw new Error(
            `${variableName} must be an integer between ${String(minimum)} and ${String(maximum)}.`,
        );
    }

    return parsedValue;
}

function readCorsOrigins(rawValue: string | undefined): readonly string[] {
    const value = rawValue?.trim();

    if (value === undefined || value.length === 0) {
        return [];
    }

    const origins = value
        .split(',')
        .map((candidate) => candidate.trim())
        .map(normalizeCorsOrigin);

    return [...new Set(origins)];
}

function normalizeCorsOrigin(candidate: string): string {
    if (candidate.length === 0) {
        throw new Error('API_CORS_ORIGINS cannot contain empty origins.');
    }

    let parsedUrl: URL;

    try {
        parsedUrl = new URL(candidate);
    } catch {
        throw new Error(`Invalid API_CORS_ORIGINS origin: ${candidate}.`);
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error(
            `API_CORS_ORIGINS only accepts HTTP or HTTPS origins: ${candidate}.`,
        );
    }

    if (
        parsedUrl.username.length > 0 ||
        parsedUrl.password.length > 0 ||
        parsedUrl.pathname !== '/' ||
        parsedUrl.search.length > 0 ||
        parsedUrl.hash.length > 0
    ) {
        throw new Error(
            `API_CORS_ORIGINS must contain origins only, without credentials, paths, query strings, or fragments: ${candidate}.`,
        );
    }

    return parsedUrl.origin;
}
