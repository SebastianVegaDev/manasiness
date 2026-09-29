import { hostname } from 'node:os';

import pino, {
    type DestinationStream,
    type LoggerOptions,
} from 'pino';
import type { Options as PinoHttpOptions } from 'pino-http';

import {
    REDACTED_LOG_VALUE,
    sensitiveLogPaths,
    toSafeLogError,
} from './log-safety.js';
import {
    REQUEST_ID_HEADER,
    REQUEST_ID_RESPONSE_HEADER,
    resolveRequestId,
} from '../request-context/request-id.js';

export interface ObservabilityOptions {
    readonly serviceName: string;

    readonly environment:
        | 'development'
        | 'test'
        | 'production';

    readonly level:
        | 'debug'
        | 'info'
        | 'warn'
        | 'error';

    readonly pretty: boolean;

    readonly destination?: DestinationStream;
}

export function createPinoLoggerOptions(
    options: ObservabilityOptions,
): LoggerOptions {
    return {
        level: options.level,

        base: {
            service: options.serviceName,
            environment:
                options.environment,
            pid: process.pid,
            hostname: hostname(),
        },

        timestamp:
            pino.stdTimeFunctions.isoTime,

        redact: {
            paths: [
                ...sensitiveLogPaths,
            ],

            censor:
                REDACTED_LOG_VALUE,
        },

        ...createOutputOptions(
            options,
        ),
    };
}

export function createPinoHttpOptions(
    options: ObservabilityOptions,
): PinoHttpOptions {
    return {
        ...createPinoLoggerOptions(
            options,
        ),

        ...(options.destination === undefined
            ? {}
            : {
                stream:
                    options.destination,
            }),

        genReqId: (
            request,
            response,
        ) => {
            const requestId =
                resolveRequestId(
                    request.headers[
                        REQUEST_ID_HEADER
                    ],
                );

            response.setHeader(
                REQUEST_ID_RESPONSE_HEADER,
                requestId,
            );

            return requestId;
        },

        quietReqLogger: true,
        quietResLogger: true,

        customAttributeKeys: {
            reqId: 'requestId',
            responseTime:
                'durationMs',
        },

        serializers: {
            req(request: {
                method?: string;
                url?: string;
                remoteAddress?: string;
            }) {
                return {
                    method:
                        request.method,

                    path:
                        getRequestPath(
                            request.url,
                        ),

                    remoteAddress:
                        request.remoteAddress,
                };
            },

            res(response: {
                statusCode?: number;
            }) {
                return {
                    statusCode:
                        response.statusCode,
                };
            },

            err(error: unknown) {
                return toSafeLogError(
                    error,
                );
            },
        },

        customLogLevel(
            _request,
            response,
            error,
        ) {
            if (
                error !== undefined ||
                response.statusCode >=
                    500
            ) {
                return 'error';
            }

            if (
                response.statusCode >=
                400
            ) {
                return 'warn';
            }

            return 'info';
        },

        customSuccessMessage() {
            return 'HTTP request completed.';
        },

        customErrorMessage() {
            return 'HTTP request failed.';
        },

        autoLogging: {
            ignore(request) {
                return isHealthPath(
                    request.url,
                );
            },
        },
    };
}

function createOutputOptions(
    options: ObservabilityOptions,
): Partial<LoggerOptions> {
    if (
        options.destination !== undefined
    ) {
        return {};
    }

    if (!options.pretty) {
        return {};
    }

    return {
        transport: {
            target: 'pino-pretty',

            options: {
                colorize: true,
                translateTime:
                    'SYS:standard',
                singleLine: false,
                ignore:
                    'pid,hostname',
            },
        },
    };
}

function getRequestPath(
    value: string | undefined,
): string {
    if (value === undefined) {
        return '/';
    }

    try {
        return new URL(
            value,
            'http://manasiness.local',
        ).pathname;
    } catch {
        return value.split('?')[0] ?? '/';
    }
}

function isHealthPath(
    value: string | undefined,
): boolean {
    const path =
        getRequestPath(value);

    return (
        path === '/health/live' ||
        path === '/health/ready'
    );
}
