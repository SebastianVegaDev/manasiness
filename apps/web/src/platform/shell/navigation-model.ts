export type ProductDestinationKey =
    | 'overview'
    | 'sales'
    | 'purchasing'
    | 'catalog'
    | 'inventory'
    | 'relationships'
    | 'workforce'
    | 'finance'
    | 'reporting'
    | 'assistant'
    | 'settings';

export type NavigationGroupKey = 'operate' | 'manage' | 'understand' | 'utility';

export interface NavigationDestination {
    readonly key: ProductDestinationKey;
    readonly segment: string;
    readonly implemented: boolean;
}

export interface NavigationGroupDefinition {
    readonly key: NavigationGroupKey;
    readonly destinations: readonly NavigationDestination[];
}

export const OVERVIEW_DESTINATION: NavigationDestination = {
    key: 'overview',
    segment: 'overview',
    implemented: true,
};

export const NAVIGATION_GROUPS: readonly NavigationGroupDefinition[] = [
    {
        key: 'operate',
        destinations: [
            OVERVIEW_DESTINATION,
            { key: 'sales', segment: 'sales', implemented: false },
            { key: 'purchasing', segment: 'purchasing', implemented: false },
        ],
    },
    {
        key: 'manage',
        destinations: [
            { key: 'catalog', segment: 'catalog', implemented: false },
            { key: 'inventory', segment: 'inventory', implemented: false },
            { key: 'relationships', segment: 'relationships', implemented: false },
            { key: 'workforce', segment: 'workforce', implemented: false },
        ],
    },
    {
        key: 'understand',
        destinations: [
            { key: 'finance', segment: 'finance', implemented: false },
            { key: 'reporting', segment: 'reports', implemented: false },
        ],
    },
    {
        key: 'utility',
        destinations: [{ key: 'assistant', segment: 'assistant', implemented: false }],
    },
] as const;

export const SETTINGS_DESTINATION: NavigationDestination = {
    key: 'settings',
    segment: 'settings',
    implemented: false,
};

export function buildDestinationHref(
    destination: NavigationDestination,
    organizationId: string | undefined,
): string | null {
    if (!destination.implemented) {
        return null;
    }

    if (destination.key === 'overview' && organizationId === undefined) {
        return '/';
    }

    if (organizationId === undefined) {
        return null;
    }

    return `/app/${encodeURIComponent(organizationId)}/${destination.segment}`;
}

export function resolveActiveDestination(pathname: string): ProductDestinationKey | null {
    if (pathname === '/') {
        return 'overview';
    }

    const match = /^\/app\/[^/]+\/([^/]+)(?:\/|$)/u.exec(pathname);
    const segment = match?.[1];

    if (segment === undefined) {
        return null;
    }

    for (const group of NAVIGATION_GROUPS) {
        const destination = group.destinations.find((item) => item.segment === segment);

        if (destination !== undefined) {
            return destination.key;
        }
    }

    return SETTINGS_DESTINATION.segment === segment ? SETTINGS_DESTINATION.key : null;
}

export function shortenOpaqueIdentifier(value: string): string {
    if (value.length <= 12) {
        return value;
    }

    return `${value.slice(0, 8)}…`;
}
