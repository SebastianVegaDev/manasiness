import NextLink from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';

import { uiClassName } from '../internal/ui-class-name';
import styles from './app-link.module.css';

export type AppLinkTone = 'default' | 'muted';
export type AppLinkUnderline = 'always' | 'hover';

export type AppLinkProps = ComponentPropsWithoutRef<typeof NextLink> & {
    tone?: AppLinkTone;
    underline?: AppLinkUnderline;
};

function toneClassName(tone: AppLinkTone): string | undefined {
    switch (tone) {
        case 'default':
            return styles['defaultTone'];
        case 'muted':
            return styles['mutedTone'];
    }
}

function underlineClassName(underline: AppLinkUnderline): string | undefined {
    switch (underline) {
        case 'always':
            return styles['alwaysUnderline'];
        case 'hover':
            return styles['hoverUnderline'];
    }
}

export function AppLink({
    className,
    tone = 'default',
    underline = 'hover',
    ...linkProps
}: AppLinkProps) {
    return (
        <NextLink
            {...linkProps}
            className={uiClassName(
                styles['link'],
                toneClassName(tone),
                underlineClassName(underline),
                className,
            )}
        />
    );
}
