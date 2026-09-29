import { expect, test } from 'vitest';

import { createPresentationFormatter } from '../../src/platform/i18n/format.js';
import { DEFAULT_LOCALE, resolveLocaleFromAcceptLanguage } from '../../src/platform/i18n/locale.js';
import { PLATFORM_MESSAGE_CATALOGS } from '../../src/platform/i18n/messages.js';
import { createTranslator, getMessageKeys } from '../../src/platform/i18n/translator.js';

test('locale negotiation respects browser quality preferences and supported language families', () => {
    expect(resolveLocaleFromAcceptLanguage('es-PE,es;q=0.9,en-US;q=0.8')).toBe('es-PE');
    expect(resolveLocaleFromAcceptLanguage('en-GB,en;q=0.9,es;q=0.8')).toBe('en-US');
    expect(resolveLocaleFromAcceptLanguage('fr-FR;q=0.9,es-MX;q=0.8')).toBe('es-PE');
    expect(resolveLocaleFromAcceptLanguage('es;q=0.4,en;q=0.9')).toBe('en-US');
});

test('locale negotiation fails safely to the explicit default locale', () => {
    expect(resolveLocaleFromAcceptLanguage(null)).toBe(DEFAULT_LOCALE);
    expect(resolveLocaleFromAcceptLanguage(undefined)).toBe(DEFAULT_LOCALE);
    expect(resolveLocaleFromAcceptLanguage('')).toBe(DEFAULT_LOCALE);
    expect(resolveLocaleFromAcceptLanguage('fr-FR')).toBe(DEFAULT_LOCALE);
    expect(resolveLocaleFromAcceptLanguage('es-PE;q=0')).toBe(DEFAULT_LOCALE);
    expect(resolveLocaleFromAcceptLanguage('not_a_locale')).toBe(DEFAULT_LOCALE);
});

test('supported platform catalogs keep the same message surface', () => {
    expect(getMessageKeys(PLATFORM_MESSAGE_CATALOGS['es-PE'])).toEqual(
        getMessageKeys(PLATFORM_MESSAGE_CATALOGS['en-US']),
    );
});

test('translator resolves namespaces and requires interpolation values explicitly', () => {
    const t = createTranslator(PLATFORM_MESSAGE_CATALOGS['en-US'], 'diagnostics.primitives');

    expect(t('dialog.open')).toBe('Open dialog');
    expect(t('status.line', { action: 'Reviewed' })).toBe('Last action: Reviewed');
    expect(() => t('status.line')).toThrow(/Missing localization value action/u);
    expect(() => t('missing')).toThrow(/Missing localization message/u);
});

test('presentation formatting follows UI locale without inventing business settings', () => {
    const english = createPresentationFormatter('en-US');
    const spanish = createPresentationFormatter('es-PE');

    expect(english.number(1234.5)).toBe('1,234.5');
    expect(spanish.number(1234.5)).toBe('1,234.5');

    expect(normalizeSpaces(english.currency(1234.5, 'PEN'))).toBe('PEN 1,234.50');
    expect(normalizeSpaces(spanish.currency(1234.5, 'PEN'))).toBe('S/ 1,234.50');

    expect(english.calendarDate('2026-09-29')).toBe('Sep 29, 2026');
    expect(spanish.calendarDate('2026-09-29')).toBe('29 set. 2026');

    expect(english.timestamp('2026-09-29T15:00:00.000Z', 'America/Lima')).toContain('10:00 AM');
    expect(english.relativeTime(-1, 'day')).toBe('yesterday');
    expect(spanish.relativeTime(-1, 'day')).toBe('ayer');
});

test('calendar and timestamp formatting rejects ambiguous or invalid temporal input', () => {
    const format = createPresentationFormatter('en-US');

    expect(() => format.calendarDate('09/29/2026')).toThrow(/YYYY-MM-DD/u);
    expect(() => format.calendarDate('2026-02-30')).toThrow(/invalid/u);
    expect(() => format.timestamp('not-an-instant', 'America/Lima')).toThrow(/valid instant/u);
});

function normalizeSpaces(value: string): string {
    return value.replace(/\u00a0/gu, ' ');
}
