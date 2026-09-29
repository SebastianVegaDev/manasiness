export const REDACTED_LOG_VALUE = '[REDACTED]';

export const sensitiveLogPaths = Object.freeze([
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'sessionToken',
    'apiKey',
    'secret',
    'clientSecret',
    'databaseUrl',
    'connectionString',
    'authorization',
    'cookie',

    'credentials.password',
    'credentials.token',
    'credentials.apiKey',
    'credentials.secret',

    'headers.authorization',
    'headers.cookie',

    'req.headers.authorization',
    'req.headers.cookie',

    'request.headers.authorization',
    'request.headers.cookie',

    '*.password',
    '*.passwordHash',
    '*.token',
    '*.accessToken',
    '*.refreshToken',
    '*.sessionToken',
    '*.apiKey',
    '*.secret',
    '*.clientSecret',
    '*.databaseUrl',
    '*.connectionString',
    '*.authorization',
    '*.cookie',
]);

export interface SafeLogError {
    readonly name: string;
    readonly message: string;
    readonly stack?: string;
}

export function toSafeLogError(error: unknown): SafeLogError {
    if (!(error instanceof Error)) {
        return {
            name: 'NonErrorThrown',
            message: 'A non-Error value was thrown.',
        };
    }

    const message = redactSensitiveText(error.message);

    const stack = error.stack === undefined ? undefined : redactSensitiveText(error.stack);

    return {
        name: error.name,
        message,

        ...(stack === undefined
            ? {}
            : {
                  stack,
              }),
    };
}

export function redactSensitiveText(value: string): string {
    return value
        .replace(/(\b[a-z][a-z0-9+.-]*:\/\/[^:\s/@]+:)[^@\s/]+(@)/giu, `$1${REDACTED_LOG_VALUE}$2`)
        .replace(/\b(Bearer)\s+[A-Za-z0-9\-._~+/]+=*/giu, `$1 ${REDACTED_LOG_VALUE}`)
        .replace(/\b(Basic)\s+[A-Za-z0-9+/=]+/giu, `$1 ${REDACTED_LOG_VALUE}`)
        .replace(
            /\b(password|passwd|token|api[_-]?key|secret|client[_-]?secret)=([^&\s]+)/giu,
            `$1=${REDACTED_LOG_VALUE}`,
        );
}
