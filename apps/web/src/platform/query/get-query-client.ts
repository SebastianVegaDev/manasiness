import { environmentManager, QueryClient } from '@tanstack/react-query';

import { isRetryableApiClientError } from '../api/api-client-error';

const DEFAULT_STALE_TIME_MS = 30_000;

const DEFAULT_GARBAGE_COLLECTION_MS = 5 * 60_000;

const MAX_QUERY_RETRIES = 2;

function makeQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: DEFAULT_STALE_TIME_MS,

                gcTime: DEFAULT_GARBAGE_COLLECTION_MS,

                retry(failureCount, error) {
                    return failureCount < MAX_QUERY_RETRIES && isRetryableApiClientError(error);
                },
            },

            mutations: {
                retry: false,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
    if (environmentManager.isServer()) {
        return makeQueryClient();
    }

    browserQueryClient ??= makeQueryClient();

    return browserQueryClient;
}
