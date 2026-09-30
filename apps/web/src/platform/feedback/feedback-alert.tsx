import type { ReactNode } from 'react';

import styles from './feedback-alert.module.css';

export type FeedbackTone = 'info' | 'success' | 'warning' | 'critical';
export type FeedbackAlertPresentation = 'inline' | 'banner';
export type FeedbackAnnouncement = 'none' | 'polite' | 'assertive';

export interface FeedbackAlertProps {
    readonly tone?: FeedbackTone;
    readonly presentation?: FeedbackAlertPresentation;
    readonly announcement?: FeedbackAnnouncement;
    readonly title: ReactNode;
    readonly children?: ReactNode;
    readonly action?: ReactNode;
}

function announcementRole(announcement: FeedbackAnnouncement): 'alert' | 'status' | undefined {
    if (announcement === 'assertive') {
        return 'alert';
    }

    if (announcement === 'polite') {
        return 'status';
    }

    return undefined;
}

export function FeedbackAlert({
    action,
    announcement = 'none',
    children,
    presentation = 'inline',
    title,
    tone = 'info',
}: FeedbackAlertProps) {
    return (
        <section
            className={styles['alert']}
            data-feedback-presentation={presentation}
            data-feedback-tone={tone}
            role={announcementRole(announcement)}
            aria-atomic={announcement === 'none' ? undefined : true}
        >
            <div className={styles['marker']} aria-hidden="true">
                {tone === 'success'
                    ? '✓'
                    : tone === 'warning'
                      ? '!'
                      : tone === 'critical'
                        ? '×'
                        : 'i'}
            </div>

            <div className={styles['content']}>
                <strong className={styles['title']}>{title}</strong>
                {children === undefined ? null : <div className={styles['body']}>{children}</div>}
            </div>

            {action === undefined ? null : <div className={styles['action']}>{action}</div>}
        </section>
    );
}
