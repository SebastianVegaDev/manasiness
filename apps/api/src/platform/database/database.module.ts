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
    type DatabaseClient,
    type DatabaseConnection,
    type DatabaseRuntimeConfig,
} from '@manasiness/database';

export const DATABASE_CLIENT = Symbol(
    'MANASINESS_DATABASE_CLIENT',
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

        const clientProvider: Provider = {
            provide: DATABASE_CLIENT,
            inject: [DATABASE_CONNECTION],
            useFactory: (
                connection: DatabaseConnection,
            ): DatabaseClient => connection.db,
        };

        return {
            module: DatabaseModule,
            providers: [
                connectionProvider,
                clientProvider,
                DatabaseLifecycleService,
            ],
            exports: [DATABASE_CLIENT],
        };
    }
}