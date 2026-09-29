# Manasiness API

`@manasiness/api` is the backend runtime for the Manasiness modular monolith.

It provides the executable NestJS process and platform-level HTTP, database, validation, error, observability, and transport-contract foundation.

Product-domain capabilities are added only by the milestones that own them.

## Runtime

The API uses:

- Node.js 24;
- NestJS 12;
- TypeScript with the repository NodeNext configuration;
- Express through the NestJS platform adapter;
- PostgreSQL through `@manasiness/database`;
- Zod-backed transport contracts through `@manasiness/contracts`;
- Pino through `nestjs-pino` for structured technical logging.

The application is an ES module.

## Local development

Create:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Start PostgreSQL:

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

## Structured logging

Application logging is routed through:

```text
Nest Logger
    ↓
nestjs-pino
    ↓
Pino
```

Application code should normally use:

```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger(MyService.name);
```

Product/domain modules must not import a hosted logging-provider SDK.

The logging backend may therefore evolve independently from business code.

## Log format

Normal runtime logs are structured JSON.

For example, a production-oriented event contains fields conceptually similar to:

```json
{
    "level": 30,
    "time": "2026-09-28T23:00:00.000Z",
    "service": "manasiness-api",
    "environment": "production",
    "requestId": "f2da25d9-d483-4b51-8ba9-3f39599ef32f",
    "context": "ExampleService",
    "msg": "Operation completed."
}
```

Local development may enable:

```text
API_LOG_PRETTY=true
```

which renders the same structured events through `pino-pretty`.

Pretty logging is deliberately rejected outside the development environment.

## Log level

The threshold is controlled by:

```text
API_LOG_LEVEL
```

Allowed values:

```text
debug
info
warn
error
```

A domain must not decide global logging verbosity.

## Request IDs

Every HTTP request receives one request/correlation identifier.

The canonical HTTP header is:

```text
X-Request-ID
```

A caller may provide a safe request ID.

When no valid ID exists, the API generates a UUID.

The resulting identifier is:

- attached to request-scoped logs;
- available through `RequestContextService`;
- returned in the `X-Request-ID` response header.

The CORS configuration exposes this response header so browser JavaScript may read it.

## Request ID trust

A request ID is diagnostic metadata only.

It must never be used as:

```text
authentication
authorization
Identity
Organization context
Membership context
idempotency proof
```

A caller being able to choose a request ID gives them no additional authority.

## Request context

Request correlation uses `AsyncLocalStorage`.

Application code that genuinely needs the current support/debug identifier may inject:

```text
RequestContextService
```

and call:

```typescript
requestContext.getRequestId();
```

The service deliberately contains only correlation information.

Organization and actor authority stay in their explicit application/security boundaries.

## HTTP request logging

The default HTTP logger records only operational metadata such as:

```text
requestId
method
path
status code
duration
service
environment
```

It does not log by default:

```text
request body
response body
request headers
cookies
authorization header
query string
```

The URL logger records the path without the query component.

This reduces accidental credential/PII exposure.

## Secret redaction

Structured logging redacts known secret-bearing fields such as:

```text
password
token
accessToken
refreshToken
sessionToken
apiKey
secret
clientSecret
databaseUrl
connectionString
authorization
cookie
```

Representative nested credential locations are covered as well.

Error strings receive additional sanitization for:

```text
URI credentials
Bearer credentials
Basic credentials
password=...
token=...
api_key=...
secret=...
```

Redaction is defense in depth.

Code must still avoid logging complete:

```text
process.env
runtime configuration objects
credentials
request bodies
authorization/session objects
```

## Unexpected errors

Unexpected exceptions are logged server-side with correlation context.

They are not serialized directly to clients.

The client continues to receive the stable error contract:

```json
{
    "error": {
        "type": "internal_error",
        "code": "internal.unexpected",
        "message": "An unexpected internal error occurred."
    }
}
```

Support/debugging can correlate the client-visible:

```text
X-Request-ID
```

with the server-side structured event.

## Technical logging versus business audit

Technical logs are not the permanent business audit trail.

Technical logging answers questions such as:

```text
Which request failed?
How long did it take?
Which dependency was unavailable?
Which exception occurred?
```

Business audit eventually answers questions such as:

```text
Who changed the Sale?
What changed?
Why was it changed?
What was the previous authoritative value?
```

Those responsibilities must remain separate.

Issue #33 does not implement domain Audit Events.

## Liveness

The liveness endpoint is:

```text
GET /health/live
```

Successful response:

```json
{
    "status": "ok"
}
```

Liveness means:

```text
the process is alive and capable of answering HTTP
```

It deliberately does not check PostgreSQL.

A PostgreSQL outage must not make liveness fail.

Otherwise an orchestrator could repeatedly restart a healthy application process because an external dependency is unavailable.

## Readiness

The readiness endpoint is:

```text
GET /health/ready
```

When all required dependencies are available:

```json
{
    "status": "ready",
    "dependencies": {
        "postgresql": "ready"
    }
}
```

HTTP status:

```text
200
```

When PostgreSQL is unavailable:

```json
{
    "status": "not_ready",
    "dependencies": {
        "postgresql": "unavailable"
    }
}
```

HTTP status:

```text
503
```

Readiness therefore answers:

```text
should this instance currently receive application traffic?
```

## Readiness timeout

PostgreSQL readiness uses:

```text
API_READINESS_TIMEOUT_MS
```

with a default of:

```text
2000
```

The value is bounded by runtime configuration.

The database probe performs only:

```sql
SELECT 1
```

It does not:

```text
write data
run migrations
modify session tenant context
perform domain queries
```

## Readiness extension

`HealthModule` consumes explicit readiness probes.

PostgreSQL is currently the only required runtime dependency.

Future required infrastructure may register additional probes without changing liveness semantics.

Do not add optional third-party integrations to readiness merely because they exist.

A dependency should affect readiness only when the API genuinely cannot serve required traffic without it.

## Health request logging

Successful health probes are excluded from automatic HTTP request logging to avoid high-volume probe noise.

Readiness failures produce an explicit warning event.

Request correlation still exists for the health HTTP request.

## Database pool failures

Background node-postgres pool errors are handled and logged through the structured technical logger.

The pool error listener prevents an idle-connection error event from becoming an unhandled EventEmitter error.

Logging callback failures are prevented from crashing the database pool.

## Transport contracts

Transport-facing schemas remain owned by:

```text
@manasiness/contracts
```

Transport validation does not replace domain validation.

## API errors

Clients branch on:

```text
error.type
error.code
```

not human-readable messages.

Unexpected internal values and stack traces never belong in the HTTP response.

## OpenAPI

When:

```text
API_DOCS_ENABLED=true
```

the raw OpenAPI document is exposed at:

```text
GET /docs/openapi.json
```

Swagger UI is not part of the M1 baseline.

## Database runtime role

The API uses the dedicated non-privileged runtime role:

```text
manasiness_app
```

The migration/admin role is not an application runtime credential.

## Tenant persistence

Organization-owned persistence requires:

```text
TENANT_DATABASE_SCOPE
```

Request correlation is independent from tenant isolation.

A `requestId` must never be treated as an `organizationId`.

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
        logging/
        openapi/
        request-context/
```

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

- technical logging is not business audit;
- request correlation is not authorization context;
- pure domain behavior does not depend on Pino;
- request and response bodies are not logged by default;
- secrets are not intentionally emitted to logs;
- unexpected exceptions remain private from clients;
- liveness does not depend on external infrastructure;
- readiness only represents required serving dependencies;
- Organization-owned persistence remains explicitly tenant-scoped;
- controllers do not own business invariants or transaction boundaries.
