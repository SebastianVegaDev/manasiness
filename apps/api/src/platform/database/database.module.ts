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
    assertRlsSafeRuntimeDatabaseRole,
    createDatabaseConnection,
    type DatabaseConnection,
    type DatabaseExecutor,
    type DatabaseRuntimeConfig,
    type DatabaseTransactionRunner,
    type TenantDatabaseScope,
} from '@manasiness/database';

export const UNSCOPED_DATABASE_EXECUTOR = Symbol(
    'MANASINESS_UNSCOPED_DATABASE_EXECUTOR',
);

export const UNSCOPED_DATABASE_TRANSACTION_RUNNER =
    Symbol(
        'MANASINESS_UNSCOPED_DATABASE_TRANSACTION_RUNNER',
    );

export const TENANT_DATABASE_SCOPE = Symbol(
    'MANASINESS_TENANT_DATABASE_SCOPE',
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

        await assertRlsSafeRuntimeDatabaseRole(
            this.connection.db,
        );
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

        const unscopedExecutorProvider: Provider = {
            provide:
                UNSCOPED_DATABASE_EXECUTOR,
            inject: [DATABASE_CONNECTION],
            useFactory: (
                connection: DatabaseConnection,
            ): DatabaseExecutor => connection.db,
        };

        const unscopedTransactionRunnerProvider: Provider =
            {
                provide:
                    UNSCOPED_DATABASE_TRANSACTION_RUNNER,
                inject: [DATABASE_CONNECTION],
                useFactory: (
                    connection: DatabaseConnection,
                ): DatabaseTransactionRunner =>
                    connection.transactions,
            };

        const tenantDatabaseScopeProvider: Provider = {
            provide: TENANT_DATABASE_SCOPE,
            inject: [DATABASE_CONNECTION],
            useFactory: (
                connection: DatabaseConnection,
            ): TenantDatabaseScope =>
                connection.tenantScope,
        };

        return {
            module: DatabaseModule,
            providers: [
                connectionProvider,
                unscopedExecutorProvider,
                unscopedTransactionRunnerProvider,
                tenantDatabaseScopeProvider,
                DatabaseLifecycleService,
            ],
            exports: [
                UNSCOPED_DATABASE_EXECUTOR,
                UNSCOPED_DATABASE_TRANSACTION_RUNNER,
                TENANT_DATABASE_SCOPE,
            ],
        };
    }
}