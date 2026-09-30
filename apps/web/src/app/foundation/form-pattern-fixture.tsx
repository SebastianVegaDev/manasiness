'use client';

import {
    startTransition,
    useActionState,
    useEffect,
    useRef,
    useState,
    type SyntheticEvent,
} from 'react';
import { z } from 'zod';

import { ApiResponseError } from '../../platform/api/api-client-error';
import {
    DestructiveConfirmationDialog,
    FormErrorSummary,
    FormField,
    focusFirstInvalidControl,
    mapFormSubmissionError,
    type FormSubmissionFailure,
} from '../../platform/forms';
import { useTranslations } from '../../platform/i18n/localization-provider';
import type { Translator } from '../../platform/i18n/translator';
import { Button, Checkbox, Input, Select } from '../../platform/ui';
import styles from './form-pattern-fixture.module.css';

const fixtureSchema = z.object({
    foundationName: z.string().trim().min(3),
    outcome: z.enum(['success', 'rejection']),
    acknowledged: z.literal(true),
});

type NameError = 'required' | 'too_short';
type AcknowledgementError = 'required';
type FixturePhase = 'idle' | 'invalid' | 'failure' | 'success';

interface FixtureFieldErrors {
    readonly foundationName: NameError | null;
    readonly acknowledged: AcknowledgementError | null;
}

interface FixtureState {
    readonly phase: FixturePhase;
    readonly attempt: number;
    readonly successfulSubmissions: number;
    readonly fieldErrors: FixtureFieldErrors;
    readonly failure: FormSubmissionFailure | null;
}

const EMPTY_FIELD_ERRORS: FixtureFieldErrors = {
    foundationName: null,
    acknowledged: null,
};

const INITIAL_STATE: FixtureState = {
    phase: 'idle',
    attempt: 0,
    successfulSubmissions: 0,
    fieldErrors: EMPTY_FIELD_ERRORS,
    failure: null,
};

async function submitFixture(
    previousState: FixtureState,
    formData: FormData,
): Promise<FixtureState> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const foundationNameEntry = formData.get('foundationName');
    const outcomeEntry = formData.get('outcome');
    const foundationName = typeof foundationNameEntry === 'string' ? foundationNameEntry : '';
    const outcome = typeof outcomeEntry === 'string' ? outcomeEntry : '';
    const acknowledged = formData.get('acknowledged') === 'on';
    const parsed = fixtureSchema.safeParse({
        foundationName,
        outcome,
        acknowledged,
    });
    const attempt = previousState.attempt + 1;

    if (!parsed.success) {
        const normalizedName = foundationName.trim();

        return {
            phase: 'invalid',
            attempt,
            successfulSubmissions: previousState.successfulSubmissions,
            fieldErrors: {
                foundationName:
                    normalizedName.length === 0
                        ? 'required'
                        : normalizedName.length < 3
                          ? 'too_short'
                          : null,
                acknowledged: acknowledged ? null : 'required',
            },
            failure: null,
        };
    }

    if (parsed.data.outcome === 'rejection') {
        return {
            phase: 'failure',
            attempt,
            successfulSubmissions: previousState.successfulSubmissions,
            fieldErrors: EMPTY_FIELD_ERRORS,
            failure: mapFormSubmissionError(
                new ApiResponseError(409, 'fixture-request-001', {
                    type: 'business_rejection',
                    code: 'fixture.submission_rejected',
                    message: 'Fixture submission rejected.',
                }),
            ),
        };
    }

    return {
        phase: 'success',
        attempt,
        successfulSubmissions: previousState.successfulSubmissions + 1,
        fieldErrors: EMPTY_FIELD_ERRORS,
        failure: null,
    };
}

