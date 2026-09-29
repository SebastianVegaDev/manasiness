'use client';

import { useState } from 'react';

import {
    Button,
    Dialog,
    Field,
    FieldDescription,
    FieldLabel,
    Input,
    Menu,
    MenuItem,
} from '../platform/ui';
import styles from './primitive-diagnostics.module.css';

export function PrimitiveDiagnostics() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [lastAction, setLastAction] = useState('None');

    return (
        <section className={styles['section']} aria-labelledby="primitive-foundation-title">
            <div>
                <p className={styles['kicker']}>Interaction foundation</p>
                <h2 id="primitive-foundation-title" className={styles['title']}>
                    Shared UI primitives are active.
                </h2>
                <p className={styles['description']}>
                    This temporary engineering surface exercises keyboard, focus, form,
                    disabled-state, and dialog behavior before the application shell replaces it.
                </p>
            </div>

            <Field>
                <FieldLabel htmlFor="foundation-name">Foundation name</FieldLabel>
                <Input
                    id="foundation-name"
                    aria-describedby="foundation-name-description"
                    defaultValue="Manasiness"
                />
                <FieldDescription id="foundation-name-description">
                    Native field semantics stay explicit and feature-owned forms can compose them.
                </FieldDescription>
            </Field>

            <div className={styles['actions']}>
                <Menu triggerLabel="Foundation actions">
                    <MenuItem
                        onSelect={() => {
                            setLastAction('Reviewed');
                        }}
                    >
                        Mark reviewed
                    </MenuItem>
                    <MenuItem
                        onSelect={() => {
                            setLastAction('Reset');
                        }}
                    >
                        Reset review
                    </MenuItem>
                    <MenuItem
                        disabled
                        onSelect={() => {
                            setLastAction('Unavailable');
                        }}
                    >
                        Unavailable action
                    </MenuItem>
                </Menu>

                <Button
                    variant="secondary"
                    onClick={() => {
                        setDialogOpen(true);
                    }}
                >
                    Open dialog
                </Button>

                <Button variant="ghost" disabled>
                    Disabled control
                </Button>
            </div>

            <p className={styles['status']} aria-live="polite">
                Last action: {lastAction}
            </p>

            <Dialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title="Primitive dialog"
                description="The native modal dialog owns top-layer modality while Manasiness owns its visual and API contract."
                footer={
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setDialogOpen(false);
                        }}
                    >
                        Done
                    </Button>
                }
            >
                <p>
                    Keyboard users can dismiss this dialog with Escape or the explicit close
                    control. Focus returns to the control that opened it.
                </p>
            </Dialog>
        </section>
    );
}
