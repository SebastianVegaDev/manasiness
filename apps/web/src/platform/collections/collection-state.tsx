import type { ReactNode } from 'react';

import { Skeleton } from '../ui';
import styles from './collection-state.module.css';

export type CollectionStateKind = 'empty' | 'zero-results' | 'error' | 'unavailable';

export interface CollectionStateProps {
    readonly kind: CollectionStateKind;
    readonly title: ReactNode;
    readonly description: ReactNode;
    readonly action?: ReactNode;
}

export function CollectionState({ action, description, kind, title }: CollectionStateProps) {
    return (
        <section
            className={styles['state']}
            data-collection-state={kind}
            role={kind === 'error' ? 'alert' : undefined}
        >
            <div className={styles['copy']}>
                <h3 className={styles['title']}>{title}</h3>
                <p className={styles['description']}>{description}</p>
            </div>
            {action === undefined ? null : <div className={styles['action']}>{action}</div>}
        </section>
    );
}

export interface CollectionLoadingStateProps {
    readonly label: string;
    readonly rows?: number;
}

export function CollectionLoadingState({ label, rows = 3 }: CollectionLoadingStateProps) {
    return (
        <section
            className={styles['loading']}
            data-collection-state="loading"
            role="status"
            aria-label={label}
        >
            <span className={styles['visuallyHidden']}>{label}</span>
            {Array.from({ length: rows }, (_, index) => (
                <div className={styles['loadingRow']} key={index}>
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                </div>
            ))}
        </section>
    );
}

export interface CollectionRefreshStatusProps {
    readonly children: ReactNode;
}

export function CollectionRefreshStatus({ children }: CollectionRefreshStatusProps) {
    return (
        <span className={styles['refresh']} data-collection-state="refreshing" role="status">
            <span className={styles['refreshDot']} aria-hidden="true" />
            {children}
        </span>
    );
}
