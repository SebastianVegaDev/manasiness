import type { HTMLAttributes, ReactNode } from 'react';

import styles from './collection-toolbar.module.css';

export interface CollectionToolbarProps extends Omit<
    HTMLAttributes<HTMLElement>,
    'children' | 'className'
> {
    readonly label: string;
    readonly controls: ReactNode;
    readonly status?: ReactNode;
}

export function CollectionToolbar({
    controls,
    label,
    status,
    ...toolbarProps
}: CollectionToolbarProps) {
    return (
        <section {...toolbarProps} className={styles['toolbar']} aria-label={label}>
            <div className={styles['controls']}>{controls}</div>
            {status === undefined ? null : <div className={styles['status']}>{status}</div>}
        </section>
    );
}
