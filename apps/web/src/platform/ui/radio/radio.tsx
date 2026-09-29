import {
    forwardRef,
    useId,
    type FieldsetHTMLAttributes,
    type InputHTMLAttributes,
    type ReactNode,
} from 'react';

import { mergeAriaTokens } from '../internal/aria';
import { uiClassName } from '../internal/ui-class-name';
import styles from './radio.module.css';

export interface RadioGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
    legend: ReactNode;
}

export function RadioGroup({ children, className, legend, ...fieldsetProps }: RadioGroupProps) {
    return (
        <fieldset {...fieldsetProps} className={uiClassName(styles['group'], className)}>
            <legend className={styles['legend']}>{legend}</legend>
            <div className={styles['items']}>{children}</div>
        </fieldset>
    );
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: ReactNode;
    description?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
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
                type="radio"
                className={styles['input']}
                disabled={disabled}
                aria-describedby={mergeAriaTokens(
                    ariaDescribedBy,
                    description === undefined ? undefined : descriptionId,
                )}
            />

            <span className={styles['control']} aria-hidden="true" />

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
