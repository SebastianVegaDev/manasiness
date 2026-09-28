import {
    Inject,
    Injectable,
    Module,
    type DynamicModule,
    type OnApplicationBootstrap,
    type OnApplicationShutdown,
    type Provider,
} from '@nestjs/common';

import {
    createDatabaseConnection,
    type DatabaseConnection,
    type DatabaseExecutor,
    type DatabaseRuntimeConfig,
    type DatabaseTransactionRunner,
} from '@manasiness/database';

export const DATABASE_EXECUTOR = Symbol(
    'MANASINESS_DATABASE_EXECUTOR',
);

export const DATABASE_TRANSACTION_RUNNER = Symbol(
    'MANASINESS_DATABASE_TRANSACTION_RUNNER',
);

const DATABASE_CONNECTION = Symbol(
    'MANASINESS_DATABASE_CONNECTION',
);

export interface DatabaseModuleOptions {
    readonly config: DatabaseRuntimeConfig;
    readonly applicationName: string;
}

@Injectable()
class DatabaseLifecycleService
    implements
        OnApplicationBootstrap,
        OnApplicationShutdown
{
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly connection: DatabaseConnection,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.connection.verify();
    }

    async onApplicationShutdown(): Promise<void> {
        await this.connection.close();
    }
}

@Module({})
export class DatabaseModule {
    static register(
        options: DatabaseModuleOptions,
    ): DynamicModule {
        const connectionProvider: Provider = {
            provide: DATABASE_CONNECTION,
            useFactory: (): DatabaseConnection =>
                createDatabaseConnection(
                    options.config,
                    {
                        applicationName:
                            options.applicationName,
                    },
                ),
        };

        const executorProvider: Provider = {
            provide: DATABASE_EXECUTOR,
            inject: [DATABASE_CONNECTION],
            useFactory: (
                connection: DatabaseConnection,
            ): DatabaseExecutor => connection.db,
        };

        const transactionRunnerProvider: Provider = {
            provide:
                DATABASE_TRANSACTION_RUNNER,
            inject: [DATABASE_CONNECTION],
            useFactory: (
                connection: DatabaseConnection,
            ): DatabaseTransactionRunner =>
                connection.transactions,
        };

        return {
            module: DatabaseModule,
            providers: [
                connectionProvider,
                executorProvider,
                transactionRunnerProvider,
                DatabaseLifecycleService,
            ],
            exports: [
                DATABASE_EXECUTOR,
                DATABASE_TRANSACTION_RUNNER,
            ],
        };
    }
}