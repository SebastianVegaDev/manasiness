import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import styles from './form-feedback.module.css';

export interface FormErrorSummaryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    readonly title: ReactNode;
    readonly requestId?: string | undefined;
    readonly requestIdLabel?: ReactNode;
}

function mergeClassNames(...classNames: (string | undefined)[]): string | undefined {
    const merged = classNames.filter((className): className is string => className !== undefined);

    return merged.length === 0 ? undefined : merged.join(' ');
}

export const FormErrorSummary = forwardRef<HTMLDivElement, FormErrorSummaryProps>(
    function FormErrorSummary(
        { children, className, requestId, requestIdLabel, title, ...summaryProps },
        ref,
    ) {
        return (
            <div
                {...summaryProps}
                ref={ref}
                className={mergeClassNames(styles['summary'], className)}
                role="alert"
                tabIndex={-1}
            >
                <strong className={styles['title']}>{title}</strong>

                {children === undefined ? null : <div className={styles['body']}>{children}</div>}

                {requestId === undefined || requestIdLabel === undefined ? null : (
                    <p className={styles['requestId']}>
                        <span>{requestIdLabel}</span> <code>{requestId}</code>
                    </p>
                )}
            </div>
        );
    },
);
