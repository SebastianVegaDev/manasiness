import { expect, test } from 'vitest';

import {
    buildCollectionHref,
    updateCollectionSearchParams,
} from '../../src/platform/collections/collection-url-state';

test('updates meaningful collection state while preserving unrelated query parameters', () => {
    const next = updateCollectionSearchParams(
        'debug=1&q=old&status=ready&page=3',
        {
            q: 'beta',
            status: 'paused',
        },
        {
            defaults: {
                page: '1',
                status: 'all',
            },
            resetKeys: ['page'],
        },
    );

    expect(next.get('debug')).toBe('1');
    expect(next.get('q')).toBe('beta');
    expect(next.get('status')).toBe('paused');
    expect(next.has('page')).toBe(false);
});

test('removes cleared and default state from collection URLs', () => {
    const next = updateCollectionSearchParams(
        'q=alpha&status=ready&page=2',
        {
            q: null,
            status: 'all',
            page: '1',
        },
        {
            defaults: {
                page: '1',
                status: 'all',
            },
        },
    );

    expect(next.toString()).toBe('');
});

test('leaves keys unchanged when an update is undefined', () => {
    const next = updateCollectionSearchParams('q=alpha&status=review', {
        q: undefined,
    });

    expect(next.get('q')).toBe('alpha');
    expect(next.get('status')).toBe('review');
});

test('builds clean collection hrefs with and without query state', () => {
    expect(buildCollectionHref('/foundation', new URLSearchParams())).toBe('/foundation');
    expect(buildCollectionHref('/foundation', new URLSearchParams('q=beta&page=2'))).toBe(
        '/foundation?q=beta&page=2',
    );
});
