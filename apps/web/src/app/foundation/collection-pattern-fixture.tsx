'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type ChangeEvent, type SyntheticEvent } from 'react';

import {
    buildCollectionHref,
    CollectionCompactItem,
    CollectionCompactList,
    CollectionLoadingState,
    CollectionPagination,
    CollectionRefreshStatus,
    CollectionResponsiveDataView,
    CollectionState,
    CollectionTable,
    CollectionToolbar,
    updateCollectionSearchParams,
    type CollectionPaginationProps,
} from '../../platform/collections';
import { createPresentationFormatter } from '../../platform/i18n/format';
import { useLocale } from '../../platform/i18n/localization-provider';
import { Badge, Button, Field, FieldLabel, Input, Select, type BadgeTone } from '../../platform/ui';
import { getCollectionPatternCopy } from './collection-pattern-copy';
import styles from './collection-pattern-fixture.module.css';

type FixtureStatus = 'ready' | 'review' | 'paused';
type StatusFilter = FixtureStatus | 'all';
type PreviewState = 'ready' | 'loading' | 'refreshing' | 'empty' | 'error' | 'unavailable';

interface FixtureRecord {
    readonly id: string;
    readonly reference: string;
    readonly name: string;
    readonly status: FixtureStatus;
    readonly quantity: number;
    readonly updatedOn: string;
}

const FIXTURE_RECORDS: readonly FixtureRecord[] = [
    {
        id: 'fixture-alpha',
        reference: 'FX-001',
        name: 'Alpha fixture',
        status: 'ready',
        quantity: 12,
        updatedOn: '2026-09-29',
    },
    {
        id: 'fixture-beta',
        reference: 'FX-002',
        name: 'Beta fixture',
        status: 'review',
        quantity: 4,
        updatedOn: '2026-09-28',
    },
    {
        id: 'fixture-gamma',
        reference: 'FX-003',
        name: 'Gamma fixture',
        status: 'paused',
        quantity: 27,
        updatedOn: '2026-09-27',
    },
    {
        id: 'fixture-delta',
        reference: 'FX-004',
        name: 'Delta fixture',
        status: 'ready',
        quantity: 8,
        updatedOn: '2026-09-26',
    },
    {
        id: 'fixture-epsilon',
        reference: 'FX-005',
        name: 'Epsilon fixture',
        status: 'review',
        quantity: 19,
        updatedOn: '2026-09-25',
    },
];

const PAGE_SIZE = 2;
const URL_DEFAULTS = {
    page: '1',
    status: 'all',
} as const;

