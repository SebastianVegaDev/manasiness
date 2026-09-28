import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module.js';
import { readApiBootstrapOptions } from './platform/bootstrap/api-bootstrap-options.js';
import { configureHttpApplication } from './platform/http/configure-http-application.js';

const bootstrapLogger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
    const options = readApiBootstrapOptions(process.env);

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        abortOnError: false,
    });

    try {
        configureHttpApplication(app, options);

        app.enableShutdownHooks();

        await app.listen(options.port, options.host);

        bootstrapLogger.log(
            `API listening on http://${options.host}:${String(options.port)}`,
        );
    } catch (error: unknown) {
        const startupError = normalizeError(error, 'API bootstrap failed.');

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

function normalizeError(error: unknown, fallbackMessage: string): Error {
    if (error instanceof Error) {
        return error;
    }

    return new Error(fallbackMessage, {
        cause: error,
    });
}

try {
    await bootstrap();
} catch (error: unknown) {
    const startupError = normalizeError(error, 'API bootstrap failed.');

    bootstrapLogger.error(startupError.message, startupError.stack);

    process.exitCode = 1;
}