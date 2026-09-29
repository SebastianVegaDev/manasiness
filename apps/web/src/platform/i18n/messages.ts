import type { SupportedLocale } from './locale';
import type { MessageCatalog } from './translator';

const enUSMessages = {
    metadata: {
        description: 'Manasiness web application.',
    },
    landing: {
        kicker: 'Product foundation',
        description: 'Web application foundation is running.',
    },
    shell: {
        skipToContent: 'Skip to main content',
        navigation: {
            shellLabel: 'Application navigation',
            primaryLabel: 'Primary navigation',
            currentLabel: 'Current page',
            unknown: 'Product',
            title: 'Navigation',
            description: 'Move between available Manasiness product areas.',
            open: 'Open navigation',
            close: 'Close navigation',
            notAvailable: 'Later',
            groups: {
                operate: 'Operate',
                manage: 'Manage',
                understand: 'Understand',
                utility: 'Utility',
            },
            items: {
                overview: 'Overview',
                sales: 'Sales',
                purchasing: 'Purchasing',
                catalog: 'Catalog',
                inventory: 'Inventory',
                relationships: 'Relationships',
                workforce: 'Workforce',
                finance: 'Finance',
                reporting: 'Reporting',
                assistant: 'Operational Assistant',
                settings: 'Organization Settings',
            },
        },
        organization: {
            label: 'Organization',
            pending: 'Selection arrives in M3',
            routeContext: 'Context {id}',
        },
        account: {
            label: 'Account',
            pending: 'Identity controls arrive in M3',
        },
    },
    overviewFoundation: {
        eyebrow: 'Product experience foundation',
        title: 'Overview',
        description:
            'A clear starting point for daily operational work. Real business state will appear here only when its owning capabilities exist.',
        foundation: {
            title: 'The application shell is ready for real product capabilities.',
            body: 'M2 now owns orientation, responsive navigation, page hierarchy, and stable extension points without inventing business data.',
            badge: 'Foundation ready',
        },
        organization: {
            title: 'Organization context is reserved, not fabricated.',
            scopedBody:
                'This route carries an explicit Organization identifier. M3 will validate Membership and resolve the Organization display context.',
            unscopedBody:
                'The shell reserves Organization selection without pretending an authenticated Organization already exists.',
            scopedBadge: 'Route scoped',
            deferredBadge: 'M3 handoff',
        },
        domains: {
            title: 'Business areas activate only with real workflows.',
            body: 'Sales, Catalog, Inventory, Finance, and the other V1 areas remain unavailable until their owning milestones provide actual capabilities.',
            badge: 'Not implemented',
        },
    },
    health: {
        api: {
            checking: 'API connection: checking.',
            unavailable: 'API connection: unavailable.',
            ready: 'API connection: ready.',
        },
    },
    diagnostics: {
        primitives: {
            kicker: 'Interaction foundation',
            title: 'Shared UI primitives are active.',
            description:
                'This temporary engineering surface exercises keyboard, focus, form, disabled-state, and dialog behavior before the application shell replaces it.',
            field: {
                label: 'Foundation name',
                description:
                    'Native field semantics stay explicit and feature-owned forms can compose them.',
            },
            menu: {
                trigger: 'Foundation actions',
                markReviewed: 'Mark reviewed',
                resetReview: 'Reset review',
                unavailable: 'Unavailable action',
            },
            dialog: {
                open: 'Open dialog',
                title: 'Primitive dialog',
                description:
                    'The native modal dialog owns top-layer modality while Manasiness owns its visual and API contract.',
                close: 'Close dialog',
                done: 'Done',
                body: 'Keyboard users can dismiss this dialog with Escape or the explicit close control. Focus returns to the control that opened it.',
            },
            disabledControl: 'Disabled control',
            status: {
                line: 'Last action: {action}',
                none: 'None',
                reviewed: 'Reviewed',
                reset: 'Reset',
            },
        },
    },
} as const satisfies MessageCatalog;

