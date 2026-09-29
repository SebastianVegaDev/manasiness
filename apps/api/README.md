# Manasiness API

`@manasiness/api` is the backend runtime for the Manasiness modular monolith.

It provides the executable NestJS process and platform-level HTTP, database, validation, error, and transport-contract foundation.

Product-domain capabilities are added only by the milestones that own them.

## Runtime

The API uses:

- Node.js 24;
- NestJS 12;
- TypeScript with the repository NodeNext configuration;
- Express through the NestJS platform adapter;
- PostgreSQL through `@manasiness/database`;
- Zod-backed Standard Schemas through `@manasiness/contracts`.

The application is an ES module.

## Local development

Create:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Start local PostgreSQL:

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

## Runtime configuration

Feature and domain code must not read `process.env` directly.

API-specific runtime configuration is owned under:

```text
src/platform/config/
```

Current API values include:

| Variable | Required | Default |
| --- | --- | --- |
| `APP_ENV` | yes | none |
| `API_SERVICE_NAME` | no | `manasiness-api` |
| `API_LOG_LEVEL` | no | `info` |
| `API_HOST` | no | `127.0.0.1` |
| `API_PORT` | no | `3001` |
| `API_BODY_LIMIT_BYTES` | no | `1048576` |
| `API_CORS_ORIGINS` | no | none |
| `API_DOCS_ENABLED` | no | `false` |

Database configuration is validated by `@manasiness/database`.

## Transport contracts

Transport-facing request/query/response schemas are owned by:

```text
@manasiness/contracts
```

The package is shared by transports/clients that need the public wire representation.

It does not own domain behavior.

A controller attaches the real schema directly:

```typescript
@Body({
    schema: createThingRequestSchema,
})
body: CreateThingRequest
```

NestJS's Standard Schema validation pipe executes the schema before the controller method receives the value.

The controller therefore receives validated transport data.

## Params and query

Path parameters and query objects use the same mechanism:

```typescript
@Param({
    schema: paramsSchema,
})
params: Params

@Query({
    schema: querySchema,
})
query: Query
```

Do not manually repeat validation rules inside controllers.

## Domain validation

Transport validation is not business validation.

Transport schemas may verify:

```text
UUID shape
string length
number representation
required fields
allowed transport enum values
```

Application/domain logic still verifies:

```text
business invariants
authorization
state transitions
cross-entity rules
Organization capability rules
```

A request being structurally valid does not mean the business operation is allowed.

## Response contracts

Response schemas are applied using NestJS Standard Schema serialization.

A declared response schema is an allowlist of properties allowed to cross the HTTP boundary.

This prevents internal/persistence fields from leaving the API merely because the internal object contains them.

The API's response/OpenAPI helper uses the same Zod schema for:

```text
runtime response serialization
+
OpenAPI response documentation
```

Do not create a separate handwritten Swagger response schema.

## API errors

All structured API failures use:

```json
{
    "error": {
        "type": "invalid_input",
        "code": "transport.invalid_input",
        "message": "Request validation failed."
    }
}
```

Validation failures may also contain:

```json
{
    "issues": [
        {
            "path": [
                "email"
            ],
            "message": "Invalid email address."
        }
    ]
}
```

## Error categories

The generic categories are:

```text
invalid_input
unauthenticated
unauthorized
not_found
conflict
business_rejection
rate_limited
internal_error
```

Broad HTTP mapping:

```text
400 → invalid_input
401 → unauthenticated
403 → unauthorized
404 → not_found
409 → conflict
422 → business_rejection
429 → rate_limited
500 → internal_error
```

## Stable machine codes

Clients should branch on:

```text
error.type
error.code
```

not:

```text
error.message
```

Examples:

```text
transport.invalid_input
auth.unauthenticated
resource.not_found
inventory.insufficient_stock
```

Human-readable messages may evolve or eventually be localized.

## Expected application failures

Application/domain code must not know HTTP status codes.

The API provides an `ExpectedApplicationError` transport-mapping boundary for expected application failures.

It carries:

```text
semantic kind
machine code
explicitly safe public message
```

The exception filter translates the semantic kind into HTTP transport semantics.

Domain-specific error types may later be mapped into this boundary by their owning application modules.

## Unexpected failures

Unexpected exceptions are never serialized directly.

The client receives only:

```json
{
    "error": {
        "type": "internal_error",
        "code": "internal.unexpected",
        "message": "An unexpected internal error occurred."
    }
}
```

The following never belong in an API response:

```text
stack trace
database error object
SQL
filesystem path
environment variables
internal exception messages
secret values
```

Issue #33 owns the structured logging/correlation strategy for server-side diagnostics.

## OpenAPI

When:

```text
API_DOCS_ENABLED=true
```

the generated OpenAPI document is available at:

```text
GET /docs/openapi.json
```

Swagger UI is intentionally not enabled by this foundation.

The raw OpenAPI document is sufficient for:

```text
API inspection
documentation tooling
integration tooling
future client generation
```

Request schemas are derived from the same Standard Schemas used for runtime validation.

Response schemas are derived from the same Zod schemas used for runtime response serialization.

OpenAPI is not a second hand-written schema source.

## Contract example

M1 contains one engineering-only contract example:

```text
POST /_platform/contracts/example/:entityId
```

It exists to prove:

```text
path validation
query validation/transformation
body validation
response serialization
OpenAPI generation
structured invalid-input errors
```

It contains no product-domain behavior.

Future real endpoint issues should replace the need to rely on this example for development.

## Database runtime role

The API connects with a dedicated non-privileged database runtime role.

Local development uses:

```text
manasiness_app
```

Do not configure the API with the migration/admin role.

The API verifies at startup that the runtime role cannot trivially bypass tenant RLS.

## Tenant persistence

Organization-owned persistence uses:

```text
TENANT_DATABASE_SCOPE
```

The scope requires explicit Organization context.

Transport input alone never establishes tenant authority.

Authentication/Membership/application authorization must establish the authoritative Organization context first.

## Unscoped persistence

The database module exposes deliberately exceptional capabilities:

```text
UNSCOPED_DATABASE_EXECUTOR
UNSCOPED_DATABASE_TRANSACTION_RUNNER
```

They exist for genuinely global/platform persistence.

Organization-owned product modules should use tenant-scoped persistence.

## CORS

CORS is closed by default.

Local browser development normally uses:

```text
API_CORS_ORIGINS=http://localhost:3000
```

CORS is not authentication, authorization, or tenant isolation.

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
        contracts/
        database/
        errors/
        health/
        http/
        openapi/
```

`modules/` owns business capabilities.

`platform/` owns technical runtime integration.

Do not move business behavior into `platform/`.

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

Tests:

```powershell
pnpm --filter @manasiness/api test
```

Production artifact:

```powershell
pnpm --filter @manasiness/api start
```

## Boundaries

- contracts describe transport, not domain entities;
- transport validation does not replace business validation;
- HTTP status is not domain state;
- human-readable error messages are not machine identifiers;
- unexpected exceptions never expose internals;
- Organization-owned persistence still requires explicit tenant context;
- controllers do not own business invariants;
- controllers do not own transaction boundaries;
- modules do not mutate another module's persistence directly;
- shared packages do not depend on application internals.