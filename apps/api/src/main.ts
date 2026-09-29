import { loadDatabaseRuntimeConfig } from '@manasiness/database';
import { Logger } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { createApiApplication } from './platform/bootstrap/create-api-application.js';
import { loadApiRuntimeConfig } from './platform/config/api-runtime-config.js';
import { loadApiEnvironmentFileIfPresent } from './platform/config/load-environment-file.js';
import { toSafeLogError } from './platform/logging/log-safety.js';

const bootstrapLogger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
    loadApiEnvironmentFileIfPresent();

    const config = loadApiRuntimeConfig();

    const databaseConfig = loadDatabaseRuntimeConfig(process.env);

    let app: NestExpressApplication | undefined;

    try {
        app = await createApiApplication({
            config,

            databaseConfig,

            enableShutdownHooks: true,
        });

        await app.listen(config.http.port, config.http.host);

        bootstrapLogger.log(
            {
                event: 'api.started',

                service: config.service.name,

                environment: config.environment,

                host: config.http.host,

                port: config.http.port,
            },
            'API started.',
        );
    } catch (error: unknown) {
        if (app !== undefined) {
            try {
                await app.close();
            } catch (closeError: unknown) {
                bootstrapLogger.error(
                    {
                        event: 'api.bootstrap_cleanup_failed',

                        error: toSafeLogError(closeError),
                    },
                    'API cleanup failed after unsuccessful startup.',
                );
            }
        }

        throw normalizeError(error, 'API bootstrap failed.');
    }
}

function normalizeError(error: unknown, fallbackMessage: string): Error {
    if (error instanceof Error) {
        return error;
    }

    return new Error(fallbackMessage);
}

try {
    await bootstrap();
} catch (error: unknown) {
    bootstrapLogger.error(
        {
            event: 'api.bootstrap_failed',

            error: toSafeLogError(error),
        },
        'API bootstrap failed.',
    );

    process.exitCode = 1;
}
