# ADR 0014 — Web API client and server-state boundary

> **Status:** Accepted  
> **Date:** 2026-09-29

## Context

The Manasiness Web application will eventually consume many backend capabilities.

Without a common boundary, product screens could independently introduce:

```text
raw fetch calls
absolute API URLs
response parsing
timeout behavior
error parsing
cookie behavior
query keys
cache rules
retry behavior
```

That would spread transport concerns throughout UI code and make authentication, observability, contract changes, and cache behavior difficult to evolve consistently.

The backend already provides shared runtime transport contracts and a stable API error envelope.

The Web also already distinguishes browser-safe and server-only API origins.

## Decision

Manasiness establishes one thin Web API transport boundary under:

```text
apps/web/src/platform/api/
```

Browser server state uses TanStack Query.

Transport schemas continue to be owned by:

```text
@manasiness/contracts
```

No generated full SDK is introduced in M1.

## Client responsibilities

The generic API client owns:

```text
origin resolution
relative URL construction
JSON serialization
JSON parsing
timeouts
AbortSignal propagation
credential mode
structured API error decoding
response-schema validation
request-correlation extraction
```

It does not own domain or application behavior.

## URL model

API operations provide relative application paths.

The API origin comes from typed configuration.

A request path is not permitted to replace the configured origin.

This prevents feature code from silently establishing independent backend destinations.

## JSON

The current API boundary is JSON-oriented.

Request bodies are serialized as JSON and declare:

```text
Content-Type: application/json
```

Clients declare:

```text
Accept: application/json
```

Responses are parsed and validated through the operation's expected runtime schema.

## Response validation

HTTP success does not imply transport-contract success.

The Web validates successful payloads against shared schemas.

A shape mismatch becomes a protocol failure.

This detects backend/client contract drift close to the boundary rather than allowing malformed data to propagate through components.

## API failures

Structured API failures use the shared API error envelope.

The Web represents these as an explicit API response error containing:

```text
HTTP status
request ID when present
ApiError.type
ApiError.code
safe public message
```

Program behavior must use stable machine values rather than parsing human-readable messages.

## Protocol failures

Responses outside the expected protocol are represented independently from ordinary application/API rejection.

Examples include:

```text
invalid JSON
invalid successful response shape
non-success response outside the API error contract
```

Immediate retry is not the default for protocol incompatibility.

## Transport failures

Network and timeout failures are transport concerns rather than domain errors.

They are represented distinctly.

A caller-provided AbortSignal remains cancellation rather than being rewritten into an ordinary network failure.

## Timeouts

API requests have bounded execution time.

The default client timeout is:

```text
10000 ms
```

Individual operations may use a more appropriate value.

Timeouts complement upstream/backend deadlines; they do not replace them.

## Browser origin

Browser requests use:

```text
NEXT_PUBLIC_API_ORIGIN
```

The value is public by definition.

It must contain no secret information.

## Server origin

Next.js server-side requests use:

```text
WEB_API_ORIGIN
```

The value is protected by a server-only module and may identify an internal network address unavailable to browsers.

Server and browser API origins are deliberately allowed to differ.

## Cookies and credentials

Browser API requests use:

```text
credentials: include
```

The Nest CORS boundary allows credentials only against explicitly configured origins.

This prepares transport behavior for the M3 cookie/session model without implementing authentication in M1.

Server-side cookie forwarding remains explicit.

The generic server client does not automatically copy all incoming Next.js request headers.

## Server request propagation

Request-bound context such as a future session cookie is supplied explicitly when constructing the server API client.

This prevents accidental forwarding of unrelated infrastructure headers.

Future authentication work may introduce a narrower session-aware helper after the session model actually exists.

## Server-state ownership

TanStack Query owns browser-side cache state representing backend/server state.

Its cache is not canonical business state.

Canonical state belongs to backend domain/application capabilities and persistence.

The Web must not make business decisions merely because a cached object currently contains a particular value.

## QueryClient lifetime

The browser reuses one QueryClient.

The server does not maintain a global QueryClient shared across requests.

This prevents cross-request server-state leakage.

## Query keys

Query keys are:

```text
hierarchical
deterministic
serializable
owned by the capability defining the query
```

