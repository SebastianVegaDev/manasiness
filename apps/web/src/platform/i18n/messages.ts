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
