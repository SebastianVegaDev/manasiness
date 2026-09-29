import {
    expect,
    test,
} from 'vitest';

import {
    isIanaTimeZone,
    isLocalDate,
    parseIanaTimeZone,
    parseInstant,
    parseLocalDate,
    serializeIanaTimeZone,
    serializeInstant,
    serializeLocalDate,
} from '../../src/index.js';

test('instant parsing preserves the exact absolute time', () => {
    const instant =
        parseInstant(
            '2026-09-28T16:14:10.123-05:00',
        );

    expect(
        serializeInstant(
            instant,
        ),
    ).toBe(
        '2026-09-28T21:14:10.123Z',
    );
});

test('instant parsing accepts canonical UTC serialization', () => {
    const value =
        '2026-09-28T21:14:10.123Z';

    expect(
        serializeInstant(
            parseInstant(value),
        ),
    ).toBe(value);
});

test('instant parsing rejects timezone-less values', () => {
    expect(() =>
        parseInstant(
            '2026-09-28T21:14:10.123',
        ),
    ).toThrow(TypeError);
});

test('instant parsing rejects non-millisecond precision', () => {
    expect(() =>
        parseInstant(
            '2026-09-28T21:14:10.123456Z',
        ),
    ).toThrow(TypeError);

    expect(() =>
        parseInstant(
            '2026-09-28T21:14:10Z',
        ),
    ).toThrow(TypeError);
});

test('instant serialization rejects invalid Date values', () => {
    expect(() =>
        serializeInstant(
            new Date(
                Number.NaN,
            ),
        ),
    ).toThrow(TypeError);
});

test('local dates remain date-only values', () => {
    const date =
        parseLocalDate(
            '2028-02-29',
        );

    expect(
        isLocalDate(date),
    ).toBe(true);

    expect(
        serializeLocalDate(
            date,
        ),
    ).toBe('2028-02-29');
});

test('local date parsing rejects invalid calendar dates', () => {
    expect(() =>
        parseLocalDate(
            '2026-02-30',
        ),
    ).toThrow(TypeError);

    expect(() =>
        parseLocalDate(
            '2026-9-28',
        ),
    ).toThrow(TypeError);
});

test('IANA time zones are validated explicitly', () => {
    const timeZone =
        parseIanaTimeZone(
            'America/Lima',
        );

    expect(
        serializeIanaTimeZone(
            timeZone,
        ),
    ).toBe(
        'America/Lima',
    );

    expect(
        isIanaTimeZone(
            'America/Lima',
        ),
    ).toBe(true);
});

test('invalid time zones are rejected', () => {
    expect(() =>
        parseIanaTimeZone(
            'Definitely/Not_A_Time_Zone',
        ),
    ).toThrow(TypeError);
});