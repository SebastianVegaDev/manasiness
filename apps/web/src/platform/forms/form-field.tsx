import type { ReactNode } from 'react';

import { Field, FieldDescription, FieldError, FieldLabel } from '../ui';
import styles from './form-field.module.css';

export interface FormControlAccessibilityProps {
    readonly id: string;
    readonly required: boolean;
    readonly 'aria-describedby': string | undefined;
    readonly 'aria-errormessage': string | undefined;
    readonly 'aria-invalid': boolean | undefined;
}

export interface FormFieldProps {
    readonly id: string;
    readonly label?: ReactNode;
    readonly description?: ReactNode;
    readonly error?: ReactNode;
    readonly required?: boolean;
    readonly requirementLabel?: ReactNode;
    readonly children: (controlProps: FormControlAccessibilityProps) => ReactNode;
}

export function FormField({
    children,
    description,
    error,
    id,
    label,
    required = false,
    requirementLabel,
}: FormFieldProps) {
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;
    const hasDescription = description !== undefined && description !== null;
    const hasError = error !== undefined && error !== null;
    const describedBy = [hasDescription ? descriptionId : undefined, hasError ? errorId : undefined]
        .filter((value): value is string => value !== undefined)
        .join(' ');

    const controlProps: FormControlAccessibilityProps = {
        id,
        required,
        'aria-describedby': describedBy.length === 0 ? undefined : describedBy,
        'aria-errormessage': hasError ? errorId : undefined,
        'aria-invalid': hasError ? true : undefined,
    };

    return (
        <Field data-invalid={hasError ? '' : undefined}>
            {label === undefined ? null : (
                <FieldLabel htmlFor={id}>
                    <span className={styles['labelRow']}>
                        <span>{label}</span>
                        {requirementLabel === undefined ? null : (
                            <span className={styles['requirement']}>{requirementLabel}</span>
                        )}
                    </span>
                </FieldLabel>
            )}

            {children(controlProps)}

            {hasDescription ? (
                <FieldDescription id={descriptionId}>{description}</FieldDescription>
            ) : null}

            {hasError ? <FieldError id={errorId}>{error}</FieldError> : null}
        </Field>
    );
}
