import {
    Logger,
    Module,
    type DynamicModule,
} from '@nestjs/common';

import {
    createDatabaseConnection,
    type DatabaseRuntimeConfig,
} from '@manasiness/database';

import { ContractsPlatformModule } from './platform/contracts/contracts-platform.module.js';
import { DatabaseModule } from './platform/database/database.module.js';
import { HealthModule } from './platform/health/health.module.js';
import { toSafeLogError } from './platform/logging/log-safety.js';
import {
    ObservabilityModule,
} from './platform/logging/observability.module.js';
import type { ObservabilityOptions } from './platform/logging/pino-options.js';

interface AppDatabaseOptions {
    readonly config:
        DatabaseRuntimeConfig;

    readonly applicationName: string;
}

interface AppHealthOptions {
    readonly readinessTimeoutMs: number;
}

interface AppModuleOptions {
    readonly database:
        AppDatabaseOptions;

    readonly observability:
        ObservabilityOptions;

    readonly health:
        AppHealthOptions;
}

@Module({})
export class AppModule {
    static register(
        options: AppModuleOptions,
    ): DynamicModule {
        const databasePoolLogger =
            new Logger(
                'DatabasePool',
            );

        const databaseConnection =
            createDatabaseConnection(
                options.database.config,
                {
                    applicationName:
                        options.database
                            .applicationName,

                    onPoolError(
                        error: unknown,
                    ) {
                        databasePoolLogger.error(
                            {
                                event:
                                    'database.pool_background_error',

                                error:
                                    toSafeLogError(
                                        error,
                                    ),
                            },
                            'Background PostgreSQL pool error.',
                        );
                    },
                },
            );

        return {
            module: AppModule,

            imports: [
                ObservabilityModule.register(
                    options.observability,
                ),

                DatabaseModule.register({
                    connection:
                        databaseConnection,
                }),

                HealthModule.register({
                    probes: [
                        {
                            name:
                                'postgresql',

                            async check(): Promise<void> {
                                await databaseConnection.probeReadiness(
                                    options
                                        .health
                                        .readinessTimeoutMs,
                                );
                            },
                        },
                    ],
                }),

                ContractsPlatformModule,
            ],
        };
    }
}