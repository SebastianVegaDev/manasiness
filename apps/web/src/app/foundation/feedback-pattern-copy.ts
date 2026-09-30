import type { SupportedLocale } from '../../platform/i18n/locale';

const COPY = {
    'en-US': {
        kicker: 'Feedback and state foundation',
        title: 'Feedback stays clear, proportional, and recoverable.',
        description:
            'This engineering fixture demonstrates product-wide alerts, transient notification behavior, generic states, structured failure treatment, and consequential confirmation without inventing business semantics.',
        alerts: {
            title: 'Feedback channels',
            infoTitle: 'Context stays inline when it remains useful.',
            infoBody:
                'Persistent information should remain available instead of disappearing in a toast.',
            successTitle: 'A completed change can be confirmed without interrupting work.',
            successBody:
                'Use persistent success only when the resulting state is not already obvious.',
            warningTitle: 'A warning explains risk before work continues.',
            warningBody:
                'Warning meaning remains visible in text and does not rely on color alone.',
            criticalTitle: 'A blocking problem needs a durable recovery path.',
            criticalBody:
                'Essential error information stays on the page even if a transient notification also exists.',
            bannerTitle: 'Persistent banner example',
            bannerBody:
                'Use a banner for cross-surface information that must remain visible while the condition lasts.',
        },
        toast: {
            title: 'Transient notification',
            show: 'Show saved notification',
            savedTitle: 'Fixture saved',
            savedBody:
                'This non-essential confirmation can dismiss automatically or be dismissed manually.',
            viewportLabel: 'Transient notifications',
            dismiss: 'Dismiss',
        },
        states: {
            title: 'Generic page and section states',
            previewLabel: 'State preview',
            ready: 'Ready content',
            loading: 'Initial loading',
            refreshing: 'Background refresh',
            empty: 'Truly empty',
            zeroResults: 'Zero results',
            notConfigured: 'Not configured',
            noHistory: 'No history',
            error: 'Recoverable error',
            unavailable: 'Unavailable',
            loadingLabel: 'Loading feedback fixture content.',
            refreshingLabel: 'Refreshing while current content remains visible…',
            readyTitle: 'Useful content remains visible.',
            readyBody: 'The fixture keeps stable content on screen during a background refresh.',
            emptyTitle: 'Nothing exists here yet.',
            emptyBody:
                'A true empty state describes absence of records or content, not a failed search.',
            zeroTitle: 'Nothing matches the current view.',
            zeroBody:
                'The underlying content still exists. Adjust search or filters to broaden the view.',
            notConfiguredTitle: 'This area is not configured yet.',
            notConfiguredBody:
                'Offer setup only when the current operator genuinely has a valid setup action.',
            noHistoryTitle: 'No history has been recorded yet.',
            noHistoryBody: 'History absence is normal until the first relevant event exists.',
            unavailableTitle: 'This area is unavailable.',
            unavailableBody:
                'Unavailable is distinct from not found, empty, or a temporary loading failure.',
            errorTitle: 'This section could not be loaded.',
            errorBody: 'A recoverable read failure exposes retry only when retry is legitimate.',
            retry: 'Retry state preview',
        },
        failures: {
            title: 'Structured failure treatment',
            previewLabel: 'Failure preview',
            network: 'Network failure',
            internal: 'Internal API error',
            protocol: 'Protocol failure',
            networkTitle: 'The service could not be reached.',
            networkBody: 'Check the connection and try the read again when appropriate.',
            internalTitle: 'Something unexpected prevented this view from loading.',
            internalBody:
                'The technical API message is not shown. The request ID remains available for support.',
            protocolTitle: 'The service returned an unexpected response.',
            protocolBody:
                'A protocol mismatch is treated separately from a normal business rejection.',
            requestId: 'Request ID:',
            retry: 'Retry failure preview',
            resolved: 'Recovery action completed.',
        },
        confirmation: {
            title: 'Consequential confirmation',
            open: 'Open irreversible confirmation',
            dialogTitle: 'Remove local feedback evidence',
            description: 'Confirm the exact action and its consequence.',
            consequence:
                'This engineering action clears only local fixture evidence. It does not delete product or business data.',
            consequenceLabel: 'Irreversible',
            confirm: 'Remove local feedback evidence',
            pending: 'Removing evidence…',
            cancel: 'Keep local feedback evidence',
            close: 'Close confirmation',
            completed: 'Consequential confirmation completed.',
        },
        statuses: {
            title: 'Status indicators',
            normal: 'Operational',
            warning: 'Needs attention',
            critical: 'Blocked',
        },
    },
    'es-PE': {
        kicker: 'Base de feedback y estados',
        title: 'El feedback se mantiene claro, proporcional y recuperable.',
        description:
            'Esta fixture de ingeniería demuestra alertas de producto, notificaciones transitorias, estados genéricos, tratamiento estructurado de fallos y confirmaciones con consecuencias sin inventar semántica de negocio.',
        alerts: {
            title: 'Canales de feedback',
            infoTitle: 'El contexto permanece inline cuando sigue siendo útil.',
            infoBody:
                'La información persistente debe seguir disponible en lugar de desaparecer en un toast.',
            successTitle: 'Un cambio completado puede confirmarse sin interrumpir el trabajo.',
            successBody:
                'Usa éxito persistente solo cuando el estado resultante no sea ya evidente.',
            warningTitle: 'Una advertencia explica el riesgo antes de continuar.',
            warningBody:
                'El significado de advertencia permanece visible en texto y no depende solo del color.',
            criticalTitle: 'Un problema bloqueante necesita una ruta de recuperación duradera.',
            criticalBody:
                'La información esencial de error permanece en la página aunque también exista una notificación transitoria.',
            bannerTitle: 'Ejemplo de banner persistente',
            bannerBody:
                'Usa un banner para información transversal que deba seguir visible mientras dure la condición.',
        },
        toast: {
            title: 'Notificación transitoria',
            show: 'Mostrar notificación guardada',
            savedTitle: 'Fixture guardada',
            savedBody:
                'Esta confirmación no esencial puede cerrarse automáticamente o manualmente.',
            viewportLabel: 'Notificaciones transitorias',
            dismiss: 'Cerrar',
        },
        states: {
            title: 'Estados genéricos de página y sección',
            previewLabel: 'Vista previa de estado',
            ready: 'Contenido listo',
            loading: 'Carga inicial',
            refreshing: 'Actualización en segundo plano',
            empty: 'Realmente vacío',
            zeroResults: 'Cero resultados',
            notConfigured: 'No configurado',
            noHistory: 'Sin historial',
            error: 'Error recuperable',
            unavailable: 'No disponible',
            loadingLabel: 'Cargando contenido de la fixture de feedback.',
            refreshingLabel: 'Actualizando mientras el contenido actual permanece visible…',
            readyTitle: 'El contenido útil permanece visible.',
            readyBody:
                'La fixture mantiene contenido estable en pantalla durante una actualización en segundo plano.',
            emptyTitle: 'Todavía no existe contenido aquí.',
            emptyBody:
                'Un estado realmente vacío describe ausencia de contenido, no una búsqueda fallida.',
            zeroTitle: 'Nada coincide con la vista actual.',
            zeroBody:
                'El contenido subyacente sigue existiendo. Ajusta la búsqueda o filtros para ampliar la vista.',
            notConfiguredTitle: 'Esta área todavía no está configurada.',
            notConfiguredBody:
                'Ofrece configuración solo cuando el operador actual tenga realmente una acción válida.',
            noHistoryTitle: 'Todavía no se ha registrado historial.',
            noHistoryBody:
                'La ausencia de historial es normal hasta que exista el primer evento relevante.',
            unavailableTitle: 'Esta área no está disponible.',
            unavailableBody:
                'No disponible es distinto de no encontrado, vacío o un fallo temporal de carga.',
            errorTitle: 'No se pudo cargar esta sección.',
            errorBody:
                'Un fallo recuperable de lectura ofrece reintento solo cuando reintentar es legítimo.',
            retry: 'Reintentar vista previa',
        },
        failures: {
            title: 'Tratamiento estructurado de fallos',
            previewLabel: 'Vista previa de fallo',
            network: 'Fallo de red',
            internal: 'Error interno de API',
            protocol: 'Fallo de protocolo',
            networkTitle: 'No se pudo contactar al servicio.',
            networkBody: 'Revisa la conexión y vuelve a intentar la lectura cuando corresponda.',
            internalTitle: 'Algo inesperado impidió cargar esta vista.',
            internalBody:
                'El mensaje técnico de la API no se muestra. El ID de solicitud queda disponible para soporte.',
            protocolTitle: 'El servicio devolvió una respuesta inesperada.',
            protocolBody:
                'Un desajuste de protocolo se trata separado de un rechazo normal de negocio.',
            requestId: 'ID de solicitud:',
            retry: 'Reintentar vista previa de fallo',
            resolved: 'Acción de recuperación completada.',
        },
        confirmation: {
            title: 'Confirmación con consecuencias',
            open: 'Abrir confirmación irreversible',
            dialogTitle: 'Eliminar evidencia local de feedback',
            description: 'Confirma la acción exacta y su consecuencia.',
            consequence:
                'Esta acción de ingeniería elimina solo evidencia local de la fixture. No elimina datos del producto ni del negocio.',
            consequenceLabel: 'Irreversible',
            confirm: 'Eliminar evidencia local de feedback',
            pending: 'Eliminando evidencia…',
            cancel: 'Conservar evidencia local de feedback',
            close: 'Cerrar confirmación',
            completed: 'Confirmación con consecuencias completada.',
        },
        statuses: {
            title: 'Indicadores de estado',
            normal: 'Operativo',
            warning: 'Requiere atención',
            critical: 'Bloqueado',
        },
    },
} as const;

export function getFeedbackPatternCopy(locale: SupportedLocale) {
    return COPY[locale];
}
