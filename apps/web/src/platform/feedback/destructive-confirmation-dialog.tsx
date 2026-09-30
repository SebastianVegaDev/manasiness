'use client';

import type { ReactNode } from 'react';

import { AlertDialog, Badge, Button } from '../ui';
import styles from './destructive-confirmation-dialog.module.css';

export type ConfirmationConsequenceKind = 'reversible' | 'irreversible';

export interface DestructiveConfirmationDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onConfirm: () => void;
    readonly title: string;
    readonly description: string;
    readonly consequence: ReactNode;
    readonly consequenceKind: ConfirmationConsequenceKind;
    readonly consequenceLabel: ReactNode;
    readonly confirmLabel: ReactNode;
    readonly cancelLabel: ReactNode;
    readonly closeLabel: string;
    readonly confirmDisabled?: boolean;
    readonly pending?: boolean;
    readonly pendingLabel?: ReactNode;
}

export function DestructiveConfirmationDialog({
    cancelLabel,
    closeLabel,
    confirmDisabled = false,
    confirmLabel,
    consequence,
    consequenceKind,
    consequenceLabel,
    description,
    onConfirm,
    onOpenChange,
    open,
    pending = false,
    pendingLabel,
    title,
}: DestructiveConfirmationDialogProps) {
    return (
        <AlertDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            closeLabel={closeLabel}
            footer={
                <>
                    <Button
                        variant="secondary"
                        disabled={pending}
                        onClick={() => {
                            onOpenChange(false);
                        }}
                    >
                        {cancelLabel}
                    </Button>

                    <Button
                        variant="critical"
                        disabled={confirmDisabled}
                        pending={pending}
                        pendingLabel={pendingLabel}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            <div className={styles['consequence']}>
                <Badge tone={consequenceKind === 'irreversible' ? 'critical' : 'warning'}>
                    {consequenceLabel}
                </Badge>
                <p>{consequence}</p>
            </div>
        </AlertDialog>
    );
}