const esPEMessages = {
    metadata: {
        description: 'Aplicación web de Manasiness.',
    },
    landing: {
        kicker: 'Base del producto',
        description: 'La base de la aplicación web está operativa.',
    },
    shell: {
        skipToContent: 'Saltar al contenido principal',
        navigation: {
            shellLabel: 'Navegación de la aplicación',
            primaryLabel: 'Navegación principal',
            currentLabel: 'Página actual',
            unknown: 'Producto',
            title: 'Navegación',
            description: 'Muévete entre las áreas disponibles de Manasiness.',
            open: 'Abrir navegación',
            close: 'Cerrar navegación',
            notAvailable: 'Más adelante',
            groups: {
                operate: 'Operar',
                manage: 'Gestionar',
                understand: 'Comprender',
                utility: 'Utilidad',
            },
            items: {
                overview: 'Resumen',
                sales: 'Ventas',
                purchasing: 'Compras',
                catalog: 'Catálogo',
                inventory: 'Inventario',
                relationships: 'Relaciones',
                workforce: 'Personal',
                finance: 'Finanzas',
                reporting: 'Reportes',
                assistant: 'Asistente operativo',
                settings: 'Configuración de la organización',
            },
        },
        organization: {
            label: 'Organización',
            pending: 'La selección llega en M3',
            routeContext: 'Contexto {id}',
        },
        account: {
            label: 'Cuenta',
            pending: 'Los controles de identidad llegan en M3',
        },
    },
    overviewFoundation: {
        eyebrow: 'Base de experiencia del producto',
        title: 'Resumen',
        description:
            'Un punto de partida claro para el trabajo operativo diario. El estado real del negocio aparecerá aquí solo cuando existan las capacidades responsables.',
        foundation: {
            title: 'El shell de la aplicación está listo para capacidades reales del producto.',
            body: 'M2 ya es responsable de la orientación, la navegación responsive, la jerarquía de página y los puntos de extensión estables sin inventar datos del negocio.',
            badge: 'Base lista',
        },
        organization: {
            title: 'El contexto de Organización está reservado, no inventado.',
            scopedBody:
                'Esta ruta lleva un identificador explícito de Organización. M3 validará Membership y resolverá el contexto visible de la Organización.',
            unscopedBody:
                'El shell reserva la selección de Organización sin fingir que ya existe una Organización autenticada.',
            scopedBadge: 'Ruta con contexto',
            deferredBadge: 'Entrega a M3',
        },
        domains: {
            title: 'Las áreas de negocio se activan solo con flujos reales.',
            body: 'Ventas, Catálogo, Inventario, Finanzas y las demás áreas V1 permanecen no disponibles hasta que sus milestones responsables implementen capacidades reales.',
            badge: 'No implementado',
        },
    },
    health: {
        api: {
            checking: 'Conexión con la API: comprobando.',
            unavailable: 'Conexión con la API: no disponible.',
            ready: 'Conexión con la API: operativa.',
        },
    },
    diagnostics: {
        primitives: {
            kicker: 'Base de interacción',
            title: 'Los componentes de interfaz compartidos están activos.',
            description:
                'Esta superficie temporal de ingeniería ejercita teclado, foco, formularios, estados deshabilitados y diálogos antes de que el shell de la aplicación la reemplace.',
            field: {
                label: 'Nombre de la base',
                description:
                    'La semántica nativa de los campos se mantiene explícita y los formularios de cada feature pueden componerla.',
            },
            menu: {
                trigger: 'Acciones de la base',
                markReviewed: 'Marcar como revisado',
                resetReview: 'Restablecer revisión',
                unavailable: 'Acción no disponible',
            },
            dialog: {
                open: 'Abrir diálogo',
                title: 'Diálogo de componentes',
                description:
                    'El diálogo modal nativo controla la modalidad de capa superior mientras Manasiness controla su contrato visual y de API.',
                close: 'Cerrar diálogo',
                done: 'Listo',
                body: 'Las personas que usan teclado pueden cerrar este diálogo con Escape o con el control de cierre explícito. El foco vuelve al control que abrió el diálogo.',
            },
            disabledControl: 'Control deshabilitado',
            status: {
                line: 'Última acción: {action}',
                none: 'Ninguna',
                reviewed: 'Revisado',
                reset: 'Restablecida',
            },
        },
    },
} as const satisfies MessageCatalog;

const platformMessages: Readonly<Record<SupportedLocale, MessageCatalog>> = {
    'en-US': enUSMessages,
    'es-PE': esPEMessages,
};

export function getPlatformMessages(locale: SupportedLocale): MessageCatalog {
    return platformMessages[locale];
}

export const PLATFORM_MESSAGE_CATALOGS = platformMessages;
