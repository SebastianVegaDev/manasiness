import {
    Catch,
    HttpException,
    HttpStatus,
    Logger,
    type ArgumentsHost,
    type ExceptionFilter,
} from '@nestjs/common';

import {
    API_ERROR_CODES,
    apiErrorCodeSchema,
    type ApiErrorResponse,
    type ApiErrorType,
} from '@manasiness/contracts';
import { HttpAdapterHost } from '@nestjs/core';

import {
    ExpectedApplicationError,
    type ExpectedApplicationErrorKind,
} from './expected-application-error.js';
import { TransportValidationException } from './transport-validation.exception.js';

import { toSafeLogError } from '../logging/log-safety.js';

interface MappedApiFailure {
    readonly status: number;

    readonly body: ApiErrorResponse;

    readonly unexpected: boolean;
}

@Catch()
export class ApiExceptionFilter
    implements ExceptionFilter
{
    private readonly logger =
        new Logger(ApiExceptionFilter.name);

    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
    ) {}

    catch(
        exception: unknown,
        host: ArgumentsHost,
    ): void {
        const mapped =
            mapExceptionToApiFailure(exception);

        if (mapped.unexpected) {
            this.logUnexpectedFailure(
                exception,
            );
        }

        const response = host
            .switchToHttp()
            .getResponse<unknown>();

        this.httpAdapterHost.httpAdapter.reply(
            response,
            mapped.body,
            mapped.status,
        );
    }

    private logUnexpectedFailure(
        exception: unknown,
    ): void {
        this.logger.error(
            {
                event:
                    'api.unexpected_request_failure',

                error:
                    toSafeLogError(
                        exception,
                    ),
            },
            'Unexpected API request failure.',
        );
    }
}

function mapExceptionToApiFailure(
    exception: unknown,
): MappedApiFailure {
    if (
        exception instanceof
        TransportValidationException
    ) {
        return {
            status: HttpStatus.BAD_REQUEST,
            body: createErrorResponse({
                type: 'invalid_input',
                code: API_ERROR_CODES.INVALID_INPUT,
                message:
                    'Request validation failed.',
                issues: exception.issues.map(
                    (issue) => ({
                        path: [...issue.path],
                        message: issue.message,
                    }),
                ),
            }),
            unexpected: false,
        };
    }

    if (
        exception instanceof
        ExpectedApplicationError
    ) {
        const codeResult =
            apiErrorCodeSchema.safeParse(
                exception.code,
            );

        if (!codeResult.success) {
            return createInternalFailure();
        }

        const mapping =
            mapExpectedApplicationKind(
                exception.kind,
            );

        return {
            status: mapping.status,
            body: createErrorResponse({
                type: mapping.type,
                code: codeResult.data,
                message:
                    exception.publicMessage,
            }),
            unexpected: false,
        };
    }

    const httpStatus =
        readHttpStatus(exception);

    if (httpStatus !== undefined) {
        return mapHttpStatus(httpStatus);
    }

    return createInternalFailure();
}

function mapExpectedApplicationKind(
    kind: ExpectedApplicationErrorKind,
): {
    readonly status: number;
    readonly type: ApiErrorType;
} {
    switch (kind) {
        case 'unauthenticated':
            return {
                status:
                    HttpStatus.UNAUTHORIZED,
                type: 'unauthenticated',
            };

        case 'unauthorized':
            return {
                status:
                    HttpStatus.FORBIDDEN,
                type: 'unauthorized',
            };

        case 'not_found':
            return {
                status:
                    HttpStatus.NOT_FOUND,
                type: 'not_found',
            };

        case 'conflict':
            return {
                status:
                    HttpStatus.CONFLICT,
                type: 'conflict',
            };

        case 'business_rejection':
            return {
                status:
                    HttpStatus.UNPROCESSABLE_ENTITY,
                type: 'business_rejection',
            };

        case 'rate_limited':
            return {
                status:
                    HttpStatus.TOO_MANY_REQUESTS,
                type: 'rate_limited',
            };
    }
}

