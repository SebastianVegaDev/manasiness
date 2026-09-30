export type CollectionUrlUpdateValue = string | null | undefined;

export interface CollectionUrlUpdateOptions {
    readonly defaults?: Readonly<Record<string, string>>;
    readonly resetKeys?: readonly string[];
}

export function updateCollectionSearchParams(
    currentSearch: string,
    updates: Readonly<Record<string, CollectionUrlUpdateValue>>,
    options: CollectionUrlUpdateOptions = {},
): URLSearchParams {
    const next = new URLSearchParams(currentSearch);

    for (const key of options.resetKeys ?? []) {
        next.delete(key);
    }

    for (const [key, value] of Object.entries(updates)) {
        if (value === undefined) {
            continue;
        }

        if (value === null || value === '' || options.defaults?.[key] === value) {
            next.delete(key);
            continue;
        }

        next.set(key, value);
    }

    return next;
}

export function buildCollectionHref(pathname: string, searchParams: URLSearchParams): string {
    const query = searchParams.toString();

    return query === '' ? pathname : `${pathname}?${query}`;
}
