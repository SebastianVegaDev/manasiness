'use client';

import { useState } from 'react';

import { useTranslations } from '../platform/i18n/localization-provider';
import type { Translator } from '../platform/i18n/translator';
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

type DiagnosticAction = 'none' | 'reviewed' | 'reset';

export function PrimitiveDiagnostics() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [lastAction, setLastAction] = useState<DiagnosticAction>('none');
    const t = useTranslations('diagnostics.primitives');
    const lastActionLabel = resolveActionLabel(lastAction, t);

    return (
        <section className={styles['section']} aria-labelledby="primitive-foundation-title">
            <div>
                <p className={styles['kicker']}>{t('kicker')}</p>
                <h2 id="primitive-foundation-title" className={styles['title']}>
                    {t('title')}
                </h2>
                <p className={styles['description']}>{t('description')}</p>
            </div>

            <Field>
                <FieldLabel htmlFor="foundation-name">{t('field.label')}</FieldLabel>
                <Input
                    id="foundation-name"
                    aria-describedby="foundation-name-description"
                    defaultValue="Manasiness"
                />
                <FieldDescription id="foundation-name-description">
                    {t('field.description')}
                </FieldDescription>
            </Field>

            <div className={styles['actions']}>
                <Menu triggerLabel={t('menu.trigger')}>
                    <MenuItem
                        onSelect={() => {
                            setLastAction('reviewed');
                        }}
                    >
                        {t('menu.markReviewed')}
                    </MenuItem>
                    <MenuItem
                        onSelect={() => {
                            setLastAction('reset');
                        }}
                    >
                        {t('menu.resetReview')}
                    </MenuItem>
                    <MenuItem disabled>{t('menu.unavailable')}</MenuItem>
                </Menu>

                <Button
                    variant="secondary"
                    onClick={() => {
                        setDialogOpen(true);
                    }}
                >
                    {t('dialog.open')}
                </Button>

                <Button variant="ghost" disabled>
                    {t('disabledControl')}
                </Button>
            </div>

            <p className={styles['status']} aria-live="polite">
                {t('status.line', { action: lastActionLabel })}
            </p>

            <Dialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title={t('dialog.title')}
                description={t('dialog.description')}
                closeLabel={t('dialog.close')}
                footer={
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setDialogOpen(false);
                        }}
                    >
                        {t('dialog.done')}
                    </Button>
                }
            >
                <p>{t('dialog.body')}</p>
            </Dialog>
        </section>
    );
}

function resolveActionLabel(action: DiagnosticAction, t: Translator): string {
    switch (action) {
        case 'none':
            return t('status.none');
        case 'reviewed':
            return t('status.reviewed');
        case 'reset':
            return t('status.reset');
    }
}
