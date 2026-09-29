# Manasiness Web

`@manasiness/web` is the Next.js web runtime for Manasiness.

M1 establishes the engineering platform and the Web-to-API/server-state boundary.

Product information architecture, branding, navigation, localization behavior, and reusable UI-system decisions remain later product responsibilities.

## Runtime

The application uses:

```text
Node.js 24
Next.js 16
React 19
TypeScript
App Router
Zod
TanStack Query
```

## Local development

Create:

```powershell
Copy-Item apps/web/.env.example apps/web/.env
```

Start the API/PostgreSQL environment as needed and run:

```powershell
pnpm --filter @manasiness/web dev
```

The default Web address is:

```text
http://localhost:3000
```

The default local API address is:

```text
http://127.0.0.1:3001
```

## Web-to-API boundary

Feature and UI code must not establish its own HTTP conventions.

The reusable transport boundary lives under:

```text
src/platform/api/
```

The direction is:

```text
component / feature
        ↓
feature query or command
        ↓
API client
        ↓
shared transport contract
        ↓
NestJS API
```

Avoid:

```text
component
→ raw fetch
→ hand-built URL
→ custom error parsing
```

A direct `fetch()` is acceptable only inside the transport boundary or for a deliberately exceptional framework/infrastructure use case.

## API client responsibilities

The API client owns cross-cutting transport behavior:

```text
base-origin resolution
relative path resolution
JSON serialization
JSON decoding
request timeout
AbortSignal propagation
credential behavior
request headers
structured API error decoding
response-contract validation
request correlation extraction
```

It does not own:

```text
business rules
authorization decisions
domain state transitions
feature-specific cache invalidation
UI rendering
```

## Shared transport contracts

Transport schemas that are shared between API and Web belong to:

```text
@manasiness/contracts
```

Examples include:

```text
API errors
entity transport IDs
operational health responses
future feature request/response contracts
```

The Web should not recreate an API response interface when a canonical runtime schema already exists.

The same schema provides:

```text
runtime validation
+
TypeScript inference
```

A successful HTTP status does not mean the payload should be blindly trusted.

The Web validates the response against the expected shared schema.

## API errors

The canonical API failure envelope is:

```json
{
    "error": {
        "type": "conflict",
        "code": "resource.conflict",
        "message": "The resource conflicts with existing state."
    }
}
```

Web behavior branches on stable values such as:

```text
status
error.type
error.code
```

Never use human-readable messages as control flow.

Do not write:

```typescript
if (error.message.includes('already exists')) {
    // ...
}
```

Messages are presentation/debug text, not protocol identifiers.

## Failure categories

The Web distinguishes three broad client failures.

### API response failure

The API returned a non-success HTTP result using the shared API error contract.

Represented by:

```text
ApiResponseError
```

It contains:

```text
HTTP status
X-Request-ID when available
shared ApiError
```

### Protocol failure

The server response did not satisfy the transport protocol expected by the client.

Examples:

```text
invalid JSON
successful response with an invalid shape
non-success response outside the shared error envelope
```

Represented by:

```text
ApiProtocolError
```

### Transport failure

The request could not complete.

Examples:

```text
network failure
timeout
```

Represented by:

```text
ApiTransportError
```

External query cancellation is preserved rather than converted into an ordinary retryable network failure.

## Timeouts and cancellation

Every API request has a bounded timeout.

The default transport timeout is:

```text
10000 ms
```

A capability may select a narrower value when appropriate.

TanStack Query supplies an `AbortSignal` to each query function.

That signal must be passed to the API client:

```text
TanStack Query
→ AbortSignal
→ API client
→ fetch
```

Do not create data-fetching hooks that silently discard cancellation.

## URL safety

The API client accepts application-relative paths such as:

```text
/health/ready
/sales
/sales/<id>?include=lines
```

It rejects paths that can replace the configured origin, such as:

```text
//other-host.example/path
```

Feature code does not construct arbitrary absolute backend URLs.

The configured API origin remains authoritative.

## Browser API client

Browser requests use:

```text
NEXT_PUBLIC_API_ORIGIN
```

through:

```text
browserApiClient
```

The browser client uses:

```text
credentials: include
```

so the transport layer is compatible with the future cookie-based session model.

Issue #36 does not implement authentication or sessions.

## Server API client

Next.js server-side API requests use:

```text
WEB_API_ORIGIN
```

through:

```text
createServerApiClient()
```

The server origin may differ from the browser origin.

For example:

```text
WEB_API_ORIGIN=http://api.internal:3001
NEXT_PUBLIC_API_ORIGIN=https://api.example.com
```

`WEB_API_ORIGIN` is server-only and must never enter browser JavaScript.

## Server request context

The server client does not automatically forward every header received by Next.js.

When a future request-bound server operation needs a session cookie, the caller explicitly supplies the cookie header.

Conceptually:

```typescript
const incomingHeaders = await headers();

const api = createServerApiClient({
    cookieHeader: incomingHeaders.get('cookie') ?? undefined,
});
```

This makes propagation visible.

Do not blindly forward:

```text
all request headers
proxy headers
Host
Authorization
internal infrastructure headers
```

across service boundaries.

## Configuration boundaries

There are two configuration surfaces.

### Server-only

```text
APP_ENV
WEB_API_ORIGIN
```

Owned by:

```text
src/platform/environment/server-environment.ts
```

The server module imports:

```typescript
import 'server-only';
```

### Browser-safe

```text
NEXT_PUBLIC_API_ORIGIN
```

