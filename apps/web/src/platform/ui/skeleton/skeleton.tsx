import type { HTMLAttributes } from 'react';

import { uiClassName } from '../internal/ui-class-name';
import styles from './skeleton.module.css';

export type SkeletonVariant = 'text' | 'block' | 'circle';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    variant?: SkeletonVariant;
}

function variantClassName(variant: SkeletonVariant): string | undefined {
    switch (variant) {
        case 'text':
            return styles['text'];
        case 'block':
            return styles['block'];
        case 'circle':
            return styles['circle'];
    }
}

export function Skeleton({ className, variant = 'text', ...skeletonProps }: SkeletonProps) {
    return (
        <div
            {...skeletonProps}
            className={uiClassName(styles['skeleton'], variantClassName(variant), className)}
            aria-hidden="true"
        />
    );
}
