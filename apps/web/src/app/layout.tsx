import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Script from 'next/script';
import type { ReactNode } from 'react';

import '../platform/styling/tokens.css';
import './globals.css';

import { QueryProvider } from '../platform/query/query-provider';
import { THEME_BOOTSTRAP_SCRIPT } from '../platform/theme/theme-bootstrap';

const geist = Geist({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-geist-sans',
});

export const metadata: Metadata = {
    title: 'Manasiness',
    description: 'Manasiness web application.',
};

interface RootLayoutProps {
    readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html className={geist.variable} suppressHydrationWarning>
            <body>
                <Script id="manasiness-theme-bootstrap" strategy="beforeInteractive">
                    {THEME_BOOTSTRAP_SCRIPT}
                </Script>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
