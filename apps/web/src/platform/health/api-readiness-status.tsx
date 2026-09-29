'use client';

import { useQuery } from '@tanstack/react-query';

import { apiReadinessQueryOptions } from './api-readiness-query';

export function ApiReadinessStatus() {
    const query = useQuery(apiReadinessQueryOptions);

    if (query.isPending) {
        return <p aria-live="polite">API connection: checking.</p>;
    }

    if (query.isError) {
        return <p aria-live="polite">API connection: unavailable.</p>;
    }

    return (
        <p aria-live="polite">
            API connection: {query.data.status === 'ready' ? 'ready.' : 'unavailable.'}
        </p>
    );
}
