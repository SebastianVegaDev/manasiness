import 'server-only';

import { headers } from 'next/headers';

import { resolveLocaleFromAcceptLanguage, type SupportedLocale } from './locale';
import { getPlatformMessages } from './messages';
import { createTranslator, type Translator } from './translator';

export async function getRequestLocale(): Promise<SupportedLocale> {
    const requestHeaders = await headers();

    return resolveLocaleFromAcceptLanguage(requestHeaders.get('accept-language'));
}

export async function getTranslations(namespace?: string): Promise<Translator> {
    const locale = await getRequestLocale();

    return createTranslator(getPlatformMessages(locale), namespace);
}
