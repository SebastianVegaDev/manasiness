'use client';

import type { ReactNode } from 'react';

import { AlertDialog, Button } from '../ui';

export interface DestructiveConfirmationDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onConfirm: () => void;
    readonly title: string;
    readonly description: string;
    readonly consequence: ReactNode;
    readonly confirmLabel: ReactNode;
    readonly cancelLabel: ReactNode;
    readonly closeLabel: string;
    readonly confirmDisabled?: boolean;
}

export function DestructiveConfirmationDialog({
    cancelLabel,
    closeLabel,
    confirmDisabled = false,
    confirmLabel,
    consequence,
    description,
    onConfirm,
    onOpenChange,
    open,
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
                        onClick={() => {
                            onOpenChange(false);
                        }}
                    >
                        {cancelLabel}
                    </Button>

                    <Button variant="critical" disabled={confirmDisabled} onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            <p>{consequence}</p>
        </AlertDialog>
    );
}
