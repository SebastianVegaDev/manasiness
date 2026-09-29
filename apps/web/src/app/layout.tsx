import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Script from 'next/script';
import type { ReactNode } from 'react';

import '../platform/styling/tokens.css';
import './globals.css';

import { LocalizationProvider } from '../platform/i18n/localization-provider';
import { getPlatformMessages } from '../platform/i18n/messages';
import { getRequestLocale, getTranslations } from '../platform/i18n/server';
import { QueryProvider } from '../platform/query/query-provider';
import { THEME_BOOTSTRAP_SCRIPT } from '../platform/theme/theme-bootstrap';

const geist = Geist({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-geist-sans',
});

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('metadata');

    return {
        title: 'Manasiness',
        description: t('description'),
    };
}

interface RootLayoutProps {
    readonly children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
    const locale = await getRequestLocale();
    const messages = getPlatformMessages(locale);

    return (
        <html lang={locale} className={geist.variable} suppressHydrationWarning>
            <body>
                <Script id="manasiness-theme-bootstrap" strategy="beforeInteractive">
                    {THEME_BOOTSTRAP_SCRIPT}
                </Script>
                <LocalizationProvider locale={locale} messages={messages}>
                    <QueryProvider>{children}</QueryProvider>
                </LocalizationProvider>
            </body>
        </html>
    );
}
