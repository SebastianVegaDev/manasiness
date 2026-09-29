import type { DatabaseRuntimeConfig } from '@manasiness/database';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger as PinoNestLogger } from 'nestjs-pino';
import type { DestinationStream } from 'pino';

import { AppModule } from '../../app.module.js';
import type { ApiRuntimeConfig } from '../config/api-runtime-config.js';
import { configureApiContractBoundary } from '../http/configure-api-contract-boundary.js';
import { configureHttpApplication } from '../http/configure-http-application.js';
import { configureOpenApi } from '../openapi/configure-openapi.js';

export interface CreateApiApplicationOptions {
    readonly config: ApiRuntimeConfig;

    readonly databaseConfig: DatabaseRuntimeConfig;

    readonly logDestination?: DestinationStream;

    readonly enableShutdownHooks?: boolean;
}

export async function createApiApplication(
    options: CreateApiApplicationOptions,
): Promise<NestExpressApplication> {
    const app = await NestFactory.create<NestExpressApplication>(
        AppModule.register({
            database: {
                config: options.databaseConfig,

                applicationName: options.config.service.name,
            },

            observability: {
                serviceName: options.config.service.name,

                environment: options.config.environment,

                level: options.config.logging.level,

                pretty: options.config.logging.pretty,

                ...(options.logDestination === undefined
                    ? {}
                    : {
                          destination: options.logDestination,
                      }),
            },

            health: {
                readinessTimeoutMs: options.config.health.readinessTimeoutMs,
            },
        }),
        {
            abortOnError: false,
            bufferLogs: true,
        },
    );

    app.useLogger(app.get(PinoNestLogger));

    configureHttpApplication(app, options.config.http);

    configureApiContractBoundary(app);

    configureOpenApi(app, {
        enabled: options.config.documentation.enabled,
    });

    if (options.enableShutdownHooks === true) {
        app.enableShutdownHooks();
    }

    return app;
}
