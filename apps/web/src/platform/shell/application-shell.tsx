import type { ReactNode } from 'react';

import { getTranslations } from '../i18n/server';
import { ApplicationNavigation } from './application-navigation';
import styles from './application-shell.module.css';

export interface ApplicationShellProps {
    readonly children: ReactNode;
    readonly organizationId?: string;
}

export async function ApplicationShell({ children, organizationId }: ApplicationShellProps) {
    const t = await getTranslations('shell');

    return (
        <div className={styles['shell']}>
            <a className={styles['skipLink']} href="#main-content">
                {t('skipToContent')}
            </a>

            <ApplicationNavigation organizationId={organizationId} />

            <div className={styles['content']}>
                <main id="main-content" className={styles['main']} tabIndex={-1}>
                    {children}
                </main>
            </div>
        </div>
    );
}
