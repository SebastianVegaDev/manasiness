import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

import type { ApiHttpRuntimeConfig } from '../config/api-runtime-config.js';

const allowedHttpMethods = [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
] as const;

export function configureHttpApplication(
    app: NestExpressApplication,
    config: ApiHttpRuntimeConfig,
): void {
    app.disable('x-powered-by');

    app.use(helmet());

    app.useBodyParser('json', {
        limit: config.bodyLimitBytes,
    });

    app.useBodyParser('urlencoded', {
        limit: config.bodyLimitBytes,
    });

    app.enableCors({
        origin: [...config.corsOrigins],
        methods: [...allowedHttpMethods],
    });
}