import assert from 'node:assert/strict';
import test from 'node:test';

import {
    isIanaTimeZone,
    isLocalDate,
    parseIanaTimeZone,
    parseInstant,
    parseLocalDate,
    serializeIanaTimeZone,
    serializeInstant,
    serializeLocalDate,
} from '../src/index.js';

void test('instant parsing preserves the exact absolute time', () => {
    const instant = parseInstant(
        '2026-09-28T16:14:10.123-05:00',
    );

    assert.equal(
        serializeInstant(instant),
        '2026-09-28T21:14:10.123Z',
    );
});

void test('instant parsing accepts canonical UTC serialization', () => {
    const value =
        '2026-09-28T21:14:10.123Z';

    assert.equal(
        serializeInstant(parseInstant(value)),
        value,
    );
});

void test('instant parsing rejects timezone-less values', () => {
    assert.throws(
        () =>
            parseInstant(
                '2026-09-28T21:14:10.123',
            ),
        {
            name: 'TypeError',
        },
    );
});

void test('instant parsing rejects non-millisecond precision', () => {
    assert.throws(
        () =>
            parseInstant(
                '2026-09-28T21:14:10.123456Z',
            ),
        {
            name: 'TypeError',
        },
    );

    assert.throws(
        () =>
            parseInstant(
                '2026-09-28T21:14:10Z',
            ),
        {
            name: 'TypeError',
        },
    );
});

void test('instant serialization rejects invalid Date values', () => {
    assert.throws(
        () =>
            serializeInstant(
                new Date(Number.NaN),
            ),
        {
            name: 'TypeError',
        },
    );
});

void test('local dates remain date-only values', () => {
    const date = parseLocalDate('2028-02-29');

    assert.equal(isLocalDate(date), true);
    assert.equal(
        serializeLocalDate(date),
        '2028-02-29',
    );
});

void test('local date parsing rejects invalid calendar dates', () => {
    assert.throws(
        () => parseLocalDate('2026-02-30'),
        {
            name: 'TypeError',
        },
    );

    assert.throws(
        () => parseLocalDate('2026-9-28'),
        {
            name: 'TypeError',
        },
    );
});

void test('IANA time zones are validated explicitly', () => {
    const timeZone =
        parseIanaTimeZone('America/Lima');

    assert.equal(
        serializeIanaTimeZone(timeZone),
        'America/Lima',
    );

    assert.equal(
        isIanaTimeZone('America/Lima'),
        true,
    );
});

void test('invalid time zones are rejected', () => {
    assert.throws(
        () =>
            parseIanaTimeZone(
                'Definitely/Not_A_Time_Zone',
            ),
        {
            name: 'TypeError',
        },
    );
});