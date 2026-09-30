import { getTranslations } from '../platform/i18n/server';
import {
    PageContainer,
    PageDescription,
    PageEyebrow,
    PageHeader,
    PageHeading,
    PageSection,
    PageTitle,
} from '../platform/shell/page-layout';
import { Badge } from '../platform/ui';
import styles from './overview-foundation.module.css';

export interface OverviewFoundationProps {
    readonly organizationScoped?: boolean;
}

export async function OverviewFoundation({ organizationScoped = false }: OverviewFoundationProps) {
    const t = await getTranslations('overviewFoundation');

    return (
        <PageContainer>
            <PageHeader>
                <PageHeading>
                    <PageEyebrow>{t('eyebrow')}</PageEyebrow>
                    <PageTitle id="overview-title">{t('title')}</PageTitle>
                    <PageDescription>{t('description')}</PageDescription>
                </PageHeading>
            </PageHeader>

            <PageSection aria-labelledby="foundation-status-title">
                <div className={styles['leadCard']}>
                    <div className={styles['cardHeader']}>
                        <h2 id="foundation-status-title">{t('foundation.title')}</h2>
                        <Badge tone="success">{t('foundation.badge')}</Badge>
                    </div>
                    <p>{t('foundation.body')}</p>
                </div>
            </PageSection>

            <div className={styles['supportGrid']}>
                <section
                    className={styles['supportCard']}
                    aria-labelledby="organization-status-title"
                >
                    <div className={styles['cardHeader']}>
                        <h2 id="organization-status-title">{t('organization.title')}</h2>
                        <Badge tone="neutral">
                            {organizationScoped
                                ? t('organization.scopedBadge')
                                : t('organization.deferredBadge')}
                        </Badge>
                    </div>
                    <p>
                        {organizationScoped
                            ? t('organization.scopedBody')
                            : t('organization.unscopedBody')}
                    </p>
                </section>

                <section className={styles['supportCard']} aria-labelledby="domains-status-title">
                    <div className={styles['cardHeader']}>
                        <h2 id="domains-status-title">{t('domains.title')}</h2>
                        <Badge tone="neutral">{t('domains.badge')}</Badge>
                    </div>
                    <p>{t('domains.body')}</p>
                </section>
            </div>
        </PageContainer>
    );
}
