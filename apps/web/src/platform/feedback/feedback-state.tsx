import type { ReactNode } from 'react';

import { Skeleton } from '../ui';
import styles from './feedback-state.module.css';

export type FeedbackStateKind =
    'empty' | 'zero-results' | 'not-configured' | 'no-history' | 'unavailable' | 'error';

export interface FeedbackStateProps {
    readonly kind: FeedbackStateKind;
    readonly title: ReactNode;
    readonly description: ReactNode;
    readonly action?: ReactNode;
    readonly requestId?: string | undefined;
    readonly requestIdLabel?: ReactNode;
}

export function FeedbackState({
    action,
    description,
    kind,
    requestId,
    requestIdLabel,
    title,
}: FeedbackStateProps) {
    return (
        <section
            className={styles['state']}
            data-feedback-state={kind}
            role={kind === 'error' ? 'alert' : undefined}
        >
            <div className={styles['copy']}>
                <h3 className={styles['title']}>{title}</h3>
                <p className={styles['description']}>{description}</p>

                {requestId === undefined || requestIdLabel === undefined ? null : (
                    <p className={styles['requestId']}>
                        <span>{requestIdLabel}</span> <code>{requestId}</code>
                    </p>
                )}
            </div>

            {action === undefined ? null : <div className={styles['action']}>{action}</div>}
        </section>
    );
}

export interface FeedbackLoadingStateProps {
    readonly label: string;
    readonly blocks?: number;
}

export function FeedbackLoadingState({ label, blocks = 3 }: FeedbackLoadingStateProps) {
    return (
        <section
            className={styles['loading']}
            data-feedback-state="loading"
            role="status"
            aria-busy="true"
            aria-label={label}
        >
            <span className={styles['visuallyHidden']}>{label}</span>
            {Array.from({ length: blocks }, (_, index) => (
                <div className={styles['loadingBlock']} key={index}>
                    <Skeleton />
                    <Skeleton />
                </div>
            ))}
        </section>
    );
}

export interface FeedbackRefreshStatusProps {
    readonly children: ReactNode;
}

export function FeedbackRefreshStatus({ children }: FeedbackRefreshStatusProps) {
    return (
        <span className={styles['refresh']} data-feedback-state="refreshing" role="status">
            <span className={styles['refreshMarker']} aria-hidden="true" />
            {children}
        </span>
    );
}
