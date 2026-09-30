'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type FocusEvent,
    type ReactNode,
} from 'react';

import { Button } from '../ui';
import type { FeedbackTone } from './feedback-alert';
import styles from './feedback-toast.module.css';

export interface FeedbackToastInput {
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly tone?: FeedbackTone;
    readonly durationMs?: number | null;
}

interface FeedbackToastRecord {
    readonly id: number;
    readonly title: ReactNode;
    readonly description: ReactNode | undefined;
    readonly tone: FeedbackTone;
    readonly durationMs: number | null;
}

export interface FeedbackToastApi {
    notify: (input: FeedbackToastInput) => number;
    dismiss: (id: number) => void;
}

export interface FeedbackToastProviderProps {
    readonly children: ReactNode;
    readonly viewportLabel: string;
    readonly dismissLabel: string;
    readonly defaultDurationMs?: number;
}

const FeedbackToastContext = createContext<FeedbackToastApi | null>(null);

export function FeedbackToastProvider({
    children,
    defaultDurationMs = 6000,
    dismissLabel,
    viewportLabel,
}: FeedbackToastProviderProps) {
    const nextIdRef = useRef(0);
    const [toasts, setToasts] = useState<readonly FeedbackToastRecord[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const notify = useCallback(
        (input: FeedbackToastInput) => {
            nextIdRef.current += 1;
            const id = nextIdRef.current;
            const tone = input.tone ?? 'info';
            const durationMs =
                input.durationMs === undefined
                    ? tone === 'critical'
                        ? null
                        : defaultDurationMs
                    : input.durationMs;

            setToasts((current) => [
                ...current,
                {
                    id,
                    title: input.title,
                    description: input.description,
                    tone,
                    durationMs,
                },
            ]);

            return id;
        },
        [defaultDurationMs],
    );

    const value = useMemo<FeedbackToastApi>(() => ({ dismiss, notify }), [dismiss, notify]);

    return (
        <FeedbackToastContext.Provider value={value}>
            {children}
            <FeedbackToastViewport
                toasts={toasts}
                dismissLabel={dismissLabel}
                viewportLabel={viewportLabel}
                onDismiss={dismiss}
            />
        </FeedbackToastContext.Provider>
    );
}

export function useFeedbackToast(): FeedbackToastApi {
    const context = useContext(FeedbackToastContext);

    if (context === null) {
        throw new Error('useFeedbackToast must be used within FeedbackToastProvider.');
    }

    return context;
}

interface FeedbackToastViewportProps {
    readonly toasts: readonly FeedbackToastRecord[];
    readonly dismissLabel: string;
    readonly viewportLabel: string;
    readonly onDismiss: (id: number) => void;
}

function FeedbackToastViewport({
    dismissLabel,
    onDismiss,
    toasts,
    viewportLabel,
}: FeedbackToastViewportProps) {
    if (toasts.length === 0) {
        return null;
    }

    return (
        <section
            className={styles['viewport']}
            data-feedback-toast-viewport=""
            aria-label={viewportLabel}
        >
            {toasts.map((toast) => (
                <FeedbackToastItem
                    key={toast.id}
                    toast={toast}
                    dismissLabel={dismissLabel}
                    onDismiss={onDismiss}
                />
            ))}
        </section>
    );
}

interface FeedbackToastItemProps {
    readonly toast: FeedbackToastRecord;
    readonly dismissLabel: string;
    readonly onDismiss: (id: number) => void;
}

function FeedbackToastItem({ dismissLabel, onDismiss, toast }: FeedbackToastItemProps) {
    const [paused, setPaused] = useState(false);
    const remainingMsRef = useRef<number | null>(toast.durationMs);

    useEffect(() => {
        remainingMsRef.current = toast.durationMs;
    }, [toast.durationMs]);

    useEffect(() => {
        const remainingMs = remainingMsRef.current;

        if (paused || remainingMs === null) {
            return;
        }

        const startedAt = Date.now();
        const timeout = window.setTimeout(() => {
            onDismiss(toast.id);
        }, remainingMs);

        return () => {
            window.clearTimeout(timeout);
            remainingMsRef.current = Math.max(0, remainingMs - (Date.now() - startedAt));
        };
    }, [onDismiss, paused, toast.id]);

    function handleBlur(event: FocusEvent<HTMLElement>) {
        const relatedTarget = event.relatedTarget;

        if (!(relatedTarget instanceof Node) || !event.currentTarget.contains(relatedTarget)) {
            setPaused(false);
        }
    }

    return (
        <article
            className={styles['toast']}
            data-feedback-toast={toast.tone}
            role={toast.tone === 'critical' ? 'alert' : 'status'}
            aria-atomic="true"
            onPointerEnter={() => {
                setPaused(true);
            }}
            onPointerLeave={() => {
                setPaused(false);
            }}
            onFocusCapture={() => {
                setPaused(true);
            }}
            onBlurCapture={handleBlur}
        >
            <span className={styles['marker']} aria-hidden="true">
                {toast.tone === 'success'
                    ? '✓'
                    : toast.tone === 'warning'
                      ? '!'
                      : toast.tone === 'critical'
                        ? '×'
                        : 'i'}
            </span>

            <div className={styles['copy']}>
                <strong className={styles['title']}>{toast.title}</strong>
                {toast.description === undefined ? null : (
                    <div className={styles['description']}>{toast.description}</div>
                )}
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                    onDismiss(toast.id);
                }}
            >
                {dismissLabel}
            </Button>
        </article>
    );
}
