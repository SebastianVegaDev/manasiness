import { apiErrorResponseSchema } from '@manasiness/contracts';
import type { ZodType } from 'zod';

import { ApiProtocolError, ApiResponseError, ApiTransportError } from './api-client-error';

const DEFAULT_API_TIMEOUT_MS = 10_000;

const REQUEST_ID_HEADER = 'x-request-id';

export type ApiHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiClientConfiguration {
    readonly origin: string;

    readonly fetchImplementation?: typeof fetch;

    readonly defaultHeaders?: HeadersInit;

    readonly credentials?: RequestCredentials;

    readonly defaultTimeoutMs?: number;
}

export interface ApiRequestOptions<TResponse> {
    readonly path: string;

    readonly responseSchema: ZodType<TResponse>;

    readonly method?: ApiHttpMethod;

    readonly body?: unknown;

    readonly headers?: HeadersInit;

    readonly signal?: AbortSignal;

    readonly timeoutMs?: number;

    readonly acceptedStatuses?: readonly number[];
}

export interface ApiClient {
    request<TResponse>(options: ApiRequestOptions<TResponse>): Promise<TResponse>;
}

export function createApiClient(configuration: ApiClientConfiguration): ApiClient {
    const origin = normalizeApiOrigin(configuration.origin);

    const fetchImplementation = configuration.fetchImplementation ?? globalThis.fetch;

    const credentials = configuration.credentials ?? 'include';

    const defaultTimeoutMs = configuration.defaultTimeoutMs ?? DEFAULT_API_TIMEOUT_MS;

    assertValidTimeout(defaultTimeoutMs);

    return Object.freeze({
        async request<TResponse>(options: ApiRequestOptions<TResponse>): Promise<TResponse> {
            const method = options.method ?? 'GET';

            assertRequestBodyAllowed(method, options.body);

            const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;

            assertValidTimeout(timeoutMs);

            const url = createRequestUrl(origin, options.path);

            const body = serializeRequestBody(options.body);

            const headers = createRequestHeaders(
                configuration.defaultHeaders,
                options.headers,
                body !== undefined,
            );

            const abortContext = createRequestAbortContext(options.signal, timeoutMs);

            try {
                const response = await fetchImplementation(url, {
                    method,
                    headers,
                    credentials,
                    cache: 'no-store',
                    redirect: 'error',
                    signal: abortContext.signal,

                    ...(body === undefined
                        ? {}
                        : {
                              body,
                          }),
                });

                const payload = await readResponsePayload(response);

                const requestId = getRequestId(response);

                if (!isAcceptedResponse(response, options.acceptedStatuses)) {
                    const errorResult = apiErrorResponseSchema.safeParse(payload);

                    if (errorResult.success) {
                        throw new ApiResponseError(
                            response.status,
                            requestId,
                            errorResult.data.error,
                        );
                    }

                    throw new ApiProtocolError(
                        response.status,
                        requestId,
                        'The API returned a non-success response outside the shared error contract.',
                    );
                }

                const result = options.responseSchema.safeParse(payload);

                if (!result.success) {
                    throw new ApiProtocolError(response.status, requestId);
                }

                return result.data;
            } catch (error: unknown) {
                if (
                    error instanceof ApiResponseError ||
                    error instanceof ApiProtocolError ||
                    error instanceof ApiTransportError
                ) {
                    throw error;
                }

                if (options.signal?.aborted === true) {
                    throw error;
                }

                if (abortContext.didTimeout()) {
                    throw new ApiTransportError('timeout', {
                        cause: error,
                    });
                }

                throw new ApiTransportError('network', {
                    cause: error,
                });
            } finally {
                abortContext.dispose();
            }
        },
    });
}

function normalizeApiOrigin(value: string): string {
    let url: URL;

    try {
        url = new URL(value);
    } catch {
        throw new TypeError('API origin must be a valid URL.');
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new TypeError('API origin must use HTTP or HTTPS.');
    }

    if (
        url.username.length > 0 ||
        url.password.length > 0 ||
        url.pathname !== '/' ||
        url.search.length > 0 ||
        url.hash.length > 0
    ) {
        throw new TypeError('API origin must not contain credentials, path, query, or fragment.');
    }

    return url.origin;
}

function createRequestUrl(origin: string, path: string): string {
    if (!path.startsWith('/') || path.startsWith('//')) {
        throw new TypeError(
            'API request paths must be absolute application paths beginning with one slash.',
        );
    }

    const url = new URL(path, `${origin}/`);

    if (url.origin !== origin) {
        throw new TypeError('API request path must remain within the configured API origin.');
    }

    return url.toString();
}

function serializeRequestBody(body: unknown): string | undefined {
    if (body === undefined) {
        return undefined;
    }

    const serialized: unknown = JSON.stringify(body);

    if (typeof serialized !== 'string') {
        throw new TypeError('API request body must be JSON serializable.');
    }

    return serialized;
}

function createRequestHeaders(
    defaultHeaders: HeadersInit | undefined,
    requestHeaders: HeadersInit | undefined,
    hasBody: boolean,
): Headers {
    const headers = new Headers(defaultHeaders);

    if (requestHeaders !== undefined) {
        new Headers(requestHeaders).forEach((value, name) => {
            headers.set(name, value);
        });
    }

    headers.set('accept', 'application/json');

    if (hasBody) {
        headers.set('content-type', 'application/json');
    }

    return headers;
}

function assertRequestBodyAllowed(method: ApiHttpMethod, body: unknown): void {
    if (method === 'GET' && body !== undefined) {
        throw new TypeError('GET API requests must not contain a request body.');
    }
}

function assertValidTimeout(timeoutMs: number): void {
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
        throw new RangeError('API request timeout must be a positive safe integer.');
    }
}

interface RequestAbortContext {
    readonly signal: AbortSignal;

    didTimeout(): boolean;

    dispose(): void;
}

function createRequestAbortContext(
    externalSignal: AbortSignal | undefined,
    timeoutMs: number,
): RequestAbortContext {
    const timeoutController = new AbortController();

    const timeout = setTimeout(() => {
        timeoutController.abort();
    }, timeoutMs);

    const signal =
        externalSignal === undefined
            ? timeoutController.signal
            : AbortSignal.any([externalSignal, timeoutController.signal]);

    return {
        signal,

        didTimeout() {
            return timeoutController.signal.aborted;
        },

        dispose() {
            clearTimeout(timeout);
        },
    };
}

async function readResponsePayload(response: Response): Promise<unknown> {
    if (response.status === 204 || response.status === 205) {
        return undefined;
    }

    const text = await response.text();

    if (text.trim().length === 0) {
        return undefined;
    }

    try {
        return JSON.parse(text) as unknown;
    } catch (error: unknown) {
        throw new ApiProtocolError(
            response.status,
            getRequestId(response),
            'The API returned a response that was not valid JSON.',
            {
                cause: error,
            },
        );
    }
}

function isAcceptedResponse(
    response: Response,
    acceptedStatuses: readonly number[] | undefined,
): boolean {
    return response.ok || acceptedStatuses?.includes(response.status) === true;
}

function getRequestId(response: Response): string | undefined {
    return response.headers.get(REQUEST_ID_HEADER) ?? undefined;
}
