# Manasiness Database

`@manasiness/database` owns shared PostgreSQL and Drizzle infrastructure for Manasiness.

It does not own product-domain persistence semantics.

## Toolchain

The M1 database baseline is:

```text
PostgreSQL 18.6
Drizzle ORM 0.45.3
Drizzle Kit 0.31.11
node-postgres 8.23.0
```

## Ownership

This package may own:

- PostgreSQL connection infrastructure;
- Drizzle client creation;
- database runtime configuration;
- transaction primitives;
- tenant persistence infrastructure;
- migration infrastructure;
- migration tooling;
- database integration-test helpers.

It does not own:

- Sales rules;
- Inventory rules;
- Finance rules;
- Organization authorization;
- Membership authorization;
- business use cases;
- cross-domain orchestration;
- a universal repository registry.

A shared physical database does not imply shared business ownership.

## Local PostgreSQL

Start PostgreSQL with:

```bash
pnpm db:up
```

The local databases are:

```text
manasiness_dev
manasiness_test
manasiness_migration_validation
```

The port is exposed only on:

```text
127.0.0.1:5432
```

Stop PostgreSQL:

```bash
pnpm db:stop
```

View logs:

```bash
pnpm db:logs
```

## Local database roles

The development environment separates schema ownership from application runtime.

```text
manasiness
→ local migration/admin role

manasiness_app
→ local application runtime role
```

The API must use:

```text
manasiness_app
```

not the administrative role.

The runtime role is deliberately:

```text
NOSUPERUSER
NOBYPASSRLS
not database owner
without CREATE on public
```

This separation is required for Row Level Security to provide meaningful defense in depth.

## Tooling environment

Create:

```powershell
Copy-Item packages/database/.env.example packages/database/.env
```

Database tooling uses administrative local credentials because migrations and test fixture setup require schema-level privileges.

The API has its own independent `.env` and uses the runtime role.

## Runtime connection

`createDatabaseConnection()` owns one node-postgres pool.

The connection exposes:

```text
db
transactions
tenantScope
verify()
close()
```

The underlying `Pool` is private.

## Unscoped access

`db` and `transactions` are physically unscoped capabilities.

They are required for:

- platform-global persistence;
- technical database operations;
- explicitly global Identity persistence;
- infrastructure/testing.

Application DI names them explicitly as:

```text
UNSCOPED_DATABASE_EXECUTOR
UNSCOPED_DATABASE_TRANSACTION_RUNNER
```

Organization-owned domain code should not use them as its normal persistence entry point.

Unscoped access is exceptional by design.

## Tenant database scope

Organization-owned persistence uses:

```text
TenantDatabaseScope
```

Usage:

```typescript
await tenantDatabaseScope.run(
    {
        organizationId,
    },
    async ({ executor }) => {
        // Organization-scoped persistence operations.
    },
);
```

The scope:

```text
starts one transaction
sets manasiness.organization_id transaction-locally
provides one DatabaseExecutor
commits or rolls back
releases the connection
```

The tenant context disappears when the transaction completes.

It must not be stored globally.

## Why tenant scope uses a transaction

PostgreSQL tenant context is installed with:

```text
set_config(..., true)
```

The `true` value makes the setting local to the current transaction.

This deliberately avoids session-level tenant state surviving in a pooled connection.

Even read-only tenant persistence therefore enters a controlled database scope.

This is a security trade-off chosen for predictability and fail-closed behavior.

It can be optimized later only if the alternative preserves the same isolation guarantees.

## Row Level Security

Organization-owned tables use PostgreSQL RLS as a defense-in-depth layer.

RLS does not replace:

```text
application authorization
explicit Organization context
tenant-qualified relationships
domain ownership
```

It protects against classes of persistence mistakes that pass an incorrect or missing tenant filter.

The canonical PostgreSQL setting is:

```text
manasiness.organization_id
```

If no tenant scope exists, Organization-owned policies must not expose rows.

## Runtime role verification

The API verifies its database role during application bootstrap.

Startup fails when the current role is:

```text
SUPERUSER
BYPASSRLS
database owner
able to CREATE in public
```

This makes accidental deployment with a migration/admin credential visible immediately.

The migration tooling connection is intentionally privileged and is not subject to this API-runtime assertion.

## Platform-global data

Some data may legitimately exist outside Organization scope.

The primary planned example is platform Identity.

A platform-global table must be explicitly justified by its owning domain.

Global identity does not weaken tenant isolation for Organization-owned operational data.

