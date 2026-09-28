# Manasiness API

`@manasiness/api` is the backend runtime for the Manasiness modular monolith.

It provides the executable NestJS process and platform-level HTTP foundation. Product-domain capabilities are added only by the milestones that own them.

## Runtime

The API uses:

- Node.js 24;
- NestJS 12;
- TypeScript with the repository NodeNext configuration;
- Express through the NestJS platform adapter;
- Zod for runtime configuration validation.

The application is an ES module.

## Local development

Create the local environment file:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Then run:

```powershell
pnpm --filter @manasiness/api dev
```

The example configuration starts the API at:

```text
http://127.0.0.1:3001
```

## Runtime configuration

Environment access is centralized under:

```text
src/platform/config/
```

Feature and domain code must not read `process.env` directly.

The current configuration contract is:

| Variable               | Required | Default          | Purpose                                 |
| ---------------------- | -------- | ---------------- | --------------------------------------- |
| `APP_ENV`              | yes      | none             | Runtime/deployment classification       |
| `API_SERVICE_NAME`     | no       | `manasiness-api` | Stable process/service identity         |
| `API_LOG_LEVEL`        | no       | `info`           | Nest bootstrap log level                |
| `API_HOST`             | no       | `127.0.0.1`      | HTTP bind host                          |
| `API_PORT`             | no       | `3001`           | HTTP port                               |
| `API_BODY_LIMIT_BYTES` | no       | `1048576`        | JSON/urlencoded body limit              |
| `API_CORS_ORIGINS`     | no       | none             | Comma-separated allowed browser origins |

`APP_ENV` accepts:

```text
development
test
production
```

`API_LOG_LEVEL` accepts:

```text
debug
info
warn
error
```

Configuration is validated before the API begins listening.

Invalid configuration fails startup with field-oriented errors.

Configuration validation must never serialize the complete environment or raw secret values.

## `.env` loading

The API uses Node.js's native `.env` support.

`apps/api/.env` supplies values that were not already supplied by the process environment.

Deployment-provided environment variables therefore remain authoritative over local `.env` values.

`.env` is a developer convenience, not a production secret-management strategy.

## CORS

CORS is closed by default when `API_CORS_ORIGINS` is empty.

For local web development:

```text
API_CORS_ORIGINS=http://localhost:3000
```

Multiple origins are comma-separated:

```text
API_CORS_ORIGINS=https://app.example.com,https://admin.example.com
```

CORS is not an authorization mechanism.

## Liveness

The process liveness endpoint is:

```text
GET /health/live
```

Expected response:

```json
{
    "status": "ok"
}
```

Liveness deliberately does not depend on PostgreSQL or product-domain state.

Dependency readiness belongs to the later observability foundation.

## Source layout

```text
src/
    main.ts
    app.module.ts

    modules/
        # Future business/domain modules

    platform/
        config/
        health/
        http/
```

`AppModule` is the composition root.

`modules/` owns future business capabilities.

`platform/` owns technical runtime infrastructure and must not become a generic business-code dumping ground.

## Testing configuration

Configuration loaders accept an explicit environment object.

Tests should use:

```text
test/support/api-environment.ts
```

instead of mutating global `process.env`.

This keeps configuration tests deterministic and isolated.

## Database configuration

No `DATABASE_URL` exists in this configuration contract yet.

Issue #28 owns the PostgreSQL/Drizzle integration. Database configuration becomes required when a runtime actually consumes it.

Environment variables must not be added preemptively simply because a later capability may need them.

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
- environment variables do not represent Organization business settings;
- controllers do not own business invariants;
- one module does not directly mutate another module's persistence;
- cross-domain orchestration belongs in explicit application capabilities;
- shared packages do not depend on this application.