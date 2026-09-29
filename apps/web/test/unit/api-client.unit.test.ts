import { API_ERROR_CODES, readinessResponseSchema } from '@manasiness/contracts';
import { z } from 'zod';
import { expect, test } from 'vitest';

import { createApiClient } from '../../src/platform/api/api-client';
import {
    ApiProtocolError,
    ApiResponseError,
    ApiTransportError,
} from '../../src/platform/api/api-client-error';

const exampleResponseSchema = z.strictObject({
    value: z.string(),
});

test('API client resolves paths against one configured origin and sends credentialed JSON requests', async () => {
    let requestUrl: string | undefined;

    let requestInit: RequestInit | undefined;

    const fetchImplementation: typeof fetch = (input, init) => {
        requestUrl =
            input instanceof Request ? input.url : input instanceof URL ? input.href : input;

        requestInit = init;

        return Promise.resolve(
            new Response(
                JSON.stringify({
                    value: 'ok',
                }),
                {
                    status: 200,

                    headers: {
                        'content-type': 'application/json',

                        'x-request-id': 'request-123',
                    },
                },
            ),
        );
    };

    const client = createApiClient({
        origin: 'https://api.example.test',

        fetchImplementation,
    });

    const result = await client.request({
        method: 'POST',

        path: '/example?limit=10',

        body: {
            label: 'Example',
        },

        responseSchema: exampleResponseSchema,
    });

    expect(result).toEqual({
        value: 'ok',
    });

    expect(requestUrl).toBe('https://api.example.test/example?limit=10');

    expect(requestInit?.credentials).toBe('include');

    expect(requestInit?.cache).toBe('no-store');

    expect(requestInit?.redirect).toBe('error');

    const headers = new Headers(requestInit?.headers);

    expect(headers.get('accept')).toBe('application/json');

    expect(headers.get('content-type')).toBe('application/json');

    expect(requestInit?.body).toBe(
        JSON.stringify({
            label: 'Example',
        }),
    );
});

test('API client decodes the shared structured error contract', async () => {
    const client = createApiClient({
        origin: 'https://api.example.test',

        fetchImplementation: () =>
            Promise.resolve(
                new Response(
                    JSON.stringify({
                        error: {
                            type: 'conflict',

                            code: API_ERROR_CODES.CONFLICT,

                            message: 'The resource conflicts with existing state.',
                        },
                    }),
                    {
                        status: 409,

                        headers: {
                            'content-type': 'application/json',

                            'x-request-id': 'request-conflict',
                        },
                    },
                ),
            ),
    });

    const operation = client.request({
        path: '/resource',

        responseSchema: exampleResponseSchema,
    });

    const error = await operation.catch((failure: unknown) => failure);

    expect(error).toBeInstanceOf(ApiResponseError);

    expect(error).toMatchObject({
        status: 409,

        requestId: 'request-conflict',

        apiError: {
            type: 'conflict',

            code: API_ERROR_CODES.CONFLICT,
        },
    });
});

test('API client rejects successful responses that violate their transport schema', async () => {
    const client = createApiClient({
        origin: 'https://api.example.test',

        fetchImplementation: () =>
            Promise.resolve(
                new Response(
                    JSON.stringify({
                        wrong: true,
                    }),
                    {
                        status: 200,
                    },
                ),
            ),
    });

    await expect(
        client.request({
            path: '/example',

            responseSchema: exampleResponseSchema,
        }),
    ).rejects.toBeInstanceOf(ApiProtocolError);
});

test('API client supports endpoint-specific accepted non-2xx statuses', async () => {
    const client = createApiClient({
        origin: 'https://api.example.test',

        fetchImplementation: () =>
            Promise.resolve(
                new Response(
                    JSON.stringify({
                        status: 'not_ready',

                        dependencies: {
                            postgresql: 'unavailable',
                        },
                    }),
                    {
                        status: 503,
                    },
                ),
            ),
    });

    const result = await client.request({
        path: '/health/ready',

        responseSchema: readinessResponseSchema,

        acceptedStatuses: [503],
    });

    expect(result).toEqual({
        status: 'not_ready',

        dependencies: {
            postgresql: 'unavailable',
        },
    });
});

test('API client converts request timeout into a transport error', async () => {
    const fetchImplementation: typeof fetch = async (_input, init) => {
        const signal = init?.signal;

        if (signal === undefined || signal === null) {
            throw new Error('Expected an AbortSignal.');
        }

        return await new Promise<Response>((_resolve, reject) => {
            const rejectFromAbort = () => {
                const reason: unknown = signal.reason;

                reject(
                    reason instanceof Error ? reason : new DOMException('Aborted', 'AbortError'),
                );
            };

            if (signal.aborted) {
                rejectFromAbort();
                return;
            }

            signal.addEventListener('abort', rejectFromAbort, {
                once: true,
            });
        });
    };

    const client = createApiClient({
        origin: 'https://api.example.test',

        fetchImplementation,
    });

    const operation = client.request({
        path: '/slow',

        responseSchema: exampleResponseSchema,

        timeoutMs: 10,
    });

    const error = await operation.catch((failure: unknown) => failure);

    expect(error).toBeInstanceOf(ApiTransportError);

    expect(error).toMatchObject({
        reason: 'timeout',
    });
});

test('API client rejects request paths capable of escaping the configured origin', async () => {
    const client = createApiClient({
        origin: 'https://api.example.test',
    });

    await expect(
        client.request({
            path: '//evil.example.test/resource',

            responseSchema: exampleResponseSchema,
        }),
    ).rejects.toThrow(/one slash/u);
});