Anything under `NEXT_PUBLIC_*` must be considered public because Next.js includes it in browser output.

It must never contain:

```text
credentials
secret tokens
private service addresses
database information
```

Feature code must not read arbitrary environment variables directly.

## TanStack Query

TanStack Query owns browser-side server state.

Examples of server state include:

```text
sales returned by the API
current inventory availability
customer records
server-side search results
```

Do not introduce another global-state library merely to store the same remote state.

TanStack Query cache is not canonical business state.

Canonical business state remains owned by the backend/domain.

## QueryClient

The root Web application provides one browser QueryClient through:

```text
QueryProvider
```

On the server, QueryClient instances are not shared globally between requests.

This prevents request data from leaking between users.

## Query keys

Query keys belong with the capability that owns the query.

Use hierarchical, deterministic values.

Example:

```typescript
['sales', 'detail', saleId];
```

or:

```typescript
['inventory', 'availability', warehouseId, productId];
```

Platform-level keys use the same rule:

```typescript
['platform', 'health', 'readiness'];
```

Avoid one giant global file containing every future query key.

Keep query definitions close to their capability.

Query-key values must be stable and serializable.

## Invalidation ownership

The mutation/application capability that knows what became stale owns invalidation.

For example:

```text
confirm sale
        ↓
mutation succeeds
        ↓
invalidate affected sale
invalidate affected inventory views
```

A page component should not need detailed knowledge about all caches affected by a business command.

Do not solve invalidation by routinely clearing the entire QueryClient.

## Query retries

Queries automatically retry only failures that may reasonably recover:

```text
network failures
timeouts
HTTP 408
HTTP 429
HTTP 5xx
```

Stable 4xx application/client failures are not blindly retried.

Protocol/schema violations are not retried because another immediate request is unlikely to repair an incompatible contract.

Mutations do not retry automatically by default.

A future use case may opt into retry only when its operation semantics make that safe.

## Server-side data access

Prefer direct server-side API access when data is needed to render a Server Component and does not require browser-driven lifecycle behavior.

Conceptually:

```text
Server Component
→ serverApiClient
→ Nest API
```

Do not introduce TanStack Query solely because every API call must supposedly use a browser hook.

Server Components are already a server data-fetching boundary.

## Browser-side queries

Prefer TanStack Query when data needs browser-managed server-state behavior such as:

```text
refetching
interactive filtering
pagination
background refresh
user-triggered reload
mutation invalidation
browser lifecycle
```

## Server prefetch and hydration

Future product screens may prefetch through a server QueryClient and hydrate that state into the browser when doing so avoids request waterfalls or improves user experience.

That should use TanStack Query's normal:

```text
QueryClient
dehydrate
HydrationBoundary
```

flow.

Issue #36 does not add speculative prefetching for the technical landing page.

## Mutations

Future mutations belong with the feature/application capability that owns them.

They should use:

```text
API client
+
shared contracts
+
TanStack mutation
+
explicit invalidation
```

Do not put business rules into mutation hooks.

The API/domain remains authoritative.

## Next.js Route Handlers

Do not create a duplicate API inside Next.js merely because App Router supports:

```text
app/api/*
```

A Route Handler or proxy is appropriate only when it provides a real boundary, for example:

```text
protecting server-only credentials
same-origin session/cookie translation
webhook termination
browser-inaccessible internal service access
framework-specific protocol adaptation
```

It is not appropriate simply to transform:

```text
browser
→ Next route handler
→ Nest route
```

when the browser can safely use the Nest API directly.

## PostgreSQL

The Web never imports:

```text
@manasiness/database
```

and never connects to PostgreSQL.

The Web consumes backend capabilities through transport/application boundaries.

## NestJS

The Web may import:

```text
@manasiness/contracts
```

It must not import implementation modules from:

```text
apps/api
Nest controllers
Nest services
database adapters
```

Transport contracts are deliberately separate from backend implementation.

## Operational smoke query

M1 includes one browser query:

```text
GET /health/ready
```

Its purpose is to prove:

```text
Next browser runtime
→ TanStack Query
→ browser API client
→ CORS
→ Nest API
→ PostgreSQL readiness
→ shared transport schema
```

This is platform validation.

It is not a product feature.

## Source layout

```text
src/
    app/
        # Next.js route composition

    features/
        # Future product-facing capabilities

    platform/
        api/
            # Shared HTTP transport boundary

        environment/
            # Typed browser/server configuration

        health/
            # Operational Web/API integration

        query/
            # TanStack Query platform wiring
```

`platform/` must remain technical infrastructure.

Do not move product-specific API operations into `platform/api/`.

For example:

```text
platform/api/api-client.ts
```

is correct.

But a future:

```text
getSales()
confirmSale()
searchCustomers()
```

belongs with its owning feature/application capability.

## Commands

Development:

```powershell
pnpm --filter @manasiness/web dev
```

Build:

```powershell
pnpm --filter @manasiness/web build
```

Typecheck:

```powershell
pnpm --filter @manasiness/web typecheck
```

Lint:

```powershell
pnpm --filter @manasiness/web lint
```

Unit tests:

```powershell
pnpm --filter @manasiness/web test
```

Integrated browser test:

```powershell
pnpm test:e2e
```

## UI scope

Issue #36 still does not establish:

```text
Tailwind
shadcn/ui
brand assets
theme tokens
navigation architecture
dashboard layout
authentication screens
component library
product CRUD screens
```

Those remain later product/UI responsibilities.
