'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { useTranslations } from '../i18n/localization-provider';
import type { Translator } from '../i18n/translator';
import { AppLink, Badge, Dialog, IconButton } from '../ui';
import {
    NAVIGATION_GROUPS,
    OVERVIEW_DESTINATION,
    SETTINGS_DESTINATION,
    buildDestinationHref,
    resolveActiveDestination,
    shortenOpaqueIdentifier,
    type NavigationDestination,
    type ProductDestinationKey,
} from './navigation-model';
import styles from './application-navigation.module.css';

export interface ApplicationNavigationProps {
    readonly organizationId: string | undefined;
}

export function ApplicationNavigation({ organizationId }: ApplicationNavigationProps) {
    const pathname = usePathname();
    const t = useTranslations('shell');
    const [mobileOpen, setMobileOpen] = useState(false);
    const activeDestination = resolveActiveDestination(pathname);
    const currentPageLabel = resolveDestinationLabel(activeDestination, t);
    const overviewHref = buildDestinationHref(OVERVIEW_DESTINATION, organizationId) ?? '/';

    useEffect(() => {
        const desktopQuery = window.matchMedia('(min-width: 64rem)');

        const closeOnDesktop = (event: MediaQueryListEvent) => {
            if (event.matches) {
                setMobileOpen(false);
            }
        };

        desktopQuery.addEventListener('change', closeOnDesktop);

        return () => {
            desktopQuery.removeEventListener('change', closeOnDesktop);
        };
    }, []);

    return (
        <>
            <aside className={styles['desktopSidebar']} aria-label={t('navigation.shellLabel')}>
                <Brand href={overviewHref} />

                <OrganizationSlot organizationId={organizationId} t={t} />

                <NavigationContent
                    activeDestination={activeDestination}
                    organizationId={organizationId}
                    t={t}
                    onNavigate={undefined}
                />

                <div className={styles['sidebarFooter']}>
                    <SecondaryDestination
                        destination={SETTINGS_DESTINATION}
                        activeDestination={activeDestination}
                        organizationId={organizationId}
                        t={t}
                        onNavigate={undefined}
                    />
                    <AccountSlot t={t} />
                </div>
            </aside>

            <header className={styles['mobileHeader']}>
                <Brand href={overviewHref} compact />

                <div className={styles['mobileContext']}>
                    <span className={styles['mobileContextLabel']}>
                        {t('navigation.currentLabel')}
                    </span>
                    <strong>{currentPageLabel}</strong>
                </div>

                <IconButton
                    variant="ghost"
                    label={t('navigation.open')}
                    aria-expanded={mobileOpen}
                    aria-haspopup="dialog"
                    onClick={() => {
                        setMobileOpen(true);
                    }}
                >
                    <span className={styles['menuIcon']} aria-hidden="true">
                        <span />
                        <span />
                        <span />
                    </span>
                </IconButton>
            </header>

            <Dialog
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                title={t('navigation.title')}
                description={t('navigation.description')}
                closeLabel={t('navigation.close')}
                className={styles['mobileDialog'] ?? ''}
            >
                <div className={styles['mobileNavigation']}>
                    <OrganizationSlot organizationId={organizationId} t={t} />

                    <NavigationContent
                        activeDestination={activeDestination}
                        organizationId={organizationId}
                        t={t}
                        onNavigate={() => {
                            setMobileOpen(false);
                        }}
                    />

                    <div className={styles['mobileFooter']}>
                        <SecondaryDestination
                            destination={SETTINGS_DESTINATION}
                            activeDestination={activeDestination}
                            organizationId={organizationId}
                            t={t}
                            onNavigate={() => {
                                setMobileOpen(false);
                            }}
                        />
                        <AccountSlot t={t} />
                    </div>
                </div>
            </Dialog>
        </>
    );
}

interface BrandProps {
    readonly compact?: boolean;
    readonly href: string;
}

function Brand({ compact = false, href }: BrandProps) {
    return (
        <AppLink
            href={href}
            className={compact ? styles['brandCompact'] : styles['brand']}
            underline="hover"
        >
            <Image
                className={styles['brandMark']}
                src="/brand/manasiness-mark.svg"
                alt=""
                width={compact ? 32 : 38}
                height={compact ? 32 : 38}
                priority
                unoptimized
            />
            <span>Manasiness</span>
        </AppLink>
    );
}

