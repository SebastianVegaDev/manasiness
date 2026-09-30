import type { ApiErrorType } from '@manasiness/contracts';

import {
    ApiProtocolError,
    ApiResponseError,
    ApiTransportError,
    isRetryableApiClientError,
} from '../api/api-client-error';

export type FeedbackFailureKind = ApiErrorType | 'network' | 'timeout' | 'protocol' | 'unexpected';

export type FeedbackFailureSource = 'api' | 'transport' | 'protocol' | 'unexpected';

export interface FeedbackFailure {
    readonly kind: FeedbackFailureKind;
    readonly source: FeedbackFailureSource;
    readonly status: number | undefined;
    readonly code: string | undefined;
    readonly requestId: string | undefined;
    readonly retryable: boolean;
}

export function classifyApiClientFailure(error: unknown): FeedbackFailure {
    if (error instanceof ApiResponseError) {
        return {
            kind: error.apiError.type,
            source: 'api',
            status: error.status,
            code: error.apiError.code,
            requestId: error.requestId,
            retryable: isRetryableApiClientError(error),
        };
    }

    if (error instanceof ApiTransportError) {
        return {
            kind: error.reason,
            source: 'transport',
            status: undefined,
            code: undefined,
            requestId: undefined,
            retryable: true,
        };
    }

    if (error instanceof ApiProtocolError) {
        return {
            kind: 'protocol',
            source: 'protocol',
            status: error.status,
            code: undefined,
            requestId: error.requestId,
            retryable: false,
        };
    }

    return {
        kind: 'unexpected',
        source: 'unexpected',
        status: undefined,
        code: undefined,
        requestId: undefined,
        retryable: false,
    };
}
