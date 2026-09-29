'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

import { Button, IconButton } from '../button/button';
import { uiClassName } from '../internal/ui-class-name';
import styles from './dialog.module.css';

export type DialogKind = 'dialog' | 'alertdialog';

export interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    kind?: DialogKind;
    className?: string;
    closeLabel: string;
}

export function Dialog({
    children,
    className,
    closeLabel,
    description,
    footer,
    kind = 'dialog',
    onOpenChange,
    open,
    title,
}: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;

        if (dialog === null) {
            return;
        }

        if (open && !dialog.open) {
            const activeElement = document.activeElement;

            returnFocusRef.current = activeElement instanceof HTMLElement ? activeElement : null;

            dialog.showModal();
            closeButtonRef.current?.focus();
            return;
        }

        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className={uiClassName(styles['dialog'], className)}
            role={kind}
            aria-labelledby={titleId}
            aria-describedby={description === undefined ? undefined : descriptionId}
            onCancel={(event) => {
                event.preventDefault();
                onOpenChange(false);
            }}
            onClose={() => {
                if (open) {
                    onOpenChange(false);
                }

                returnFocusRef.current?.focus();
                returnFocusRef.current = null;
            }}
        >
            <div className={styles['frame']}>
                <header className={styles['header']}>
                    <div>
                        <h2 id={titleId} className={styles['title']}>
                            {title}
                        </h2>

                        {description === undefined ? null : (
                            <p id={descriptionId} className={styles['description']}>
                                {description}
                            </p>
                        )}
                    </div>

                    <IconButton
                        ref={closeButtonRef}
                        variant="ghost"
                        label={closeLabel}
                        onClick={() => {
                            onOpenChange(false);
                        }}
                    >
                        <span aria-hidden="true">×</span>
                    </IconButton>
                </header>

                <div className={styles['body']}>{children}</div>

                {footer === undefined ? null : (
                    <footer className={styles['footer']}>{footer}</footer>
                )}
            </div>
        </dialog>
    );
}

export type AlertDialogProps = Omit<DialogProps, 'kind'>;

export function AlertDialog(props: AlertDialogProps) {
    return <Dialog {...props} kind="alertdialog" />;
}

export interface DialogCloseButtonProps {
    onClose: () => void;
    children: ReactNode;
}

export function DialogCloseButton({ children, onClose }: DialogCloseButtonProps) {
    return (
        <Button variant="secondary" onClick={onClose}>
            {children}
        </Button>
    );
}
