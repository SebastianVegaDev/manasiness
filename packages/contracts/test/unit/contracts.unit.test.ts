import { expect, test } from 'vitest';

import {
    API_ERROR_CODES,
    apiErrorResponseSchema,
    contractExampleQuerySchema,
    contractExampleRequestSchema,
    entityIdTransportSchema,
    livenessResponseSchema,
    readinessResponseSchema,
} from '../../src/index.js';

const canonicalUuidV7 = '0199f421-55a4-7c8d-9cab-12d9e50ce741';

test('entity transport identifiers require UUIDv7', () => {
    expect(entityIdTransportSchema.parse(canonicalUuidV7)).toBe(canonicalUuidV7);

    expect(() => entityIdTransportSchema.parse('550e8400-e29b-41d4-a716-446655440000')).toThrow();
});

test('query contracts transform external values into handler values', () => {
    const result = contractExampleQuerySchema.parse({
        limit: '7',
    });

    expect(result.limit).toBe(7);
});

test('request contracts reject unknown fields', () => {
    expect(() =>
        contractExampleRequestSchema.parse({
            label: 'Example',

            unexpected: true,
        }),
    ).toThrow();
});

test('API error response accepts the stable foundation shape', () => {
    const result = apiErrorResponseSchema.parse({
        error: {
            type: 'invalid_input',

            code: API_ERROR_CODES.INVALID_INPUT,

            message: 'Request validation failed.',

            issues: [
                {
                    path: ['email'],

                    message: 'Invalid email address.',
                },
            ],
        },
    });

    expect(result.error.code).toBe('transport.invalid_input');
});

test('API error codes require machine-readable namespaces', () => {
    expect(() =>
        apiErrorResponseSchema.parse({
            error: {
                type: 'business_rejection',

                code: 'Something went wrong',

                message: 'Rejected.',
            },
        }),
    ).toThrow();
});

test('liveness contract accepts only the stable response', () => {
    expect(
        livenessResponseSchema.parse({
            status: 'ok',
        }),
    ).toEqual({
        status: 'ok',
    });

    expect(() =>
        livenessResponseSchema.parse({
            status: 'healthy',
        }),
    ).toThrow();
});

test('readiness contract supports required dependency states', () => {
    expect(
        readinessResponseSchema.parse({
            status: 'ready',

            dependencies: {
                postgresql: 'ready',
            },
        }),
    ).toEqual({
        status: 'ready',

        dependencies: {
            postgresql: 'ready',
        },
    });

    expect(
        readinessResponseSchema.parse({
            status: 'not_ready',

            dependencies: {
                postgresql: 'unavailable',
            },
        }),
    ).toEqual({
        status: 'not_ready',

        dependencies: {
            postgresql: 'unavailable',
        },
    });
});