interface OrganizationSlotProps {
    readonly organizationId: string | undefined;
    readonly t: Translator;
}

function OrganizationSlot({ organizationId, t }: OrganizationSlotProps) {
    const context =
        organizationId === undefined
            ? t('organization.pending')
            : t('organization.routeContext', {
                  id: shortenOpaqueIdentifier(organizationId),
              });

    return (
        <div
            className={styles['organizationSlot']}
            role="group"
            aria-label={t('organization.label')}
            data-shell-slot="organization-switcher"
        >
            <span className={styles['slotLabel']}>{t('organization.label')}</span>
            <span className={styles['slotValue']}>{context}</span>
        </div>
    );
}

interface NavigationContentProps {
    readonly activeDestination: ProductDestinationKey | null;
    readonly organizationId: string | undefined;
    readonly t: Translator;
    readonly onNavigate: (() => void) | undefined;
}

function NavigationContent({
    activeDestination,
    onNavigate,
    organizationId,
    t,
}: NavigationContentProps) {
    return (
        <nav className={styles['navigation']} aria-label={t('navigation.primaryLabel')}>
            {NAVIGATION_GROUPS.map((group) => (
                <section key={group.key} className={styles['navigationGroup']}>
                    <p className={styles['groupLabel']}>{t(`navigation.groups.${group.key}`)}</p>
                    <ul className={styles['navigationList']}>
                        {group.destinations.map((destination) => (
                            <li key={destination.key}>
                                <Destination
                                    destination={destination}
                                    active={activeDestination === destination.key}
                                    organizationId={organizationId}
                                    t={t}
                                    onNavigate={onNavigate}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </nav>
    );
}

interface DestinationProps {
    readonly active: boolean;
    readonly destination: NavigationDestination;
    readonly organizationId: string | undefined;
    readonly t: Translator;
    readonly onNavigate: (() => void) | undefined;
}

function Destination({ active, destination, onNavigate, organizationId, t }: DestinationProps) {
    const label = t(`navigation.items.${destination.key}`);
    const href = buildDestinationHref(destination, organizationId);

    if (href === null) {
        return (
            <div className={styles['navItemUnavailable']} data-availability="unimplemented">
                <span>{label}</span>
                <Badge className={styles['availabilityBadge']} tone="neutral">
                    {t('navigation.notAvailable')}
                </Badge>
            </div>
        );
    }

    return (
        <AppLink
            href={href}
            className={navigationItemClassName(active)}
            aria-current={active ? 'page' : undefined}
            onClick={() => {
                onNavigate?.();
            }}
        >
            {label}
        </AppLink>
    );
}

function navigationItemClassName(active: boolean): string {
    return [styles['navItemLink'], active ? styles['navItemActive'] : undefined]
        .filter((value): value is string => value !== undefined)
        .join(' ');
}

interface SecondaryDestinationProps {
    readonly activeDestination: ProductDestinationKey | null;
    readonly destination: NavigationDestination;
    readonly organizationId: string | undefined;
    readonly t: Translator;
    readonly onNavigate: (() => void) | undefined;
}

function SecondaryDestination({
    activeDestination,
    destination,
    onNavigate,
    organizationId,
    t,
}: SecondaryDestinationProps) {
    return (
        <div className={styles['secondaryDestination']}>
            <Destination
                destination={destination}
                active={activeDestination === destination.key}
                organizationId={organizationId}
                t={t}
                onNavigate={onNavigate}
            />
        </div>
    );
}

interface AccountSlotProps {
    readonly t: Translator;
}

function AccountSlot({ t }: AccountSlotProps) {
    return (
        <div
            className={styles['accountSlot']}
            role="group"
            aria-label={t('account.label')}
            data-shell-slot="identity-account-menu"
        >
            <span className={styles['accountGlyph']} aria-hidden="true">
                <span />
            </span>
            <span className={styles['accountCopy']}>
                <strong>{t('account.label')}</strong>
                <span>{t('account.pending')}</span>
            </span>
        </div>
    );
}

function resolveDestinationLabel(
    destination: ProductDestinationKey | null,
    t: Translator,
): ReactNode {
    return destination === null ? t('navigation.unknown') : t(`navigation.items.${destination}`);
}
