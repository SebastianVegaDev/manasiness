import type { SupportedLocale } from '../../platform/i18n/locale';

const COPY = {
    'en-US': {
        kicker: 'Collection interaction foundation',
        title: 'Operational lists keep state explicit and feature-owned.',
        description:
            'This engineering fixture demonstrates URL-backed search and filtering, pagination presentation, semantic tabular data, compact/mobile composition, and distinct collection states without inventing a business screen.',
        toolbarLabel: 'Collection controls',
        search: {
            formLabel: 'Collection search',
            label: 'Search fixtures',
            placeholder: 'Reference or name',
            submit: 'Search',
            clear: 'Clear search',
        },
        filter: {
            label: 'Status',
            all: 'All statuses',
            ready: 'Ready',
            review: 'Needs review',
            paused: 'Paused',
        },
        preview: {
            label: 'State preview',
            ready: 'Loaded data',
            loading: 'Initial loading',
            refreshing: 'Background refresh',
            empty: 'Empty collection',
            error: 'Recoverable load error',
            unavailable: 'Unavailable',
        },
        resultsLabel: 'Matching records',
        refreshing: 'Refreshing visible records…',
        tableCaption: 'Representative collection records',
        compactLabel: 'Representative collection records in compact layout',
        columns: {
            reference: 'Reference',
            name: 'Name',
            status: 'Status',
            quantity: 'Quantity',
            updated: 'Updated',
        },
        pagination: {
            label: 'Collection pages',
            previous: 'Previous',
            next: 'Next',
            page: 'Page',
            of: 'of',
        },
        states: {
            loading: 'Loading collection records.',
            empty: {
                title: 'No records exist yet.',
                description:
                    'A truly empty collection is different from a search or filter that has no matches.',
            },
            zero: {
                title: 'No records match this view.',
                description:
                    'The collection still exists. Clear search or filters to return to the broader result set.',
                action: 'Reset view',
            },
            error: {
                title: 'The collection could not be loaded.',
                description:
                    'Keep the failure recoverable when retrying is legitimate instead of rendering a generic empty state.',
                action: 'Retry preview',
            },
            unavailable: {
                title: 'This collection is unavailable.',
                description:
                    'Unavailable or permission-aware states remain distinct from not found, empty, and load failure.',
            },
        },
    },
    'es-PE': {
        kicker: 'Base de interacción de colecciones',
        title: 'Las listas operativas mantienen el estado explícito y bajo su feature.',
        description:
            'Esta fixture de ingeniería demuestra búsqueda y filtros respaldados por URL, presentación de paginación, datos tabulares semánticos, composición compacta/móvil y estados diferenciados sin inventar una pantalla de negocio.',
        toolbarLabel: 'Controles de la colección',
        search: {
            formLabel: 'Búsqueda de la colección',
            label: 'Buscar fixtures',
            placeholder: 'Referencia o nombre',
            submit: 'Buscar',
            clear: 'Limpiar búsqueda',
        },
        filter: {
            label: 'Estado',
            all: 'Todos los estados',
            ready: 'Listo',
            review: 'Requiere revisión',
            paused: 'Pausado',
        },
        preview: {
            label: 'Vista previa de estado',
            ready: 'Datos cargados',
            loading: 'Carga inicial',
            refreshing: 'Actualización en segundo plano',
            empty: 'Colección vacía',
            error: 'Error de carga recuperable',
            unavailable: 'No disponible',
        },
        resultsLabel: 'Registros coincidentes',
        refreshing: 'Actualizando los registros visibles…',
        tableCaption: 'Registros representativos de colección',
        compactLabel: 'Registros representativos de colección en diseño compacto',
        columns: {
            reference: 'Referencia',
            name: 'Nombre',
            status: 'Estado',
            quantity: 'Cantidad',
            updated: 'Actualizado',
        },
        pagination: {
            label: 'Páginas de la colección',
            previous: 'Anterior',
            next: 'Siguiente',
            page: 'Página',
            of: 'de',
        },
        states: {
            loading: 'Cargando registros de la colección.',
            empty: {
                title: 'Todavía no existen registros.',
                description:
                    'Una colección realmente vacía es distinta de una búsqueda o filtro sin coincidencias.',
            },
            zero: {
                title: 'Ningún registro coincide con esta vista.',
                description:
                    'La colección sigue existiendo. Limpia la búsqueda o los filtros para volver al conjunto general.',
                action: 'Restablecer vista',
            },
            error: {
                title: 'No se pudo cargar la colección.',
                description:
                    'Mantén el fallo recuperable cuando reintentar sea legítimo en lugar de mostrar un estado vacío genérico.',
                action: 'Reintentar vista previa',
            },
            unavailable: {
                title: 'Esta colección no está disponible.',
                description:
                    'Los estados no disponibles o dependientes de permisos siguen siendo distintos de no encontrado, vacío y error de carga.',
            },
        },
    },
} as const;

export function getCollectionPatternCopy(locale: SupportedLocale) {
    return COPY[locale];
}
