import {
    loadDatabaseRuntimeConfig,
} from '@manasiness/database';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import {
    Logger as PinoNestLogger,
} from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { loadApiRuntimeConfig } from './platform/config/api-runtime-config.js';
import { loadApiEnvironmentFileIfPresent } from './platform/config/load-environment-file.js';
import { configureApiContractBoundary } from './platform/http/configure-api-contract-boundary.js';
import { configureHttpApplication } from './platform/http/configure-http-application.js';
import { toSafeLogError } from './platform/logging/log-safety.js';
import { configureOpenApi } from './platform/openapi/configure-openapi.js';

const bootstrapLogger =
    new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
    loadApiEnvironmentFileIfPresent();

    const config =
        loadApiRuntimeConfig();

    const databaseConfig =
        loadDatabaseRuntimeConfig(
            process.env,
        );

    const app =
        await NestFactory.create<NestExpressApplication>(
            AppModule.register({
                database: {
                    config:
                        databaseConfig,

                    applicationName:
                        config.service
                            .name,
                },

                observability: {
                    serviceName:
                        config.service
                            .name,

                    environment:
                        config.environment,

                    level:
                        config.logging
                            .level,

                    pretty:
                        config.logging
                            .pretty,
                },

                health: {
                    readinessTimeoutMs:
                        config.health
                            .readinessTimeoutMs,
                },
            }),
            {
                abortOnError: false,
                bufferLogs: true,
            },
        );

    app.useLogger(
        app.get(
            PinoNestLogger,
        ),
    );

    try {
        configureHttpApplication(
            app,
            config.http,
        );

        configureApiContractBoundary(
            app,
        );

        configureOpenApi(app, {
            enabled:
                config
                    .documentation
                    .enabled,
        });

        app.enableShutdownHooks();

        await app.listen(
            config.http.port,
            config.http.host,
        );

        bootstrapLogger.log(
            {
                event:
                    'api.started',

                service:
                    config.service.name,

                environment:
                    config.environment,

                host:
                    config.http.host,

                port:
                    config.http.port,
            },
            'API started.',
        );
    } catch (error: unknown) {
        const startupError =
            normalizeError(
                error,
                'API bootstrap failed.',
            );

        try {
            await app.close();
        } catch (
            closeError: unknown
        ) {
            bootstrapLogger.error(
                {
                    event:
                        'api.bootstrap_cleanup_failed',

                    error:
                        toSafeLogError(
                            closeError,
                        ),
                },
                'API cleanup failed after unsuccessful startup.',
            );
        }

        throw startupError;
    }
}

function normalizeError(
    error: unknown,
    fallbackMessage: string,
): Error {
    if (error instanceof Error) {
        return error;
    }

    return new Error(
        fallbackMessage,
    );
}

try {
    await bootstrap();
} catch (error: unknown) {
    bootstrapLogger.error(
        {
            event:
                'api.bootstrap_failed',

            error:
                toSafeLogError(
                    error,
                ),
        },
        'API bootstrap failed.',
    );

    process.exitCode = 1;
}