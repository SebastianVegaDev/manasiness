'use client';

import { useState, type ChangeEvent } from 'react';

import {
    ApiProtocolError,
    ApiResponseError,
    ApiTransportError,
} from '../../platform/api/api-client-error';
import {
    classifyApiClientFailure,
    DestructiveConfirmationDialog,
    FeedbackAlert,
    FeedbackLoadingState,
    FeedbackRefreshStatus,
    FeedbackState,
    FeedbackToastProvider,
    useFeedbackToast,
    type FeedbackFailure,
    type FeedbackStateKind,
} from '../../platform/feedback';
import { useLocale } from '../../platform/i18n/localization-provider';
import { Badge, Button, Field, FieldLabel, Select } from '../../platform/ui';
import { getFeedbackPatternCopy } from './feedback-pattern-copy';
import styles from './feedback-pattern-fixture.module.css';

type StatePreview = FeedbackStateKind | 'ready' | 'loading' | 'refreshing';
type FailurePreview = 'network' | 'internal' | 'protocol';

export function FeedbackPatternFixture() {
    const locale = useLocale();
    const copy = getFeedbackPatternCopy(locale);

    return (
        <FeedbackToastProvider
            viewportLabel={copy.toast.viewportLabel}
            dismissLabel={copy.toast.dismiss}
            defaultDurationMs={800}
        >
            <FeedbackPatternFixtureContent />
        </FeedbackToastProvider>
    );
}

function FeedbackPatternFixtureContent() {
    const locale = useLocale();
    const copy = getFeedbackPatternCopy(locale);
    const { notify } = useFeedbackToast();
    const [statePreview, setStatePreview] = useState<StatePreview>('ready');
    const [failurePreview, setFailurePreview] = useState<FailurePreview>('network');
    const [failureResolved, setFailureResolved] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationCompleted, setConfirmationCompleted] = useState(false);

    const failure = createFailurePreview(failurePreview);
    const classifiedFailure = classifyApiClientFailure(failure);

    function handleStatePreviewChange(event: ChangeEvent<HTMLSelectElement>) {
        setStatePreview(event.currentTarget.value as StatePreview);
    }

    function handleFailurePreviewChange(event: ChangeEvent<HTMLSelectElement>) {
        setFailurePreview(event.currentTarget.value as FailurePreview);
        setFailureResolved(false);
    }

    return (
        <section
            className={styles['section']}
            aria-labelledby="feedback-pattern-title"
            data-feedback-pattern-fixture=""
        >
            <div className={styles['heading']}>
                <p className={styles['kicker']}>{copy.kicker}</p>
                <h2 id="feedback-pattern-title" className={styles['title']}>
                    {copy.title}
                </h2>
                <p className={styles['description']}>{copy.description}</p>
            </div>

            <div className={styles['group']}>
                <h3 className={styles['groupTitle']}>{copy.alerts.title}</h3>

                <div className={styles['alertGrid']}>
                    <FeedbackAlert title={copy.alerts.infoTitle}>
                        <p>{copy.alerts.infoBody}</p>
                    </FeedbackAlert>
                    <FeedbackAlert tone="success" title={copy.alerts.successTitle}>
                        <p>{copy.alerts.successBody}</p>
                    </FeedbackAlert>
                    <FeedbackAlert tone="warning" title={copy.alerts.warningTitle}>
                        <p>{copy.alerts.warningBody}</p>
                    </FeedbackAlert>
                    <FeedbackAlert tone="critical" title={copy.alerts.criticalTitle}>
                        <p>{copy.alerts.criticalBody}</p>
                    </FeedbackAlert>
                </div>

                <FeedbackAlert presentation="banner" tone="warning" title={copy.alerts.bannerTitle}>
                    <p>{copy.alerts.bannerBody}</p>
                </FeedbackAlert>
            </div>

            <div className={styles['group']}>
                <h3 className={styles['groupTitle']}>{copy.toast.title}</h3>
                <Button
                    variant="secondary"
                    onClick={() => {
                        notify({
                            tone: 'success',
                            title: copy.toast.savedTitle,
                            description: copy.toast.savedBody,
                        });
                    }}
                >
                    {copy.toast.show}
                </Button>
            </div>

            <div className={styles['group']}>
                <h3 className={styles['groupTitle']}>{copy.states.title}</h3>

                <Field className={styles['control']}>
                    <FieldLabel htmlFor="feedback-state-preview">
                        {copy.states.previewLabel}
                    </FieldLabel>
                    <Select
                        id="feedback-state-preview"
                        value={statePreview}
                        onChange={handleStatePreviewChange}
                    >
                        <option value="ready">{copy.states.ready}</option>
                        <option value="loading">{copy.states.loading}</option>
                        <option value="refreshing">{copy.states.refreshing}</option>
                        <option value="empty">{copy.states.empty}</option>
                        <option value="zero-results">{copy.states.zeroResults}</option>
                        <option value="not-configured">{copy.states.notConfigured}</option>
                        <option value="no-history">{copy.states.noHistory}</option>
                        <option value="error">{copy.states.error}</option>
                        <option value="unavailable">{copy.states.unavailable}</option>
                    </Select>
                </Field>

                <div className={styles['preview']}>
                    {renderStatePreview(statePreview, copy, () => {
                        setStatePreview('ready');
                    })}
                </div>
            </div>

            <div className={styles['group']}>
                <h3 className={styles['groupTitle']}>{copy.failures.title}</h3>

                <Field className={styles['control']}>
                    <FieldLabel htmlFor="feedback-failure-preview">
                        {copy.failures.previewLabel}
                    </FieldLabel>
                    <Select
                        id="feedback-failure-preview"
                        value={failurePreview}
                        onChange={handleFailurePreviewChange}
                    >
                        <option value="network">{copy.failures.network}</option>
                        <option value="internal">{copy.failures.internal}</option>
                        <option value="protocol">{copy.failures.protocol}</option>
                    </Select>
                </Field>

                <FailurePreviewState
                    failure={classifiedFailure}
                    resolved={failureResolved}
                    onRetry={() => {
                        setFailureResolved(true);
                    }}
                />
            </div>

            <div className={styles['group']}>
                <h3 className={styles['groupTitle']}>{copy.statuses.title}</h3>
                <div className={styles['badges']}>
                    <Badge tone="success">{copy.statuses.normal}</Badge>
                    <Badge tone="warning">{copy.statuses.warning}</Badge>
                    <Badge tone="critical">{copy.statuses.critical}</Badge>
                </div>
            </div>

            <div className={styles['group']}>
                <h3 className={styles['groupTitle']}>{copy.confirmation.title}</h3>
                <Button
                    variant="critical"
                    onClick={() => {
                        setConfirmationCompleted(false);
                        setConfirmationOpen(true);
                    }}
                >
                    {copy.confirmation.open}
                </Button>

                {confirmationCompleted ? (
                    <p className={styles['completion']} role="status">
                        {copy.confirmation.completed}
                    </p>
                ) : null}
            </div>

            <DestructiveConfirmationDialog
                open={confirmationOpen}
                onOpenChange={setConfirmationOpen}
                onConfirm={() => {
                    setConfirmationCompleted(true);
                    setConfirmationOpen(false);
                }}
                title={copy.confirmation.dialogTitle}
                description={copy.confirmation.description}
                consequence={copy.confirmation.consequence}
                consequenceKind="irreversible"
                consequenceLabel={copy.confirmation.consequenceLabel}
                confirmLabel={copy.confirmation.confirm}
                pendingLabel={copy.confirmation.pending}
                cancelLabel={copy.confirmation.cancel}
                closeLabel={copy.confirmation.close}
            />
        </section>
    );
}