export function CollectionPatternFixture() {
    const locale = useLocale();
    const copy = getCollectionPatternCopy(locale);
    const format = useMemo(() => createPresentationFormatter(locale), [locale]);
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const query = searchParams.get('q')?.trim() ?? '';
    const statusFilter = readStatusFilter(searchParams.get('status'));
    const [draftQuery, setDraftQuery] = useState(query);
    const [previewState, setPreviewState] = useState<PreviewState>('ready');

    useEffect(() => {
        setDraftQuery(query);
    }, [query]);

    const filteredRecords = useMemo(() => {
        const normalizedQuery = query.toLocaleLowerCase(locale);

        return FIXTURE_RECORDS.filter((record) => {
            const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
            const matchesQuery =
                normalizedQuery === '' ||
                record.reference.toLocaleLowerCase(locale).includes(normalizedQuery) ||
                record.name.toLocaleLowerCase(locale).includes(normalizedQuery);

            return matchesStatus && matchesQuery;
        });
    }, [locale, query, statusFilter]);

    const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
    const requestedPage = readPositivePage(searchParams.get('page'));
    const currentPage = Math.min(requestedPage, pageCount);
    const visibleRecords = filteredRecords.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    function replaceUrl(updates: Readonly<Record<string, string | null>>, resetPagination = true) {
        const next = updateCollectionSearchParams(searchParams.toString(), updates, {
            defaults: URL_DEFAULTS,
            resetKeys: resetPagination ? ['page'] : [],
        });

        router.replace(buildCollectionHref(pathname, next), { scroll: false });
    }

    function handleSearch(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        const normalizedDraft = draftQuery.trim();

        replaceUrl({ q: normalizedDraft === '' ? null : normalizedDraft });
    }

    function clearSearch() {
        setDraftQuery('');
        replaceUrl({ q: null });
    }

    function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
        replaceUrl({ status: event.currentTarget.value });
    }

    function handlePreviewChange(event: ChangeEvent<HTMLSelectElement>) {
        setPreviewState(event.currentTarget.value as PreviewState);
    }

    function resetView() {
        setDraftQuery('');
        replaceUrl({ q: null, status: 'all' });
    }

    function hrefForPage(page: number) {
        const next = updateCollectionSearchParams(
            searchParams.toString(),
            { page: String(page) },
            { defaults: URL_DEFAULTS },
        );

        return buildCollectionHref(pathname, next);
    }

    const controls = (
        <div className={styles['controlGrid']}>
            <form
                className={styles['searchForm']}
                role="search"
                aria-label={copy.search.formLabel}
                onSubmit={handleSearch}
            >
                <Field className={styles['searchField']}>
                    <FieldLabel htmlFor="collection-fixture-search">{copy.search.label}</FieldLabel>
                    <div className={styles['searchRow']}>
                        <Input
                            id="collection-fixture-search"
                            type="search"
                            name="q"
                            value={draftQuery}
                            placeholder={copy.search.placeholder}
                            onChange={(event) => {
                                setDraftQuery(event.currentTarget.value);
                            }}
                        />
                        <Button type="submit" size="sm">
                            {copy.search.submit}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={clearSearch}>
                            {copy.search.clear}
                        </Button>
                    </div>
                </Field>
            </form>

            <Field>
                <FieldLabel htmlFor="collection-fixture-status">{copy.filter.label}</FieldLabel>
                <Select
                    id="collection-fixture-status"
                    value={statusFilter}
                    onChange={handleStatusChange}
                >
                    <option value="all">{copy.filter.all}</option>
                    <option value="ready">{copy.filter.ready}</option>
                    <option value="review">{copy.filter.review}</option>
                    <option value="paused">{copy.filter.paused}</option>
                </Select>
            </Field>

            <Field>
                <FieldLabel htmlFor="collection-fixture-preview">{copy.preview.label}</FieldLabel>
                <Select
                    id="collection-fixture-preview"
                    value={previewState}
                    onChange={handlePreviewChange}
                >
                    <option value="ready">{copy.preview.ready}</option>
                    <option value="loading">{copy.preview.loading}</option>
                    <option value="refreshing">{copy.preview.refreshing}</option>
                    <option value="empty">{copy.preview.empty}</option>
                    <option value="error">{copy.preview.error}</option>
                    <option value="unavailable">{copy.preview.unavailable}</option>
                </Select>
            </Field>
        </div>
    );

    const resultStatus = (
        <div className={styles['resultStatus']}>
            <span>{copy.resultsLabel}</span>
            <strong>{format.number(filteredRecords.length)}</strong>
            {previewState === 'refreshing' ? (
                <CollectionRefreshStatus>{copy.refreshing}</CollectionRefreshStatus>
            ) : null}
        </div>
    );

    return (
        <section
            className={styles['section']}
            aria-labelledby="collection-pattern-title"
            data-collection-pattern-fixture=""
        >
            <div className={styles['heading']}>
                <p className={styles['kicker']}>{copy.kicker}</p>
                <h2 id="collection-pattern-title" className={styles['title']}>
                    {copy.title}
                </h2>
                <p className={styles['description']}>{copy.description}</p>
            </div>

            <CollectionToolbar
                label={copy.toolbarLabel}
                controls={controls}
                status={resultStatus}
            />

            <CollectionBody
                currentPage={currentPage}
                filteredRecords={filteredRecords}
                formatDate={(value) => format.calendarDate(value)}
                formatNumber={(value) => format.number(value)}
                hrefForPage={hrefForPage}
                pageCount={pageCount}
                previewState={previewState}
                resetView={resetView}
                setPreviewState={setPreviewState}
                visibleRecords={visibleRecords}
            />
        </section>
    );
}

interface CollectionBodyProps {
    readonly currentPage: number;
    readonly filteredRecords: readonly FixtureRecord[];
    readonly formatDate: (value: string) => string;
    readonly formatNumber: (value: number) => string;
    readonly hrefForPage: (page: number) => string;
    readonly pageCount: number;
    readonly previewState: PreviewState;
    readonly resetView: () => void;
    readonly setPreviewState: (state: PreviewState) => void;
    readonly visibleRecords: readonly FixtureRecord[];
}

