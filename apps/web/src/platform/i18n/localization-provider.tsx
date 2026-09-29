'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { SupportedLocale } from './locale';
import { createTranslator, type MessageCatalog, type Translator } from './translator';

interface LocalizationContextValue {
    readonly locale: SupportedLocale;
    readonly messages: MessageCatalog;
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

export interface LocalizationProviderProps {
    readonly locale: SupportedLocale;
    readonly messages: MessageCatalog;
    readonly children: ReactNode;
}

export function LocalizationProvider({ children, locale, messages }: LocalizationProviderProps) {
    return (
        <LocalizationContext.Provider value={{ locale, messages }}>
            {children}
        </LocalizationContext.Provider>
    );
}

export function useLocale(): SupportedLocale {
    return useLocalizationContext().locale;
}

export function useTranslations(namespace?: string): Translator {
    const { messages } = useLocalizationContext();

    return createTranslator(messages, namespace);
}

function useLocalizationContext(): LocalizationContextValue {
    const context = useContext(LocalizationContext);

    if (context === null) {
        throw new Error('Localization hooks must be rendered inside LocalizationProvider.');
    }

    return context;
}
