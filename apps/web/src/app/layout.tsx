import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { QueryProvider } from '../platform/query/query-provider';

export const metadata: Metadata = {
    title: 'Manasiness',
    description: 'Manasiness web application.',
};

interface RootLayoutProps {
    readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html>
            <body>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
