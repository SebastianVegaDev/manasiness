import { redirect } from 'next/navigation';

interface OrganizationEntryPageProps {
    readonly params: Promise<{
        organizationId: string;
    }>;
}

export default async function OrganizationEntryPage({ params }: OrganizationEntryPageProps) {
    const { organizationId } = await params;

    redirect(`/app/${encodeURIComponent(organizationId)}/overview`);
}