function CollectionBody({
    currentPage,
    filteredRecords,
    formatDate,
    formatNumber,
    hrefForPage,
    pageCount,
    previewState,
    resetView,
    setPreviewState,
    visibleRecords,
}: CollectionBodyProps) {
    const locale = useLocale();
    const copy = getCollectionPatternCopy(locale);

    if (previewState === 'loading') {
        return <CollectionLoadingState label={copy.states.loading} />;
    }

    if (previewState === 'empty') {
        return (
            <CollectionState
                kind="empty"
                title={copy.states.empty.title}
                description={copy.states.empty.description}
            />
        );
    }

    if (previewState === 'error') {
        return (
            <CollectionState
                kind="error"
                title={copy.states.error.title}
                description={copy.states.error.description}
                action={
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setPreviewState('ready');
                        }}
                    >
                        {copy.states.error.action}
                    </Button>
                }
            />
        );
    }

    if (previewState === 'unavailable') {
        return (
            <CollectionState
                kind="unavailable"
                title={copy.states.unavailable.title}
                description={copy.states.unavailable.description}
            />
        );
    }

    if (filteredRecords.length === 0) {
        return (
            <CollectionState
                kind="zero-results"
                title={copy.states.zero.title}
                description={copy.states.zero.description}
                action={
                    <Button variant="secondary" onClick={resetView}>
                        {copy.states.zero.action}
                    </Button>
                }
            />
        );
    }

    const table = (
        <CollectionTable caption={copy.tableCaption}>
            <thead>
                <tr>
                    <th scope="col">{copy.columns.reference}</th>
                    <th scope="col">{copy.columns.name}</th>
                    <th scope="col">{copy.columns.status}</th>
                    <th scope="col" data-align="end">
                        {copy.columns.quantity}
                    </th>
                    <th scope="col">{copy.columns.updated}</th>
                </tr>
            </thead>
            <tbody>
                {visibleRecords.map((record) => (
                    <tr key={record.id}>
                        <td>{record.reference}</td>
                        <td>{record.name}</td>
                        <td>
                            <StatusBadge status={record.status} />
                        </td>
                        <td data-align="end">{formatNumber(record.quantity)}</td>
                        <td>{formatDate(record.updatedOn)}</td>
                    </tr>
                ))}
            </tbody>
        </CollectionTable>
    );

    const compact = (
        <CollectionCompactList label={copy.compactLabel}>
            {visibleRecords.map((record) => (
                <CollectionCompactItem key={record.id}>
                    <div className={styles['compactHeading']}>
                        <div>
                            <strong>{record.name}</strong>
                            <span>{record.reference}</span>
                        </div>
                        <StatusBadge status={record.status} />
                    </div>
                    <dl className={styles['compactFacts']}>
                        <div>
                            <dt>{copy.columns.quantity}</dt>
                            <dd>{formatNumber(record.quantity)}</dd>
                        </div>
                        <div>
                            <dt>{copy.columns.updated}</dt>
                            <dd>{formatDate(record.updatedOn)}</dd>
                        </div>
                    </dl>
                </CollectionCompactItem>
            ))}
        </CollectionCompactList>
    );

    const paginationProps: CollectionPaginationProps = {
        label: copy.pagination.label,
        previousLabel: copy.pagination.previous,
        nextLabel: copy.pagination.next,
        summary: (
            <span>
                {copy.pagination.page} {formatNumber(currentPage)} {copy.pagination.of}{' '}
                {formatNumber(pageCount)}
            </span>
        ),
        ...(currentPage > 1 ? { previousHref: hrefForPage(currentPage - 1) } : {}),
        ...(currentPage < pageCount ? { nextHref: hrefForPage(currentPage + 1) } : {}),
    };

    return (
        <div className={styles['dataStack']}>
            <CollectionResponsiveDataView table={table} compact={compact} />
            <CollectionPagination {...paginationProps} />
        </div>
    );
}

function StatusBadge({ status }: { readonly status: FixtureStatus }) {
    const locale = useLocale();
    const copy = getCollectionPatternCopy(locale);
    const tone: BadgeTone =
        status === 'ready' ? 'success' : status === 'review' ? 'warning' : 'neutral';

    return <Badge tone={tone}>{copy.filter[status]}</Badge>;
}

function readStatusFilter(value: string | null): StatusFilter {
    return value === 'ready' || value === 'review' || value === 'paused' ? value : 'all';
}

function readPositivePage(value: string | null): number {
    if (value === null) {
        return 1;
    }

    const parsed = Number.parseInt(value, 10);

    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}
