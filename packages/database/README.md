# Manasiness Database

`@manasiness/database` owns shared PostgreSQL and Drizzle infrastructure for Manasiness.

It does not own product-domain persistence semantics.

## Toolchain

The M1 database baseline is:

```text id="xx546x"
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
- migration infrastructure;
- migration tooling;
- database test infrastructure;
- future low-level transaction primitives.

It must not become the owner of:

- Sales rules;
- Inventory rules;
- Finance rules;
- Organization authorization;
- business use cases;
- a universal repository covering every domain.

A shared physical database does not imply shared business ownership.

## Local PostgreSQL

Start PostgreSQL from repository root:

```bash id="phwaf1"
pnpm db:up
```

The local Docker environment contains:

```text id="pifjd8"
manasiness_dev
manasiness_test
manasiness_migration_validation
```

The PostgreSQL port is exposed only through the local loopback interface.

Stop it with:

```bash id="bu24hl"
pnpm db:stop
```

View logs with:

```bash id="75eobx"
pnpm db:logs
```

## Tooling environment

Create:

```powershell id="p481la"
Copy-Item packages/database/.env.example packages/database/.env
```

The file is intentionally separate from `apps/api/.env`.

`apps/api/.env` configures the API process.

`packages/database/.env` configures database tooling.

They may contain the same local development URL while remaining different runtime boundaries.

## Schema ownership

Drizzle schema declarations enter through:

```text id="shz2hj"
src/schema/index.ts
```

Issue #28 intentionally contains no product-domain tables.

A future schema appears only when its owning domain issue defines its persistence semantics.

Do not add placeholder tables simply to test the ORM.

## Migration workflow

The source-of-truth workflow is:

```text id="eq7k9b"
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

```bash id="su0l84"
pnpm db:generate -- --name=meaningful-migration-name
```

Check migration-history consistency:

```bash id="cr0a5x"
pnpm db:check
```

Apply pending migrations:

```bash id="cguczf"
pnpm db:migrate
```

Validate the complete history against a clean database:

```bash id="4b553e"
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

```text id="zzkc1x"
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

```text id="r9qjg4"
generate
review
commit
migrate
```

with direct production schema synchronization.

## Development reset

```bash id="bj2u07"
pnpm db:reset:dev
```

is destructive.

It is deliberately constrained to:

```text id="87tmd8"
loopback host
+
database name = manasiness_dev
```

The command removes application/migration schemas and reapplies the complete migration history.

It must never be used against production.

## Test database

Tests use the dedicated:

```text id="xjhumk"
DATABASE_TEST_URL
```

boundary rather than ordinary `DATABASE_URL`.

The exported testing configuration additionally rejects database names that do not look like dedicated Manasiness test databases.

Reset with:

```bash id="om6tnk"
pnpm db:reset:test
```

## Migration validation

`pnpm db:validate` performs two separate checks:

```text id="a56uet"
drizzle-kit check
+
clean-database migration application
```

The validation database is deliberately independent from development and test data.

This command is intended to become a CI quality gate.

## Runtime connection lifecycle

`createDatabaseConnection()` creates the node-postgres pool and Drizzle client.

The returned connection provides:

```text id="41a85y"
db
verify()
close()
```

The database package contains no NestJS dependency.

NestJS integration belongs to `apps/api`.

This keeps the database package reusable and prevents framework lifecycle concerns from becoming persistence-domain concerns.

## Production migrations

The API does not automatically execute migrations on application startup.

Deployment must deliberately apply migrations as a separate operational step.

This prevents multiple application replicas from unexpectedly competing to alter schema and keeps schema deployment observable and controllable.