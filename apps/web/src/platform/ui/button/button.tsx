import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { uiClassName } from '../internal/ui-class-name';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'critical';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    pending?: boolean;
    pendingLabel?: ReactNode;
}

function variantClassName(variant: ButtonVariant): string | undefined {
    switch (variant) {
        case 'primary':
            return styles['primary'];
        case 'secondary':
            return styles['secondary'];
        case 'ghost':
            return styles['ghost'];
        case 'critical':
            return styles['critical'];
    }
}

function sizeClassName(size: ButtonSize): string | undefined {
    switch (size) {
        case 'sm':
            return styles['small'];
        case 'md':
            return styles['medium'];
        case 'lg':
            return styles['large'];
    }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        children,
        className,
        disabled = false,
        pending = false,
        pendingLabel,
        size = 'md',
        type = 'button',
        variant = 'primary',
        ...buttonProps
    },
    ref,
) {
    const unavailable = disabled || pending;

    return (
        <button
            {...buttonProps}
            ref={ref}
            type={type}
            className={uiClassName(
                styles['button'],
                variantClassName(variant),
                sizeClassName(size),
                className,
            )}
            disabled={unavailable}
            aria-busy={pending ? true : undefined}
            data-pending={pending ? '' : undefined}
        >
            {pending ? (pendingLabel ?? children) : children}
        </button>
    );
});

export interface IconButtonProps extends Omit<ButtonProps, 'aria-label' | 'children'> {
    label: string;
    children: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
    { children, className, label, size = 'md', ...buttonProps },
    ref,
) {
    return (
        <Button
            {...buttonProps}
            ref={ref}
            className={uiClassName(styles['iconButton'], className)}
            size={size}
            aria-label={label}
        >
            {children}
        </Button>
    );
});
