# Manasiness API

`@manasiness/api` is the backend runtime for the Manasiness modular monolith.

It provides the executable NestJS process and platform-level HTTP/database foundation.

Product-domain capabilities are added only by the milestones that own them.

## Runtime

The API uses:

- Node.js 24;
- NestJS 12;
- TypeScript with the repository NodeNext configuration;
- Express through the NestJS platform adapter;
- PostgreSQL through `@manasiness/database`;
- Zod for runtime configuration validation.

The application is an ES module.

## Local development

Create:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Then start local PostgreSQL:

```powershell
pnpm db:up
```

Start the API:

```powershell
pnpm --filter @manasiness/api dev
```

The default address is:

```text
http://127.0.0.1:3001
```

## API runtime configuration

Feature/domain code must not read `process.env` directly.

API-specific configuration is owned under:

```text
src/platform/config/
```

Current API configuration includes:

| Variable | Required | Default |
| --- | --- | --- |
| `APP_ENV` | yes | none |
| `API_SERVICE_NAME` | no | `manasiness-api` |
| `API_LOG_LEVEL` | no | `info` |
| `API_HOST` | no | `127.0.0.1` |
| `API_PORT` | no | `3001` |
| `API_BODY_LIMIT_BYTES` | no | `1048576` |
| `API_CORS_ORIGINS` | no | none |

Database configuration is validated by `@manasiness/database`.

## Database runtime role

The API must connect with a dedicated non-privileged runtime database role.

Local development uses:

```text
manasiness_app
```

Do not configure the API with:

```text
manasiness
```

which is the local migration/admin role.

At startup the API verifies that the active role is not:

```text
SUPERUSER
BYPASSRLS
database owner
CREATE-capable in public
```

An unsafe role causes startup to fail.

This prevents accidental RLS bypass through privileged runtime credentials.

## Tenant persistence

Organization-owned persistence uses:

```text
TENANT_DATABASE_SCOPE
```

The scope requires an explicit Organization identifier and installs it transaction-locally in PostgreSQL.

Conceptually:

```text
application use case
    ↓
organizationId
    ↓
TENANT_DATABASE_SCOPE
    ↓
tenant-bound DatabaseExecutor
    ↓
module persistence adapter
```

The Organization identifier must come from trusted application/authorization context.

Browser input alone never establishes tenant authority.

## Unscoped persistence

The database module also exposes:

```text
UNSCOPED_DATABASE_EXECUTOR
UNSCOPED_DATABASE_TRANSACTION_RUNNER
```

Their names are intentionally explicit.

They are reserved for genuinely platform-global or technical persistence.

A future platform Identity capability may legitimately use unscoped persistence.

Organization-owned domains should not.

## Authentication versus tenancy

Issue #31 establishes persistence isolation only.

It does not decide:

```text
who the current Identity is
which Organizations that Identity belongs to
which Membership permissions they possess
whether they may execute a specific capability
```

Those concerns belong to M3 and later authorization work.

Tenant persistence assumes application code has already obtained an authoritative Organization context.

## CORS

CORS remains closed by default.

Local browser development normally uses:

```text
API_CORS_ORIGINS=http://localhost:3000
```

CORS is not authorization and is unrelated to tenant isolation.

## Liveness

```text
GET /health/live
```

returns:

```json
{
    "status": "ok"
}
```

Liveness does not perform dependency-readiness checks.

Readiness belongs to the later observability foundation.

## Source layout

```text
src/
    main.ts
    app.module.ts

    modules/
        # Product/domain modules

    platform/
        config/
        database/
        health/
        http/
```

`AppModule` is the composition root.

`modules/` owns business capabilities.

`platform/` owns runtime infrastructure.

## Transaction ownership

Business transaction boundaries belong to application use cases.

Controllers do not manage transactions.

Repositories do not silently start independent top-level transactions.

Organization-scoped transactions should use the tenant database scope so RLS receives the same explicit Organization context.

## Database ownership

A shared PostgreSQL database does not make domain persistence shared.

One module must not directly mutate another module's tables.

Cross-domain behavior is coordinated through explicit application capabilities.

## Commands

Development:

```powershell
pnpm --filter @manasiness/api dev
```

Build:

```powershell
pnpm --filter @manasiness/api build
```

Typecheck:

```powershell
pnpm --filter @manasiness/api typecheck
```

Lint:

```powershell
pnpm --filter @manasiness/api lint
```

Production artifact:

```powershell
pnpm --filter @manasiness/api start
```

## Boundaries

- runtime configuration is platform infrastructure;
- domain code does not read environment variables directly;
- Organization-owned persistence requires explicit tenant context;
- global Identity does not imply global access to tenant data;
- controllers do not own business invariants;
- controllers do not own database transaction boundaries;
- one module does not mutate another module's persistence directly;
- tenant filtering is defense in depth rather than one repository convention;
- shared packages do not depend on application internals.