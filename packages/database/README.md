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

The repository deliberately uses the stable Drizzle releases rather than the current 1.0 release candidates.

## Ownership

This package may own:

- PostgreSQL connection infrastructure;
- Drizzle client creation;
- runtime database configuration;
- transaction primitives;
- migration infrastructure;
- migration tooling;
- database test infrastructure;
- low-level database testing helpers.

It must not become the owner of:

- Sales rules;
- Inventory rules;
- Finance rules;
- Organization authorization;
- business use cases;
- cross-domain orchestration;
- a universal repository covering every domain.

A shared physical database does not imply shared business ownership.

## Local PostgreSQL

Start PostgreSQL from repository root:

```bash
pnpm db:up
```

The local Docker environment contains:

```text
manasiness_dev
manasiness_test
manasiness_migration_validation
```

The PostgreSQL port is exposed only through the local loopback interface.

Stop it with:

```bash
pnpm db:stop
```

View logs with:

```bash
pnpm db:logs
```

## Tooling environment

Create:

```powershell
Copy-Item packages/database/.env.example packages/database/.env
```

The file is intentionally separate from `apps/api/.env`.

`apps/api/.env` configures the API process.

`packages/database/.env` configures database tooling and integration tests.

They may contain the same local development URL while remaining different runtime boundaries.

## Runtime connection

`createDatabaseConnection()` owns one node-postgres pool.

The returned connection exposes:

```text
db
transactions
verify()
close()
```

The underlying `Pool` is deliberately not exposed through the package API.

NestJS integration belongs to `apps/api`.

The database package contains no NestJS dependency.

## Database executor

Persistence adapters should depend on:

```text
DatabaseExecutor
```

rather than the node-postgres pool or transaction internals.

The executor provides the Drizzle query-building operations required by persistence code.

A normal database client satisfies `DatabaseExecutor`.

A transaction-bound Drizzle client also satisfies `DatabaseExecutor`.

This allows the same persistence operation to run:

```text
normally
```

or:

```text
inside an application-owned transaction
```

without duplicating query logic.

## Transaction ownership

Transactions follow business commands.

The application layer owns the top-level transaction boundary.

Conceptually:

```text
application use case
    ↓
DatabaseTransactionRunner.run(...)
    ↓
one PostgreSQL transaction
    ├── persistence operation A
    ├── persistence operation B
    └── persistence operation C
```

A repository or persistence adapter must not start an independent top-level transaction when the application use case owns atomicity.

Controllers must not manage transactions for business behavior.

HTTP request lifetime is not automatically equivalent to transaction lifetime.

## Transaction lifecycle

`DatabaseTransactionRunner` explicitly controls:

```text
pool.connect()
    ↓
BEGIN
    ↓
application callback
    ↓
COMMIT
```

If the callback fails:

```text
application error
    ↓
ROLLBACK
    ↓
rethrow original error
```

The checked-out client is released in all normal success/failure paths.

A connection that encounters an uncertain transaction-control failure may be destroyed instead of returned to the pool.

This prevents a potentially unhealthy connection from being reused.

## Isolation level

The current application transaction baseline is explicitly:

```text
READ COMMITTED
READ WRITE
```

This matches the intended PostgreSQL V1 baseline.

A different isolation level must be introduced because a concrete concurrency invariant requires it.

Do not choose stronger isolation merely as a generic safety preference.

## Error propagation

When application work fails and rollback succeeds, the original application/database error is rethrown unchanged.

If rollback itself also fails, the transaction runner raises an `AggregateError` containing both failures.

A rollback failure is treated as an infrastructure failure and the checked-out client is destroyed rather than returned to the pool.

## Nested transactions

Nested application transaction boundaries are currently prohibited.

This is rejected:

```typescript
await transactions.run(async () => {
    await transactions.run(async () => {
        // ...
    });
});
```

The inner operation must reuse the transaction executor already supplied by the outer application transaction.

The underlying ORM/database may support savepoints, but Manasiness does not expose savepoint semantics as an application contract without a concrete business requirement.

## Transaction context lifetime

A transaction executor is valid only for the transaction callback that received it.

Do not:

- store the executor globally;
- cache it in a singleton;
- return it to callers;
- use it from detached asynchronous work;
- continue using it after the callback completes.

Every operation that belongs to the transaction must be awaited before the callback returns.

## Cross-domain atomicity

One transaction may coordinate consequences owned by several domains.

For example:

