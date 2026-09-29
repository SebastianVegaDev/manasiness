'use client';

import { useQuery } from '@tanstack/react-query';

import { useTranslations } from '../i18n/localization-provider';
import { apiReadinessQueryOptions } from './api-readiness-query';

export function ApiReadinessStatus() {
    const query = useQuery(apiReadinessQueryOptions);
    const t = useTranslations('health.api');

    if (query.isPending) {
        return <p aria-live="polite">{t('checking')}</p>;
    }

    if (query.isError || query.data.status !== 'ready') {
        return <p aria-live="polite">{t('unavailable')}</p>;
    }

    return <p aria-live="polite">{t('ready')}</p>;
}