function mapHttpStatus(
    status: number,
): MappedApiFailure {
    switch (status) {
        case 400:
            return expectedHttpFailure(
                status,
                'invalid_input',
                API_ERROR_CODES.INVALID_INPUT,
                'Request validation failed.',
            );

        case 401:
            return expectedHttpFailure(
                status,
                'unauthenticated',
                API_ERROR_CODES.UNAUTHENTICATED,
                'Authentication is required.',
            );

        case 403:
            return expectedHttpFailure(
                status,
                'unauthorized',
                API_ERROR_CODES.UNAUTHORIZED,
                'You are not allowed to perform this operation.',
            );

        case 404:
            return expectedHttpFailure(
                status,
                'not_found',
                API_ERROR_CODES.NOT_FOUND,
                'The requested resource was not found.',
            );

        case 409:
            return expectedHttpFailure(
                status,
                'conflict',
                API_ERROR_CODES.CONFLICT,
                'The request conflicts with the current resource state.',
            );

        case 413:
            return expectedHttpFailure(
                status,
                'invalid_input',
                API_ERROR_CODES.PAYLOAD_TOO_LARGE,
                'The request payload is too large.',
            );

        case 422:
            return expectedHttpFailure(
                status,
                'business_rejection',
                API_ERROR_CODES.BUSINESS_REJECTION,
                'The operation could not be completed.',
            );

        case 429:
            return expectedHttpFailure(
                status,
                'rate_limited',
                API_ERROR_CODES.RATE_LIMITED,
                'Too many requests.',
            );

        default:
            if (
                status >= 400 &&
                status < 500
            ) {
                return expectedHttpFailure(
                    status,
                    'invalid_input',
                    API_ERROR_CODES.REQUEST_REJECTED,
                    'The request could not be accepted.',
                );
            }

            return createInternalFailure();
    }
}

function expectedHttpFailure(
    status: number,
    type: ApiErrorType,
    code: string,
    message: string,
): MappedApiFailure {
    return {
        status,
        body: createErrorResponse({
            type,
            code,
            message,
        }),
        unexpected: false,
    };
}

function createInternalFailure(): MappedApiFailure {
    return {
        status:
            HttpStatus.INTERNAL_SERVER_ERROR,

        body: createErrorResponse({
            type: 'internal_error',
            code: API_ERROR_CODES.INTERNAL_ERROR,
            message:
                'An unexpected internal error occurred.',
        }),

        unexpected: true,
    };
}

interface ErrorResponseInput {
    readonly type: ApiErrorType;

    readonly code: string;

    readonly message: string;

    readonly issues?: readonly {
        readonly path: readonly (
            | string
            | number
        )[];

        readonly message: string;
    }[];
}

function createErrorResponse(
    input: ErrorResponseInput,
): ApiErrorResponse {
    return {
        error: {
            type: input.type,
            code: input.code,
            message: input.message,

            ...(input.issues === undefined
                ? {}
                : {
                      issues:
                          input.issues.map(
                              (issue) => ({
                                  path: [
                                      ...issue.path,
                                  ],
                                  message:
                                      issue.message,
                              }),
                          ),
                  }),
        },
    };
}

function readHttpStatus(
    exception: unknown,
): number | undefined {
    if (exception instanceof HttpException) {
        return exception.getStatus();
    }

    if (
        typeof exception !== 'object' ||
        exception === null
    ) {
        return undefined;
    }

    const candidate =
        exception as {
            readonly status?: unknown;
            readonly statusCode?: unknown;
        };

    if (
        isHttpErrorStatus(
            candidate.statusCode,
        )
    ) {
        return candidate.statusCode;
    }

    if (isHttpErrorStatus(candidate.status)) {
        return candidate.status;
    }

    return undefined;
}

function isHttpErrorStatus(
    value: unknown,
): value is number {
    return (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= 400 &&
        value <= 599
    );
}
