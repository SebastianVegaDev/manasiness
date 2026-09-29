'use client';

import { queryOptions } from '@tanstack/react-query';

import { readinessResponseSchema } from '@manasiness/contracts';

import { browserApiClient } from '../api/browser-api-client';

export const apiReadinessQueryKey = ['platform', 'health', 'readiness'] as const;

export const apiReadinessQueryOptions = queryOptions({
    queryKey: apiReadinessQueryKey,

    queryFn: ({ signal }) =>
        browserApiClient.request({
            path: '/health/ready',

            responseSchema: readinessResponseSchema,

            signal,

            timeoutMs: 5_000,

            acceptedStatuses: [503],
        }),

    staleTime: 15_000,
});
