# Runtime Configuration

> **Status:** Active  
> **Milestone:** M1 — Engineering Platform  
> **Scope:** API, web runtime, and future infrastructure consumers

## Purpose

Manasiness treats runtime configuration as explicit platform infrastructure.

Environment variables are untrusted process inputs.

They are not application configuration merely because they exist in `process.env`.

Each runtime must validate and convert the environment values it owns before the rest of the application consumes them.

Conceptually:

```text
process environment
        ↓
owned runtime schema
        ↓
validated immutable configuration
        ↓
application/platform consumer
```

## Ownership

Configuration schemas belong to the runtime or technical package that consumes them.

Examples:

```text
API HTTP configuration
→ apps/api

Web server configuration
→ apps/web

Browser-public web configuration
→ apps/web

Database connection configuration
→ packages/database
```

Do not create one universal mutable configuration object containing every variable used by every part of the repository.

## Environment is not domain state

Environment variables are appropriate for deployment and runtime infrastructure concerns.

Examples include:

- network addresses;
- service endpoints;
- credentials;
- log levels;
- database connection information;
- deployment/runtime classification.

Environment variables must not become storage for Organization business settings.

Examples that do not belong in process environment:

```text
Organization timezone
Organization currency
inventory policy
business numbering
customer settings
authorization policy
```

Those are application/domain data.

## Validation

Runtime configuration must be validated before the relevant runtime begins accepting work.

Invalid required configuration should fail fast.

Validation errors should identify:

```text
which variable is invalid
why it is invalid
```

They must not include raw secret values.

Do not log:

```text
process.env
complete configuration objects
secret-bearing validation input
```

## Required settings

A setting is required when the runtime cannot operate correctly without an explicit value.

Do not invent required variables solely because a future issue may use them.

For example, `DATABASE_URL` does not become required until PostgreSQL is actually consumed.

## Defaults

Defaults are acceptable for safe technical behavior when they are explicit and documented.

Examples include:

```text
API_HOST=127.0.0.1
API_PORT=3001
API_LOG_LEVEL=info
```

Defaults must not silently invent business meaning.

## Secrets

Secrets are server-only.

Examples may eventually include:

```text
database credentials
session signing keys
third-party API credentials
webhook secrets
```

Secret values must never be:

- prefixed with `NEXT_PUBLIC_`;
- copied into browser configuration;
- included in validation errors;
- logged as part of a configuration object;
- committed to `.env.example`.

`.env.example` documents names and safe example values only.

## Web server versus browser configuration

Next.js has two materially different configuration contexts.

### Server runtime

Server-only values remain private and may vary when a server instance starts.

Example:

```text
WEB_API_ORIGIN
```

### Browser build

`NEXT_PUBLIC_*` values are deliberately public and become part of browser JavaScript.

Example:

```text
NEXT_PUBLIC_API_ORIGIN
```

Public variables are build-time configuration.

Changing them after an artifact has been built does not rewrite the existing browser bundle.

Therefore public environment values must be treated as part of the build artifact contract.

## API origins

The Next.js server and browser may observe different network addresses for the same API.

For example:

```text
Next server
→ http://api.internal:3001

Browser
→ https://api.example.com
```

Therefore Manasiness distinguishes:

```text
WEB_API_ORIGIN
```

from:

```text
NEXT_PUBLIC_API_ORIGIN
```

This avoids leaking internal infrastructure addresses merely because browser code also needs API access.

## Environment files

Committed files:

```text
.env.example
```

Uncommitted local files:

```text
.env
.env.local
.env.*.local
```

Real credentials must not be committed.

Environment files are development/deployment input mechanisms, not persistent product state.

## API `.env`

The API uses Node.js native `.env` loading.

Process-provided environment variables remain authoritative over `.env` values.

The environment file path is resolved relative to the API workspace rather than the current shell directory.

## Next.js `.env`

Next.js owns loading its supported `.env*` files.

Do not implement a competing environment-file loader inside the web application.

## Tests

Configuration parsers receive an explicit environment source.

Tests should construct isolated environment objects rather than repeatedly modifying global `process.env`.

Preferred:

```text
parseConfig(createTestEnvironment(...))
```

Avoid:

```text
process.env.X = ...
run test
delete process.env.X
```

Global environment mutation makes parallel and order-independent tests harder to trust.

## Immutability

Validated runtime configuration is treated as immutable.

Business code must not mutate configuration to change application behavior at runtime.

A runtime setting changes by starting a process with new deployment configuration.

A business setting changes through the owning application/domain capability.

## Raw environment access

Direct `process.env` access is permitted only at explicit platform/framework boundaries responsible for constructing runtime configuration.

It should not appear throughout:

- domain modules;
- application use cases;
- feature code;
- controllers;
- UI components;
- repositories.

Framework-owned variables such as `NEXT_RUNTIME` may be read at the framework integration boundary when required.

## Future database configuration

Issue #28 will introduce PostgreSQL and Drizzle.

When the database package actually consumes database configuration, it should define and validate the database values it owns.

Do not move database credentials into the API domain model or web runtime configuration.

## Future secrets

This milestone does not select a secret-management vendor.

Whether production secrets later come from:

- deployment environment injection;
- a cloud secret manager;
- container orchestration;
- another approved mechanism;

the application-facing contract remains the same:

```text
untrusted runtime input
→ validation
→ typed configuration
→ consumer
```