## Tenant-qualified relationships

Organization-owned relationships should normally enforce tenant equality structurally.

Parent:

```text
UNIQUE (
    organization_id,
    id
)
```

Child:

```text
FOREIGN KEY (
    organization_id,
    parent_id
)
REFERENCES parent (
    organization_id,
    id
)
```

This prevents cross-Organization references even if application code accidentally supplies a globally valid foreign ID.

## Database executor

Persistence adapters depend on:

```text
DatabaseExecutor
```

rather than connection-pool internals.

The same adapter can receive:

```text
ordinary executor
```

or:

```text
transaction/tenant-bound executor
```

without duplicating its query logic.

## Transaction ownership

Transactions follow business commands.

Top-level business atomicity belongs to the application layer.

Repositories do not silently start their own top-level transactions.

Controllers do not own business transactions.

Nested application transaction boundaries remain prohibited.

## Cross-domain atomicity

Several domain-owned persistence adapters may participate in one transaction.

For example:

```text
Sales
+
Inventory
+
Finance
```

may eventually commit atomically.

This never permits one module to directly mutate another module's tables.

Atomicity and ownership are separate concerns.

## External side effects

Do not hold PostgreSQL transactions open unnecessarily while waiting on:

```text
email
webhooks
payment providers
third-party APIs
remote storage
```

Reliable coordination with external side effects requires a deliberate later pattern.

Issue #31 does not introduce distributed transactions, sagas, or an outbox.

## Schema ownership

Drizzle product schema enters through:

```text
src/schema/index.ts
```

Canonical mappings are exported from:

```text
@manasiness/database/schema
```

including:

```text
entityIdColumn()
instantColumn()
localDateColumn()
ianaTimeZoneColumn()
tenantOrganizationIdColumn()
currentTenantOrganizationIdSql
```

No real Organization/domain table is introduced by Issue #31.

## Migration workflow

Schema evolution follows:

```text
Drizzle schema
→ drizzle-kit generate
→ review generated SQL
→ commit migration + metadata
→ migrate
```

Generate:

```bash
pnpm db:generate -- --name=meaningful-name
```

Check:

```bash
pnpm db:check
```

Migrate:

```bash
pnpm db:migrate
```

Validate full history:

```bash
pnpm db:validate
```

`drizzle-kit push` remains intentionally absent.

## Tenant migration checklist

When a future migration introduces an Organization-owned table, review:

```text
organization_id NOT NULL
tenant-qualified relationships
RLS policy
ENABLE ROW LEVEL SECURITY
FORCE ROW LEVEL SECURITY
runtime privileges
cross-tenant integration tests
```

Do not consider tenant protection complete when only application query filters exist.

## Development reset

```bash
pnpm db:reset:dev
```

is destructive and restricted to the local development database.

Reset recreates the `public` schema, restores runtime schema usage, and restores default application DML grants before migrations are reapplied.

## Test database

Administrative integration setup uses:

```text
DATABASE_TEST_URL
```

Runtime RLS tests use:

```text
DATABASE_TEST_RUNTIME_URL
```

This distinction ensures RLS tests execute under the same class of non-privileged role used by the application.

## Testing helpers

`@manasiness/database/testing` provides:

```text
withDatabaseTestConnection()
withDatabaseTestRuntimeConnection()
assertTenantTableRlsProtected()
```

The first uses the administrative test role.

The second uses the application test role.

The third verifies that a tenant table:

```text
has RLS enabled
has FORCE RLS enabled
has at least one policy
```

Owning domain tests still need to prove actual cross-tenant read/write behavior.

## Tenant isolation integration tests

Issue #31 includes test-only tenant tables that verify:

```text
missing tenant context sees no rows
tenant A sees tenant A
tenant A cannot see tenant B
tenant A cannot write tenant B
cross-tenant foreign references fail
same-tenant references succeed
tenant context does not leak through pool reuse
runtime role cannot bypass RLS
RLS is enabled and forced
```

The probe tables exist only during tests.

They are not part of migration history.

## Production roles

Production role provisioning belongs to deployment infrastructure.

Product migrations must not hardcode environment-specific runtime-role names.

The expected separation remains:

```text
migration/schema-owner role
≠
application runtime role
```

The runtime role must not have `SUPERUSER` or `BYPASSRLS`.

## Production migrations

The API does not run migrations automatically during startup.

Deployment applies migrations as a deliberate operational step before or alongside application rollout.

Schema ownership and application runtime privileges remain separate.
