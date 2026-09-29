import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { mergeAriaTokens } from '../internal/aria';
import { uiClassName } from '../internal/ui-class-name';
import styles from './switch.module.css';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'role' | 'type'> {
    label: ReactNode;
    description?: ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
    {
        'aria-describedby': ariaDescribedBy,
        className,
        description,
        disabled = false,
        id,
        label,
        ...inputProps
    },
    ref,
) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = `${inputId}-description`;

    return (
        <label
            className={uiClassName(styles['root'], className)}
            data-disabled={disabled ? '' : undefined}
            htmlFor={inputId}
        >
            <input
                {...inputProps}
                ref={ref}
                id={inputId}
                type="checkbox"
                role="switch"
                className={styles['input']}
                disabled={disabled}
                aria-describedby={mergeAriaTokens(
                    ariaDescribedBy,
                    description === undefined ? undefined : descriptionId,
                )}
            />

            <span className={styles['track']} aria-hidden="true">
                <span className={styles['thumb']} />
            </span>

            <span className={styles['copy']}>
                <span className={styles['label']}>{label}</span>

                {description === undefined ? null : (
                    <span id={descriptionId} className={styles['description']}>
                        {description}
                    </span>
                )}
            </span>
        </label>
    );
});
