import type { HTMLAttributes, LiHTMLAttributes, ReactNode, TableHTMLAttributes } from 'react';

import styles from './collection-data-view.module.css';

export interface CollectionResponsiveDataViewProps {
    readonly table: ReactNode;
    readonly compact: ReactNode;
}

export function CollectionResponsiveDataView({
    compact,
    table,
}: CollectionResponsiveDataViewProps) {
    return (
        <div className={styles['responsiveView']}>
            <div className={styles['tableLayout']} data-collection-layout="table">
                {table}
            </div>
            <div className={styles['compactLayout']} data-collection-layout="compact">
                {compact}
            </div>
        </div>
    );
}

export interface CollectionTableProps extends Omit<
    TableHTMLAttributes<HTMLTableElement>,
    'className'
> {
    readonly caption: ReactNode;
}

export function CollectionTable({ caption, children, ...tableProps }: CollectionTableProps) {
    return (
        <div className={styles['tableFrame']}>
            <table {...tableProps} className={styles['table']}>
                <caption className={styles['caption']}>{caption}</caption>
                {children}
            </table>
        </div>
    );
}

export interface CollectionCompactListProps extends Omit<
    HTMLAttributes<HTMLUListElement>,
    'className'
> {
    readonly label: string;
}

export function CollectionCompactList({
    children,
    label,
    ...listProps
}: CollectionCompactListProps) {
    return (
        <ul {...listProps} className={styles['compactList']} aria-label={label}>
            {children}
        </ul>
    );
}

export function CollectionCompactItem(
    itemProps: Omit<LiHTMLAttributes<HTMLLIElement>, 'className'>,
) {
    return <li {...itemProps} className={styles['compactItem']} />;
}
