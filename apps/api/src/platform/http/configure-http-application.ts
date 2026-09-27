import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

import type { ApiBootstrapOptions } from '../bootstrap/api-bootstrap-options.js';

const ALLOWED_HTTP_METHODS = [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
] as const;

export function configureHttpApplication(
    app: NestExpressApplication,
    options: ApiBootstrapOptions,
): void {
    app.disable('x-powered-by');

    app.use(helmet());

    app.useBodyParser('json', {
        limit: options.bodyLimitBytes,
    });

    app.useBodyParser('urlencoded', {
        limit: options.bodyLimitBytes,
    });

    app.enableCors({
        origin: [...options.corsOrigins],
        methods: [...ALLOWED_HTTP_METHODS],
    });
}