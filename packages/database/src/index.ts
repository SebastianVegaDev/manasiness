export {
    createDatabaseConnection,
    type CreateDatabaseConnectionOptions,
    type DatabaseConnection,
} from './connection/database-connection.js';

export type { DatabaseClient } from './connection/database-client.js';

export {
    loadDatabaseRuntimeConfig,
    type DatabaseEnvironmentSource,
    type DatabasePoolRuntimeConfig,
    type DatabaseRuntimeConfig,
} from './config/database-runtime-config.js';

export { applyDatabaseMigrations } from './migrations/apply-migrations.js';

export { assertRlsSafeRuntimeDatabaseRole } from './tenant/runtime-role-security.js';

export {
    createTenantDatabaseScope,
    type TenantDatabaseExecutionContext,
    type TenantDatabaseOperation,
    type TenantDatabaseScope,
    type TenantPersistenceContext,
} from './tenant/tenant-database-scope.js';

export type { DatabaseExecutor } from './transaction/database-executor.js';

export {
    NestedDatabaseTransactionError,
    type DatabaseTransactionContext,
    type DatabaseTransactionOperation,
    type DatabaseTransactionRunner,
} from './transaction/database-transaction-runner.js';
