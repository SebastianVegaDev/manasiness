import type { HTMLAttributes, ReactNode } from 'react';

import { AppLink } from '../ui';
import styles from './page-layout.module.css';

export type PageContainerWidth = 'readable' | 'default' | 'wide';

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
    readonly width?: PageContainerWidth;
}

export function PageContainer({
    children,
    className,
    width = 'default',
    ...containerProps
}: PageContainerProps) {
    return (
        <div
            {...containerProps}
            className={[styles['container'], styles[width], className].filter(Boolean).join(' ')}
        >
            {children}
        </div>
    );
}

export function PageHeader({ children, className, ...headerProps }: HTMLAttributes<HTMLElement>) {
    return (
        <header
            {...headerProps}
            className={[styles['header'], className].filter(Boolean).join(' ')}
        >
            {children}
        </header>
    );
}

export function PageHeading({ children, className, ...divProps }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...divProps} className={[styles['heading'], className].filter(Boolean).join(' ')}>
            {children}
        </div>
    );
}

export function PageEyebrow({
    children,
    className,
    ...paragraphProps
}: HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p {...paragraphProps} className={[styles['eyebrow'], className].filter(Boolean).join(' ')}>
            {children}
        </p>
    );
}

export function PageTitle({
    children,
    className,
    ...headingProps
}: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h1 {...headingProps} className={[styles['title'], className].filter(Boolean).join(' ')}>
            {children}
        </h1>
    );
}

export function PageDescription({
    children,
    className,
    ...paragraphProps
}: HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            {...paragraphProps}
            className={[styles['description'], className].filter(Boolean).join(' ')}
        >
            {children}
        </p>
    );
}

export function PageActions({ children, className, ...divProps }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...divProps} className={[styles['actions'], className].filter(Boolean).join(' ')}>
            {children}
        </div>
    );
}

export function PageSection({ children, className, ...sectionProps }: HTMLAttributes<HTMLElement>) {
    return (
        <section
            {...sectionProps}
            className={[styles['section'], className].filter(Boolean).join(' ')}
        >
            {children}
        </section>
    );
}

export interface BreadcrumbItem {
    readonly key: string;
    readonly label: ReactNode;
    readonly href?: string;
    readonly current?: boolean;
}

export interface BreadcrumbsProps {
    readonly label: string;
    readonly items: readonly BreadcrumbItem[];
}

export function Breadcrumbs({ items, label }: BreadcrumbsProps) {
    return (
        <nav className={styles['breadcrumbs']} aria-label={label}>
            <ol>
                {items.map((item) => (
                    <li key={item.key}>
                        {item.href === undefined || item.current ? (
                            <span aria-current={item.current ? 'page' : undefined}>
                                {item.label}
                            </span>
                        ) : (
                            <AppLink href={item.href}>{item.label}</AppLink>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
