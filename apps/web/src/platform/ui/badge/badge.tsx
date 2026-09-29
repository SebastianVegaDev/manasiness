import type { HTMLAttributes } from 'react';

import { uiClassName } from '../internal/ui-class-name';
import styles from './badge.module.css';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'critical';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    tone?: BadgeTone;
}

function toneClassName(tone: BadgeTone): string | undefined {
    switch (tone) {
        case 'neutral':
            return styles['neutral'];
        case 'primary':
            return styles['primary'];
        case 'success':
            return styles['success'];
        case 'warning':
            return styles['warning'];
        case 'critical':
            return styles['critical'];
    }
}

export function Badge({ className, tone = 'neutral', ...badgeProps }: BadgeProps) {
    return (
        <span
            {...badgeProps}
            className={uiClassName(styles['badge'], toneClassName(tone), className)}
        />
    );
}
