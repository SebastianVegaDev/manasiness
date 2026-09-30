import type { ReactNode } from 'react';

import { ApplicationShell } from '../../../../platform/shell/application-shell';

interface OrganizationProductLayoutProps {
    readonly children: ReactNode;
    readonly params: Promise<{
        organizationId: string;
    }>;
}

export default async function OrganizationProductLayout({
    children,
    params,
}: OrganizationProductLayoutProps) {
    const { organizationId } = await params;

    return <ApplicationShell organizationId={organizationId}>{children}</ApplicationShell>;
}
