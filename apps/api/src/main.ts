import { loadDatabaseRuntimeConfig } from '@manasiness/database';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module.js';
import { loadApiRuntimeConfig } from './platform/config/api-runtime-config.js';
import { loadApiEnvironmentFileIfPresent } from './platform/config/load-environment-file.js';
import { resolveNestLogLevels } from './platform/config/nest-log-levels.js';
import { configureHttpApplication } from './platform/http/configure-http-application.js';

const bootstrapLogger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
    loadApiEnvironmentFileIfPresent();

    const config = loadApiRuntimeConfig();
    const databaseConfig =
        loadDatabaseRuntimeConfig(process.env);

    const app =
        await NestFactory.create<NestExpressApplication>(
            AppModule.register({
                database: {
                    config: databaseConfig,
                    applicationName:
                        config.service.name,
                },
            }),
            {
                abortOnError: false,
                logger: resolveNestLogLevels(
                    config.service.logLevel,
                ),
            },
        );

    try {
        configureHttpApplication(app, config.http);

        app.enableShutdownHooks();

        await app.listen(
            config.http.port,
            config.http.host,
        );

        bootstrapLogger.log(
            `${config.service.name} listening on http://${config.http.host}:${String(config.http.port)} [${config.environment}]`,
        );
    } catch (error: unknown) {
        const startupError = normalizeError(
            error,
            'API bootstrap failed.',
        );

        try {
            await app.close();
        } catch (closeError: unknown) {
            const shutdownError = normalizeError(
                closeError,
                'API cleanup failed after an unsuccessful startup.',
            );

            bootstrapLogger.error(
                shutdownError.message,
                shutdownError.stack,
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

    return new Error(fallbackMessage);
}

try {
    await bootstrap();
} catch (error: unknown) {
    const startupError = normalizeError(
        error,
        'API bootstrap failed.',
    );

    bootstrapLogger.error(
        startupError.message,
        startupError.stack,
    );

    process.exitCode = 1;
}