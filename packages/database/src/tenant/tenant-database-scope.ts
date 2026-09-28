import type { EntityId } from '@manasiness/platform-primitives';
import { sql } from 'drizzle-orm';

import type { DatabaseExecutor } from '../transaction/database-executor.js';
import type { DatabaseTransactionRunner } from '../transaction/database-transaction-runner.js';
import { TENANT_ORGANIZATION_SETTING_NAME } from './tenant-setting.js';

export interface TenantPersistenceContext {
    readonly organizationId: EntityId;
}

export interface TenantDatabaseExecutionContext
    extends TenantPersistenceContext {
    readonly executor: DatabaseExecutor;
}

export type TenantDatabaseOperation<T> = (
    context: TenantDatabaseExecutionContext,
) => Promise<T>;

export interface TenantDatabaseScope {
    run<T>(
        tenant: TenantPersistenceContext,
        operation: TenantDatabaseOperation<T>,
    ): Promise<T>;
}

export function createTenantDatabaseScope(
    transactionRunner: DatabaseTransactionRunner,
): TenantDatabaseScope {
    return Object.freeze({
        async run<T>(
            tenant: TenantPersistenceContext,
            operation: TenantDatabaseOperation<T>,
        ): Promise<T> {
            return transactionRunner.run(
                async ({ executor }): Promise<T> => {
                    await executor.execute(sql`
                        SELECT set_config(
                            ${TENANT_ORGANIZATION_SETTING_NAME},
                            ${tenant.organizationId},
                            true
                        )
                    `);

                    const context =
                        Object.freeze<TenantDatabaseExecutionContext>({
                            organizationId:
                                tenant.organizationId,
                            executor,
                        });

                    return operation(context);
                },
            );
        },
    });
}