import {
    forwardRef,
    type HTMLAttributes,
    type InputHTMLAttributes,
    type LabelHTMLAttributes,
    type SelectHTMLAttributes,
    type TextareaHTMLAttributes,
} from 'react';

import { uiClassName } from '../internal/ui-class-name';
import styles from './field.module.css';

export function Field({ className, ...fieldProps }: HTMLAttributes<HTMLDivElement>) {
    return <div {...fieldProps} className={uiClassName(styles['field'], className)} />;
}

export function FieldLabel({ className, ...labelProps }: LabelHTMLAttributes<HTMLLabelElement>) {
    return <label {...labelProps} className={uiClassName(styles['label'], className)} />;
}

export function FieldDescription({
    className,
    ...descriptionProps
}: HTMLAttributes<HTMLParagraphElement>) {
    return <p {...descriptionProps} className={uiClassName(styles['description'], className)} />;
}

export function FieldError({ className, ...errorProps }: HTMLAttributes<HTMLParagraphElement>) {
    return <p {...errorProps} className={uiClassName(styles['error'], className)} />;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    function Input({ className, ...inputProps }, ref) {
        return (
            <input
                {...inputProps}
                ref={ref}
                className={uiClassName(styles['control'], className)}
            />
        );
    },
);

export const Textarea = forwardRef<
    HTMLTextAreaElement,
    TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...textareaProps }, ref) {
    return (
        <textarea
            {...textareaProps}
            ref={ref}
            className={uiClassName(styles['control'], styles['textarea'], className)}
        />
    );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
    function Select({ className, ...selectProps }, ref) {
        return (
            <select
                {...selectProps}
                ref={ref}
                className={uiClassName(styles['control'], styles['select'], className)}
            />
        );
    },
);