```text
Sales
+
Inventory
+
Finance
```

may eventually participate in one atomic business command.

This does not permit:

```text
Sales persistence
→ direct writes to Inventory tables
```

or:

```text
Finance persistence
→ direct writes to Sales tables
```

Each domain continues to own its behavior and persistence semantics.

The application layer coordinates their capabilities and supplies one shared transaction executor.

## External side effects

Avoid holding a database transaction open while waiting on unreliable external I/O.

Examples include:

```text
email
webhooks
payment providers
third-party HTTP APIs
remote file storage
```

If external side effects later need reliable coordination with committed database state, introduce a deliberate reliability mechanism.

Issue #30 does not introduce:

```text
distributed transactions
sagas
outbox
message broker
```

## Schema ownership

Drizzle schema declarations enter through:

```text
src/schema/index.ts
```

A future schema appears only when its owning domain issue defines its persistence semantics.

Do not add placeholder product-domain tables simply to test infrastructure.

Canonical low-level schema mappings are exposed through:

```text
@manasiness/database/schema
```

and currently include:

```text
entityIdColumn()
instantColumn()
localDateColumn()
ianaTimeZoneColumn()
```

## Migration workflow

The source-of-truth workflow is:

```text
Drizzle TypeScript schema
        ↓
drizzle-kit generate
        ↓
review generated SQL
        ↓
commit migration + metadata
        ↓
apply migration
```

Generate:

```bash
pnpm db:generate -- --name=meaningful-migration-name
```

Check migration-history consistency:

```bash
pnpm db:check
```

Apply pending migrations:

```bash
pnpm db:migrate
```

Validate the complete history against a clean database:

```bash
pnpm db:validate
```

## Migration review

Generated migration SQL must be reviewed before commit.

Review at minimum:

- destructive DDL;
- unexpected table/column drops;
- incorrect renames;
- nullable-to-required transitions;
- unexpected defaults;
- indexes;
- foreign keys;
- constraint behavior;
- data-loss risk;
- lock/large-table implications once production data exists.

Generated output is not automatically correct merely because Drizzle generated it.

## Historical migration policy

Once a migration is part of released/applied history, treat it as historical.

Do not rewrite it merely to make the migration folder look cleaner.

Use a later migration to evolve the database.

This includes changes such as:

```text
column changes
constraint corrections
index changes
data backfills
schema corrections
```

Migration history should explain how the deployed database actually evolved.

## Schema push

`drizzle-kit push` is deliberately not exposed as a repository script.

Production schema evolution uses versioned migrations.

Do not replace:

```text
generate
review
commit
migrate
```

with direct production schema synchronization.

## Development reset

```bash
pnpm db:reset:dev
```

is destructive.

It is deliberately constrained to:

```text
loopback host
+
database name = manasiness_dev
```

The command removes application/migration schemas and reapplies the complete migration history.

It must never be used against production.

## Test database

Tests use the dedicated:

```text
DATABASE_TEST_URL
```

boundary rather than ordinary runtime `DATABASE_URL`.

The exported testing configuration rejects database names that do not identify a dedicated Manasiness test database.

Reset it with:

```bash
pnpm db:reset:test
```

## Integration-test helper

`@manasiness/database/testing` exposes:

```text
withDatabaseTestConnection()
```

for PostgreSQL integration tests.

The helper:

```text
validates the test database target
creates a connection
verifies connectivity
executes the test callback
closes the pool in finally
```

This prevents later integration suites from repeatedly implementing connection lifecycle themselves.

## Transaction integration tests

The database package includes real PostgreSQL integration coverage for:

- normal executor usage;
- transaction commit;
- transaction rollback;
- atomic rollback of several operations;
- pool reuse after failure;
- nested transaction rejection;
- transaction isolation baseline.

The test suite deliberately uses a pool size of one.

If a failed transaction leaks its checked-out client, the subsequent transaction cannot acquire another one and the suite fails.

Run with:

```bash
pnpm db:up
pnpm --filter @manasiness/database test
```

## Migration validation

`pnpm db:validate` performs two separate checks:

```text
drizzle-kit check
+
clean-database migration application
```

The validation database is deliberately independent from development and test data.

This command is intended to become a CI quality gate.

## Production migrations

The API does not automatically execute migrations on application startup.

Deployment must deliberately apply migrations as a separate operational step.

This prevents multiple application replicas from unexpectedly competing to alter schema and keeps schema deployment observable and controllable.