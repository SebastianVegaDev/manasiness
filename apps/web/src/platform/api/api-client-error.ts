import type { ApiError } from '@manasiness/contracts';

export type ApiTransportFailure = 'network' | 'timeout';

export class ApiResponseError extends Error {
    override readonly name = 'ApiResponseError';

    constructor(
        readonly status: number,
        readonly requestId: string | undefined,
        readonly apiError: ApiError,
    ) {
        super(apiError.message);
    }
}

export class ApiProtocolError extends Error {
    override readonly name = 'ApiProtocolError';

    constructor(
        readonly status: number | undefined,
        readonly requestId: string | undefined,
        message = 'The API response did not satisfy the expected transport contract.',
        options?: ErrorOptions,
    ) {
        super(message, options);
    }
}

export class ApiTransportError extends Error {
    override readonly name = 'ApiTransportError';

    constructor(
        readonly reason: ApiTransportFailure,
        options?: ErrorOptions,
    ) {
        super(
            reason === 'timeout'
                ? 'The API request timed out.'
                : 'The API request could not be completed.',
            options,
        );
    }
}

export function isRetryableApiClientError(error: unknown): boolean {
    if (error instanceof ApiTransportError) {
        return true;
    }

    if (error instanceof ApiResponseError) {
        return error.status === 408 || error.status === 429 || error.status >= 500;
    }

    return false;
}
