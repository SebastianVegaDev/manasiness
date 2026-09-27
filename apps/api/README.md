# Manasiness API

`@manasiness/api` is the backend runtime for the Manasiness modular monolith.

It provides the executable NestJS process and platform-level HTTP foundation. Product-domain capabilities are added only by the milestones that own them.

## Runtime

The API uses:

- Node.js 24;
- NestJS 12;
- TypeScript with the repository NodeNext configuration;
- Express through the NestJS platform adapter.

The application is an ES module.

## Local development

From the repository root:

```bash
pnpm --filter @manasiness/api dev
```

The default local address is:

```text
http://127.0.0.1:3001
```

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

## Bootstrap configuration

Issue #25 keeps configuration deliberately small. The complete typed runtime-configuration boundary is owned by Issue #27.

Current bootstrap variables are:

| Variable               | Default     | Purpose                                         |
| ---------------------- | ----------- | ----------------------------------------------- |
| `API_HOST`             | `127.0.0.1` | Network interface used by the HTTP listener     |
| `API_PORT`             | `3001`      | HTTP port                                       |
| `API_BODY_LIMIT_BYTES` | `1048576`   | Maximum JSON/urlencoded request body size       |
| `API_CORS_ORIGINS`     | none        | Comma-separated browser origins allowed by CORS |

The local default binds only to the loopback interface.

A deployment or container that intentionally needs external binding can set:

```text
API_HOST=0.0.0.0
```

CORS is closed by default.

For example, when the web application later runs locally on port 3000:

```powershell
$env:API_CORS_ORIGINS = "http://localhost:3000"
```

Do not use CORS as an authorization mechanism.

## Source layout

```text
src/
    main.ts
    app.module.ts

    modules/
        # Future business/domain modules

    platform/
        bootstrap/
        health/
        http/
```

`AppModule` is the application composition root.

`modules/` owns future business capabilities.

`platform/` owns cross-cutting runtime infrastructure and must not become a generic business-code dumping ground.

See [`src/modules/README.md`](src/modules/README.md) for module ownership conventions.

## Commands

Development:

```bash
pnpm --filter @manasiness/api dev
```

Build:

```bash
pnpm --filter @manasiness/api build
```

Typecheck:

```bash
pnpm --filter @manasiness/api typecheck
```

Lint:

```bash
pnpm --filter @manasiness/api lint
```

Run the built artifact:

```bash
pnpm --filter @manasiness/api start
```

Testing infrastructure is intentionally minimal in this issue. M1 Issue #34 owns the complete unit, integration, API, and browser-test foundation.

## Boundaries

This application must not introduce business capabilities through platform code.

In particular:

- controllers do not own business invariants;
- one module does not directly mutate another module's persistence;
- cross-domain orchestration belongs in explicit application capabilities;
- the web application never imports API implementation internals;
- shared packages do not depend on this application;
- no microservice or messaging infrastructure is introduced without a concrete requirement.