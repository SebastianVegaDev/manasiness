import type { ReactNode } from 'react';

import { AppLink } from '../ui';
import styles from './collection-pagination.module.css';

export interface CollectionPaginationProps {
    readonly label: string;
    readonly previousLabel: string;
    readonly nextLabel: string;
    readonly previousHref?: string;
    readonly nextHref?: string;
    readonly summary: ReactNode;
}

export function CollectionPagination({
    label,
    nextHref,
    nextLabel,
    previousHref,
    previousLabel,
    summary,
}: CollectionPaginationProps) {
    return (
        <nav className={styles['pagination']} aria-label={label}>
            {previousHref === undefined ? (
                <span className={styles['disabled']} aria-disabled="true">
                    {previousLabel}
                </span>
            ) : (
                <AppLink className={styles['link']} href={previousHref} scroll={false}>
                    {previousLabel}
                </AppLink>
            )}

            <span className={styles['summary']}>{summary}</span>

            {nextHref === undefined ? (
                <span className={styles['disabled']} aria-disabled="true">
                    {nextLabel}
                </span>
            ) : (
                <AppLink className={styles['link']} href={nextHref} scroll={false}>
                    {nextLabel}
                </AppLink>
            )}
        </nav>
    );
}
