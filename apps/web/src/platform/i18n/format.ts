import type { SupportedLocale } from './locale';

export interface PresentationFormatter {
    number(value: number, options?: Intl.NumberFormatOptions): string;
    percentage(value: number, options?: Omit<Intl.NumberFormatOptions, 'style'>): string;
    currency(
        value: number,
        currency: string,
        options?: Omit<Intl.NumberFormatOptions, 'currency' | 'style'>,
    ): string;
    calendarDate(localDate: string, options?: Omit<Intl.DateTimeFormatOptions, 'timeZone'>): string;
    timestamp(
        instant: Date | number | string,
        timeZone: string,
        options?: Omit<Intl.DateTimeFormatOptions, 'timeZone'>,
    ): string;
    relativeTime(
        value: number,
        unit: Intl.RelativeTimeFormatUnit,
        options?: Intl.RelativeTimeFormatOptions,
    ): string;
}

export function createPresentationFormatter(locale: SupportedLocale): PresentationFormatter {
    return {
        number(value, options) {
            return new Intl.NumberFormat(locale, options).format(value);
        },

        percentage(value, options) {
            return new Intl.NumberFormat(locale, {
                ...options,
                style: 'percent',
            }).format(value);
        },

        currency(value, currency, options) {
            return new Intl.NumberFormat(locale, {
                ...options,
                style: 'currency',
                currency,
            }).format(value);
        },

        calendarDate(localDate, options) {
            return new Intl.DateTimeFormat(locale, {
                dateStyle: 'medium',
                ...options,
                timeZone: 'UTC',
            }).format(parseCalendarDate(localDate));
        },

        timestamp(instant, timeZone, options) {
            return new Intl.DateTimeFormat(locale, {
                dateStyle: 'medium',
                timeStyle: 'short',
                ...options,
                timeZone,
            }).format(parseInstant(instant));
        },

        relativeTime(value, unit, options) {
            return new Intl.RelativeTimeFormat(locale, {
                numeric: 'auto',
                ...options,
            }).format(value, unit);
        },
    };
}

function parseCalendarDate(value: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);

    if (match === null) {
        throw new Error('Calendar dates must use YYYY-MM-DD.');
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw new Error('Calendar date is invalid.');
    }

    return date;
}

function parseInstant(value: Date | number | string): Date {
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error('Timestamp must be a valid instant.');
    }

    return date;
}