They remain colocated with their feature/platform query definitions.

A global registry containing every product query key is not introduced.

## Invalidation

Invalidation belongs with the mutation/application capability that understands which server state became stale.

UI screens should not coordinate broad cache invalidation manually.

Whole-cache clearing is not the normal mutation strategy.

## Retry policy

Browser queries retry only failures that may plausibly recover automatically.

The baseline includes:

```text
network failures
timeouts
408
429
5xx
```

Ordinary stable 4xx responses and protocol/schema failures are not blindly retried.

Mutations do not retry by default because command idempotency semantics have not yet been established.

## Server Components

Server Components may access the Nest API directly through the server API client.

TanStack Query is not mandatory for every server-side read.

For server-rendered data:

```text
Server Component
→ server API client
→ Nest API
```

is a valid and often simpler flow.

## Browser queries

TanStack Query is preferred when server state requires browser lifecycle behavior such as:

```text
interactive refetch
pagination
background refresh
mutation invalidation
filter changes
browser-driven loading state
```

## Server prefetching

When future features benefit from server prefetch plus browser cache reuse, they may use:

```text
QueryClient
dehydrate
HydrationBoundary
```

No speculative hydration layer is created for M1's technical health smoke.

## Next.js Route Handlers

Next.js Route Handlers are not a mandatory proxy layer.

Do not create:

```text
browser
→ Next.js business proxy
→ Nest API
```

solely because the framework supports route handlers.

A Route Handler is justified only when it contributes a real browser/server security or runtime boundary.

## Shared contracts

The health transport response is moved into `@manasiness/contracts`.

Both Nest and Web consume the same runtime schema.

This pattern should be used for future externally meaningful API contracts.

Shared transport schemas do not become shared domain models.

## Backend separation

The Web may consume `@manasiness/contracts`.

It must not import:

```text
Nest modules
Nest controllers
Nest application services
@manasiness/database
backend persistence adapters
```

Backend implementation remains behind the transport boundary.

## Operational smoke integration

The technical development landing uses a TanStack Query readiness request.

The query proves:

```text
browser
→ QueryClient
→ API client
→ credentialed CORS
→ Nest
→ PostgreSQL readiness
→ runtime contract validation
```

This is infrastructure verification rather than product UI.

## Consequences

### Positive

- raw fetch conventions remain centralized;
- browser/server origins remain safely separated;
- response contracts are runtime-validated;
- API failures retain stable machine semantics;
- request cancellation reaches fetch;
- transport calls have explicit time bounds;
- request correlation remains available to support/debugging;
- M3 cookie sessions have an appropriate HTTP foundation;
- server state gets one cache owner;
- query retries are intentional;
- screens do not become transport adapters;
- no duplicate Next.js business API is created.

### Trade-offs

- Web now depends on TanStack Query;
- Web gains a runtime dependency on shared contracts;
- package build ordering must ensure contracts exist before Next development/build;
- schema validation adds a small runtime cost at the Web transport boundary;
- feature authors must decide whether data belongs in Server Components or browser server state.

These costs are accepted because they provide a consistent transport boundary before product screens proliferate.

## Alternatives considered

### Raw `fetch` in each feature

Rejected.

It would duplicate error, timeout, origin, credential, and response-validation behavior.

### Generated full SDK

Deferred.

The API surface is still small and rapidly evolving.

A large generated client would add tooling before its value is demonstrated.

### Put backend models directly in the Web

Rejected.

Transport contracts are not domain implementation models.

### Store all server data in a global client store

Rejected.

TanStack Query already owns remote server-state caching and lifecycle.

### Proxy every request through Next.js Route Handlers

Rejected.

That would create a redundant business HTTP layer without a security/runtime justification.

### Use the public API origin for server execution

Rejected.

Browser and server network topology can differ, and server-only internal origins must remain possible.

### Automatically forward all server request headers

Rejected.

Cross-boundary header propagation should be explicit and allowlisted.

## References

- `apps/web/README.md`
- `apps/web/src/platform/api/`
- `apps/web/src/platform/query/`
- `packages/contracts/src/health/operational-health.ts`
- ADR 0010 — Transport contracts and API errors
- ADR 0012 — Layered automated testing strategy
- Issue #36