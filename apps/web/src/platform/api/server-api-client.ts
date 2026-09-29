import 'server-only';

import { loadWebServerRuntimeConfig } from '../environment/server-environment';
import { createApiClient, type ApiClient } from './api-client';

export interface ServerApiRequestContext {
    readonly cookieHeader?: string;

    readonly requestId?: string;
}

export function createServerApiClient(context: ServerApiRequestContext = {}): ApiClient {
    const config = loadWebServerRuntimeConfig();

    const headers = new Headers();

    if (context.cookieHeader !== undefined && context.cookieHeader.length > 0) {
        headers.set('cookie', context.cookieHeader);
    }

    if (context.requestId !== undefined && context.requestId.length > 0) {
        headers.set('x-request-id', context.requestId);
    }

    return createApiClient({
        origin: config.apiOrigin,

        credentials: 'include',

        defaultHeaders: headers,
    });
}
