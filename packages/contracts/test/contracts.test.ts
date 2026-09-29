import assert from 'node:assert/strict';
import test from 'node:test';

import {
    API_ERROR_CODES,
    apiErrorResponseSchema,
    contractExampleQuerySchema,
    contractExampleRequestSchema,
    entityIdTransportSchema,
} from '../src/index.js';

const canonicalUuidV7 =
    '0199f421-55a4-7c8d-9cab-12d9e50ce741';

void test('entity transport identifiers require UUIDv7', () => {
    assert.equal(
        entityIdTransportSchema.parse(
            canonicalUuidV7,
        ),
        canonicalUuidV7,
    );

    assert.throws(() =>
        entityIdTransportSchema.parse(
            '550e8400-e29b-41d4-a716-446655440000',
        ),
    );
});

void test('query contracts transform external values into handler values', () => {
    const result =
        contractExampleQuerySchema.parse({
            limit: '7',
        });

    assert.equal(result.limit, 7);
});

void test('request contracts reject unknown fields', () => {
    assert.throws(() =>
        contractExampleRequestSchema.parse({
            label: 'Example',
            unexpected: true,
        }),
    );
});

void test('API error response accepts the stable foundation shape', () => {
    const result = apiErrorResponseSchema.parse({
        error: {
            type: 'invalid_input',
            code: API_ERROR_CODES.INVALID_INPUT,
            message: 'Request validation failed.',
            issues: [
                {
                    path: ['email'],
                    message:
                        'Invalid email address.',
                },
            ],
        },
    });

    assert.equal(
        result.error.code,
        'transport.invalid_input',
    );
});

void test('API error codes require machine-readable namespaces', () => {
    assert.throws(() =>
        apiErrorResponseSchema.parse({
            error: {
                type: 'business_rejection',
                code: 'Something went wrong',
                message: 'Rejected.',
            },
        }),
    );
});
