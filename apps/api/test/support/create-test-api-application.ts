import { loadDatabaseTestApplicationRuntimeConfig } from '@manasiness/database/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { DestinationStream } from 'pino';

import { createApiApplication } from '../../src/platform/bootstrap/create-api-application.js';
import { loadApiRuntimeConfig } from '../../src/platform/config/api-runtime-config.js';
import { loadApiTestEnvironmentFileIfPresent } from './load-test-environment.js';

export interface StartTestApiApplicationOptions {
    readonly logDestination?: DestinationStream;
}

export async function startTestApiApplication(
    options: StartTestApiApplicationOptions = {},
): Promise<NestExpressApplication> {
    loadApiTestEnvironmentFileIfPresent();

    const config = loadApiRuntimeConfig({
        APP_ENV: 'test',

        API_SERVICE_NAME: 'manasiness-api-test',

        API_LOG_LEVEL: 'error',

        API_LOG_PRETTY: 'false',

        API_HOST: '127.0.0.1',

        API_PORT: '3001',

        API_BODY_LIMIT_BYTES: '1048576',

        API_CORS_ORIGINS: 'http://127.0.0.1:3000',

        API_DOCS_ENABLED: 'true',

        API_READINESS_TIMEOUT_MS: '1000',
    });

    const databaseConfig = loadDatabaseTestApplicationRuntimeConfig({
        ...process.env,

        DATABASE_POOL_MAX: '3',

        DATABASE_CONNECTION_TIMEOUT_MS: '2000',
    });

    const app = await createApiApplication({
        config,

        databaseConfig,

        ...(options.logDestination === undefined
            ? {}
            : {
                  logDestination: options.logDestination,
              }),
    });

    await app.listen(0, '127.0.0.1');

    return app;
}
