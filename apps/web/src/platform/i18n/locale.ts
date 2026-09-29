export const SUPPORTED_LOCALES = ['en-US', 'es-PE'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en-US';

const languageDefaults: Readonly<Record<string, SupportedLocale>> = {
    en: 'en-US',
    es: 'es-PE',
};

export function isSupportedLocale(value: string): value is SupportedLocale {
    return SUPPORTED_LOCALES.some((locale) => locale.toLowerCase() === value.toLowerCase());
}

export function resolveLocaleFromAcceptLanguage(
    acceptLanguage: string | null | undefined,
): SupportedLocale {
    if (
        acceptLanguage === null ||
        acceptLanguage === undefined ||
        acceptLanguage.trim().length === 0
    ) {
        return DEFAULT_LOCALE;
    }

    const candidates = acceptLanguage
        .split(',')
        .map((entry, index) => parseLanguagePreference(entry, index))
        .filter((candidate): candidate is LanguagePreference => candidate !== null)
        .sort((left, right) => right.quality - left.quality || left.index - right.index);

    for (const candidate of candidates) {
        const locale = matchSupportedLocale(candidate.tag);

        if (locale !== null) {
            return locale;
        }
    }

    return DEFAULT_LOCALE;
}

interface LanguagePreference {
    readonly tag: string;
    readonly quality: number;
    readonly index: number;
}

function parseLanguagePreference(entry: string, index: number): LanguagePreference | null {
    const [rawTag, ...parameters] = entry.split(';');
    const tag = rawTag?.trim();

    if (tag === undefined || tag.length === 0) {
        return null;
    }

    let quality = 1;

    for (const parameter of parameters) {
        const [rawName, rawValue] = parameter.split('=');

        if (rawName?.trim().toLowerCase() !== 'q') {
            continue;
        }

        const parsedQuality = Number(rawValue?.trim());

        if (!Number.isFinite(parsedQuality) || parsedQuality < 0 || parsedQuality > 1) {
            return null;
        }

        quality = parsedQuality;
    }

    if (quality === 0) {
        return null;
    }

    return {
        tag,
        quality,
        index,
    };
}

function matchSupportedLocale(tag: string): SupportedLocale | null {
    if (tag === '*') {
        return DEFAULT_LOCALE;
    }

    const canonicalTag = canonicalizeLanguageTag(tag);

    if (canonicalTag === null) {
        return null;
    }

    const exactMatch = SUPPORTED_LOCALES.find(
        (locale) => locale.toLowerCase() === canonicalTag.toLowerCase(),
    );

    if (exactMatch !== undefined) {
        return exactMatch;
    }

    const [language] = canonicalTag.toLowerCase().split('-');

    if (language === undefined) {
        return null;
    }

    return languageDefaults[language] ?? null;
}

function canonicalizeLanguageTag(tag: string): string | null {
    try {
        return Intl.getCanonicalLocales(tag)[0] ?? null;
    } catch {
        return null;
    }
}
