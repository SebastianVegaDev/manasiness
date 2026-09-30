import type { ApiErrorType } from '@manasiness/contracts';
import { describe, expect, test } from 'vitest';

import {
    ApiProtocolError,
    ApiResponseError,
    ApiTransportError,
} from '../../src/platform/api/api-client-error';
import { classifyApiClientFailure } from '../../src/platform/feedback/feedback-failure';

const API_CASES: readonly {
    type: ApiErrorType;
    status: number;
    retryable: boolean;
}[] = [
    { type: 'invalid_input', status: 400, retryable: false },
    { type: 'unauthenticated', status: 401, retryable: false },
    { type: 'unauthorized', status: 403, retryable: false },
    { type: 'not_found', status: 404, retryable: false },
    { type: 'conflict', status: 409, retryable: false },
    { type: 'business_rejection', status: 422, retryable: false },
    { type: 'rate_limited', status: 429, retryable: true },
    { type: 'internal_error', status: 500, retryable: true },
];

describe('classifyApiClientFailure', () => {
    test.each(API_CASES)('preserves broad API type $type without parsing human copy', (entry) => {
        const failure = classifyApiClientFailure(
            new ApiResponseError(entry.status, 'request-test-001', {
                type: entry.type,
                code: `test.${entry.type}`,
                message: 'Human-readable API copy must not drive classification.',
            }),
        );

        expect(failure).toEqual({
            kind: entry.type,
            source: 'api',
            status: entry.status,
            code: `test.${entry.type}`,
            requestId: 'request-test-001',
            retryable: entry.retryable,
        });
    });

    test.each(['network', 'timeout'] as const)(
        'keeps %s transport failures retryable',
        (reason) => {
            expect(classifyApiClientFailure(new ApiTransportError(reason))).toEqual({
                kind: reason,
                source: 'transport',
                status: undefined,
                code: undefined,
                requestId: undefined,
                retryable: true,
            });
        },
    );

    test('keeps protocol failures distinct and non-retryable by default', () => {
        expect(classifyApiClientFailure(new ApiProtocolError(502, 'request-test-002'))).toEqual({
            kind: 'protocol',
            source: 'protocol',
            status: 502,
            code: undefined,
            requestId: 'request-test-002',
            retryable: false,
        });
    });

    test('maps unknown exceptions to an opaque unexpected failure', () => {
        expect(classifyApiClientFailure(new Error('private technical detail'))).toEqual({
            kind: 'unexpected',
            source: 'unexpected',
            status: undefined,
            code: undefined,
            requestId: undefined,
            retryable: false,
        });
    });
});