function renderStatePreview(
    state: StatePreview,
    copy: ReturnType<typeof getFeedbackPatternCopy>,
    retry: () => void,
) {
    if (state === 'loading') {
        return <FeedbackLoadingState label={copy.states.loadingLabel} />;
    }

    if (state === 'ready' || state === 'refreshing') {
        return (
            <div className={styles['stableContent']} data-feedback-stable-content="">
                {state === 'refreshing' ? (
                    <FeedbackRefreshStatus>{copy.states.refreshingLabel}</FeedbackRefreshStatus>
                ) : null}
                <strong>{copy.states.readyTitle}</strong>
                <p>{copy.states.readyBody}</p>
            </div>
        );
    }

    if (state === 'empty') {
        return (
            <FeedbackState
                kind="empty"
                title={copy.states.emptyTitle}
                description={copy.states.emptyBody}
            />
        );
    }

    if (state === 'zero-results') {
        return (
            <FeedbackState
                kind="zero-results"
                title={copy.states.zeroTitle}
                description={copy.states.zeroBody}
            />
        );
    }

    if (state === 'not-configured') {
        return (
            <FeedbackState
                kind="not-configured"
                title={copy.states.notConfiguredTitle}
                description={copy.states.notConfiguredBody}
            />
        );
    }

    if (state === 'no-history') {
        return (
            <FeedbackState
                kind="no-history"
                title={copy.states.noHistoryTitle}
                description={copy.states.noHistoryBody}
            />
        );
    }

    if (state === 'unavailable') {
        return (
            <FeedbackState
                kind="unavailable"
                title={copy.states.unavailableTitle}
                description={copy.states.unavailableBody}
            />
        );
    }

    return (
        <FeedbackState
            kind="error"
            title={copy.states.errorTitle}
            description={copy.states.errorBody}
            action={
                <Button variant="secondary" onClick={retry}>
                    {copy.states.retry}
                </Button>
            }
        />
    );
}

interface FailurePreviewStateProps {
    readonly failure: FeedbackFailure;
    readonly resolved: boolean;
    readonly onRetry: () => void;
}

function FailurePreviewState({ failure, onRetry, resolved }: FailurePreviewStateProps) {
    const locale = useLocale();
    const copy = getFeedbackPatternCopy(locale);

    if (resolved) {
        return (
            <FeedbackAlert tone="success" announcement="polite" title={copy.failures.resolved} />
        );
    }

    const failureCopy = getFailureCopy(failure, copy);

    return (
        <FeedbackState
            kind="error"
            title={failureCopy.title}
            description={failureCopy.body}
            requestId={failure.requestId}
            requestIdLabel={copy.failures.requestId}
            action={
                failure.retryable ? (
                    <Button variant="secondary" onClick={onRetry}>
                        {copy.failures.retry}
                    </Button>
                ) : undefined
            }
        />
    );
}

function createFailurePreview(preview: FailurePreview): unknown {
    if (preview === 'network') {
        return new ApiTransportError('network');
    }

    if (preview === 'internal') {
        return new ApiResponseError(500, 'feedback-request-001', {
            type: 'internal_error',
            code: 'internal.unexpected',
            message: 'Technical internal fixture message that must never reach the operator.',
        });
    }

    return new ApiProtocolError(502, 'feedback-request-002');
}

function getFailureCopy(failure: FeedbackFailure, copy: ReturnType<typeof getFeedbackPatternCopy>) {
    if (failure.kind === 'network' || failure.kind === 'timeout') {
        return {
            title: copy.failures.networkTitle,
            body: copy.failures.networkBody,
        };
    }

    if (failure.kind === 'protocol') {
        return {
            title: copy.failures.protocolTitle,
            body: copy.failures.protocolBody,
        };
    }

    return {
        title: copy.failures.internalTitle,
        body: copy.failures.internalBody,
    };
}