export function FormPatternFixture() {
    const t = useTranslations('diagnostics.forms');
    const formRef = useRef<HTMLFormElement>(null);
    const submissionLockRef = useRef(false);
    const [state, dispatchSubmission, isPending] = useActionState(submitFixture, INITIAL_STATE);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationCompleted, setConfirmationCompleted] = useState(false);

    useEffect(() => {
        if (!isPending) {
            submissionLockRef.current = false;
        }
    }, [isPending]);

    useEffect(() => {
        if (state.phase === 'invalid' && formRef.current !== null) {
            focusFirstInvalidControl(formRef.current);
        }
    }, [state.attempt, state.phase]);

    const nameError =
        state.fieldErrors.foundationName === 'required'
            ? t('validation.nameRequired')
            : state.fieldErrors.foundationName === 'too_short'
              ? t('validation.nameTooShort')
              : undefined;
    const acknowledgementError =
        state.fieldErrors.acknowledged === 'required'
            ? t('validation.acknowledgementRequired')
            : undefined;
    const failureCopy = state.failure === null ? null : resolveFailureCopy(state.failure, t);

    function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submissionLockRef.current || isPending) {
            return;
        }

        submissionLockRef.current = true;
        const formData = new FormData(event.currentTarget);

        startTransition(() => {
            dispatchSubmission(formData);
        });
    }

    return (
        <section className={styles['section']} aria-labelledby="form-pattern-title">
            <div className={styles['heading']}>
                <p className={styles['kicker']}>{t('kicker')}</p>
                <h2 id="form-pattern-title" className={styles['title']}>
                    {t('title')}
                </h2>
                <p className={styles['description']}>{t('description')}</p>
            </div>

            <form
                ref={formRef}
                className={styles['form']}
                aria-labelledby="form-pattern-title"
                aria-busy={isPending ? true : undefined}
                data-form-pattern-fixture=""
                data-submission-attempt={state.attempt}
                noValidate
                onSubmit={handleSubmit}
            >
                <FormField
                    id="form-fixture-name"
                    label={t('name.label')}
                    description={t('name.description')}
                    error={nameError}
                    required
                    requirementLabel={t('required')}
                >
                    {(controlProps) => (
                        <Input
                            {...controlProps}
                            name="foundationName"
                            autoComplete="off"
                            disabled={isPending}
                        />
                    )}
                </FormField>

                <FormField
                    id="form-fixture-outcome"
                    label={t('outcome.label')}
                    description={t('outcome.description')}
                    requirementLabel={t('optional')}
                >
                    {(controlProps) => (
                        <Select {...controlProps} name="outcome" disabled={isPending}>
                            <option value="success">{t('outcome.success')}</option>
                            <option value="rejection">{t('outcome.rejection')}</option>
                        </Select>
                    )}
                </FormField>

                <FormField id="form-fixture-acknowledged" error={acknowledgementError} required>
                    {(controlProps) => (
                        <Checkbox
                            {...controlProps}
                            name="acknowledged"
                            disabled={isPending}
                            label={t('acknowledgement.label')}
                            description={t('acknowledgement.description')}
                        />
                    )}
                </FormField>

                {failureCopy === null || state.failure === null ? null : (
                    <FormErrorSummary
                        title={t('failure.title')}
                        requestId={state.failure.requestId}
                        requestIdLabel={t('failure.requestId')}
                    >
                        <p>{failureCopy}</p>
                    </FormErrorSummary>
                )}

                {state.phase === 'success' ? (
                    <p className={styles['success']} role="status">
                        {t('success', { count: state.successfulSubmissions })}
                    </p>
                ) : null}

                <div className={styles['actions']}>
                    <Button type="submit" pending={isPending} pendingLabel={t('submitting')}>
                        {t('submit')}
                    </Button>

                    <Button
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => {
                            setConfirmationCompleted(false);
                            setConfirmationOpen(true);
                        }}
                    >
                        {t('destructive.open')}
                    </Button>
                </div>
            </form>

            {confirmationCompleted ? (
                <p className={styles['confirmationStatus']} role="status">
                    {t('destructive.completed')}
                </p>
            ) : null}

            <DestructiveConfirmationDialog
                open={confirmationOpen}
                onOpenChange={setConfirmationOpen}
                onConfirm={() => {
                    setConfirmationCompleted(true);
                    setConfirmationOpen(false);
                }}
                title={t('destructive.title')}
                description={t('destructive.description')}
                consequence={t('destructive.consequence')}
                confirmLabel={t('destructive.confirm')}
                cancelLabel={t('destructive.cancel')}
                closeLabel={t('destructive.close')}
            />
        </section>
    );
}

function resolveFailureCopy(failure: FormSubmissionFailure, t: Translator): string {
    if (failure.kind === 'api') {
        if (failure.code === 'fixture.submission_rejected') {
            return t('failure.businessRejection');
        }

        if (failure.errorType === 'conflict') {
            return t('failure.conflict');
        }

        return t('failure.api');
    }

    if (failure.kind === 'transport') {
        return failure.reason === 'timeout' ? t('failure.timeout') : t('failure.network');
    }

    if (failure.kind === 'protocol') {
        return t('failure.protocol');
    }

    return t('failure.unexpected');
}
