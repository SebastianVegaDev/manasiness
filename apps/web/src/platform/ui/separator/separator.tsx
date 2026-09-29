import type { HTMLAttributes } from 'react';

import { uiClassName } from '../internal/ui-class-name';
import styles from './separator.module.css';

export type SeparatorOrientation = 'horizontal' | 'vertical';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
    orientation?: SeparatorOrientation;
    decorative?: boolean;
}

export function Separator({
    className,
    decorative = false,
    orientation = 'horizontal',
    ...separatorProps
}: SeparatorProps) {
    return (
        <div
            {...separatorProps}
            className={uiClassName(
                styles['separator'],
                orientation === 'horizontal' ? styles['horizontal'] : styles['vertical'],
                className,
            )}
            role={decorative ? 'presentation' : 'separator'}
            aria-hidden={decorative ? true : undefined}
            aria-orientation={decorative ? undefined : orientation}
        />
    );
}
