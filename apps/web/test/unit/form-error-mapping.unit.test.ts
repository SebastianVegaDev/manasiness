import { expect, test } from 'vitest';

import {
    ApiProtocolError,
    ApiResponseError,
    ApiTransportError,
} from '../../src/platform/api/api-client-error';
import {
    getFieldValidationIssues,
    getUnscopedValidationIssues,
    mapFormSubmissionError,
} from '../../src/platform/forms/form-error-mapping';

test('maps structured API response errors without parsing human messages', () => {
    const failure = mapFormSubmissionError(
        new ApiResponseError(422, 'request-validation', {
            type: 'invalid_input',
            code: 'fixture.validation_failed',
            message: 'Human-readable text is not used for classification.',
            issues: [
                {
                    path: ['displayName'],
                    message: 'Display name is invalid.',
                },
                {
                    path: ['nested', 0, 'value'],
                    message: 'Nested value is invalid.',
                },
                {
                    path: [],
                    message: 'The payload is invalid.',
                },
            ],
        }),
    );

    expect(failure).toMatchObject({
        kind: 'api',
        status: 422,
        errorType: 'invalid_input',
        code: 'fixture.validation_failed',
        requestId: 'request-validation',
    });

    expect(getFieldValidationIssues(failure, 'displayName')).toEqual([
        {
            path: ['displayName'],
            message: 'Display name is invalid.',
        },
    ]);

    expect(getUnscopedValidationIssues(failure, new Set(['displayName']))).toHaveLength(2);
});

test('keeps transport, protocol, and unexpected failures distinct', () => {
    expect(mapFormSubmissionError(new ApiTransportError('timeout'))).toEqual({
        kind: 'transport',
        reason: 'timeout',
        requestId: undefined,
    });

    expect(mapFormSubmissionError(new ApiProtocolError(502, 'request-protocol'))).toEqual({
        kind: 'protocol',
        status: 502,
        requestId: 'request-protocol',
    });

    expect(mapFormSubmissionError(new Error('unexpected'))).toEqual({
        kind: 'unexpected',
        requestId: undefined,
    });
});
