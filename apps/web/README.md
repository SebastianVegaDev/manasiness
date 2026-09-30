# Manasiness Web

`@manasiness/web` is the Next.js product runtime for Manasiness.

The current Web baseline combines two established layers:

```text
M1 — Engineering Platform
    Web/API transport, typed runtime configuration, TanStack Query wiring,
    operational health integration, and repository quality gates

M2 — Product Experience Foundation
    information architecture, visual tokens/themes, localization,
    reusable UI primitives, application shell, shared form/collection/
    feedback patterns, accessibility/responsive gates, and visual regression
```

M3 owns authentication, Identity, Organizations, Membership, authorization, and the first real protected account/tenant flows. Later milestones own business-domain screens.

For the complete M2 exit baseline, read:

```text
docs/product/m2-product-experience.md
```

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

The product styling layer uses semantic CSS custom properties plus CSS Modules. Reusable interactive primitives remain source-owned and native-first unless a real consumer justifies another dependency.

## Local development

Create the Web environment file:

```powershell
Copy-Item apps/web/.env.example apps/web/.env
```

Start the API/PostgreSQL environment as needed and run:

```powershell
pnpm --filter @manasiness/web dev
```

Default addresses are:

```text
Web  http://localhost:3000
API  http://127.0.0.1:3001
```

## Source ownership

The Web source tree is organized by responsibility:

```text
src/
    app/
        # Next.js route composition

    features/
        # Product/business capabilities when their owning milestones implement them

    platform/
        api/
            # Shared HTTP transport boundary

        collections/
            # Domain-neutral collection composition and URL-state helpers

        environment/
            # Typed browser/server runtime configuration

        feedback/
            # Domain-neutral alerts, generic states, toasts, confirmations

        forms/
            # Domain-neutral form/error/submission composition

        health/
            # Operational Web/API integration

        i18n/
            # Presentation locale, messages, formatting

        query/
            # TanStack Query platform wiring

        shell/
            # Application shell and reusable page composition

        styling/
            # Semantic visual tokens

        theme/
            # Presentation-theme initialization

        ui/
            # Domain-neutral UI primitives
```

`platform/` is technical/product-experience infrastructure. It must not become a generic location for business rules.

Do not create unowned dumping grounds such as:

```text
components/
common/
utils/
helpers/
```

Reuse follows responsibility.

## Product-experience source of truth

M2 product contracts live under:

```text
docs/product/
```

The main documents are:

```text
product-experience.md
visual-foundation.md
ui-primitives.md
localization-and-copy.md
application-shell.md
form-and-mutation-patterns.md
collection-and-data-display-patterns.md
feedback-and-state-patterns.md
accessibility-and-responsive-quality.md
visual-regression.md
m2-product-experience.md
```

Read the owning document before changing a shared product-experience boundary.

## Current routes

M2 establishes the shell and engineering fixtures without inventing later business screens:

```text
/
/app/[organizationId]
/app/[organizationId]/overview
/foundation
```

`/app/[organizationId]` redirects to the Organization-scoped Overview route.

The Organization ID preserves route context but is not authorization proof. M3 must resolve the authenticated Identity/Membership and validate access to the Organization named by the URL.

`/foundation` is an engineering-only fixture for reusable patterns and browser quality gates. It is not product navigation.

Unimplemented business areas may appear as explicitly unavailable navigation items so the information architecture can be evaluated, but they must not link to fake CRUD/product screens.

## Application shell and M3 seams

The shell is owned by:

```text
src/platform/shell/
```

It owns application chrome, responsive navigation, current-location presentation, page-layout composition, and stable presentation seams.

It does not own sessions, Membership, authorization, Organization persistence, or feature business state.

M3 should compose real authenticated controls into the existing seams:

```text
data-shell-slot="organization-switcher"
data-shell-slot="identity-account-menu"
```

Navigation visibility may later reflect Membership/permission results for usability, but authorization remains an API/application responsibility.

## Web-to-API boundary

Feature and UI code must not establish independent HTTP conventions.

The reusable transport boundary lives under:

```text
src/platform/api/
```

The direction is:

```text
route / component / feature
        ↓
feature query or command
        ↓
API client
        ↓
shared transport contract
        ↓
NestJS API/application capability
```

Avoid:

```text
component
→ raw fetch
→ hand-built URL
→ custom error parsing
```

A direct `fetch()` is acceptable only inside the owned transport boundary or for a deliberately exceptional framework/infrastructure requirement.

## API client responsibilities

The API client owns cross-cutting transport behavior such as:

```text
base-origin resolution
relative path resolution
JSON serialization/decoding
request timeout
AbortSignal propagation
credential behavior
request headers
structured API-error decoding
response-contract validation
request correlation extraction
```

It does not own:

```text
business rules
authorization decisions
domain state transitions
feature-specific invalidation
UI rendering
```

## Shared transport contracts

Transport schemas legitimately shared between API and Web belong to:

```text
@manasiness/contracts
```

The same canonical runtime schema should provide both validation and TypeScript inference.

Do not duplicate a wire contract as an unrelated TypeScript interface when the shared runtime schema already owns it.

A successful HTTP status does not make an arbitrary payload trusted. Web clients validate the expected response contract.

## API failures

The Web distinguishes:

```text
ApiResponseError
    API returned a structured non-success response

ApiProtocolError
    response did not satisfy the expected transport protocol/schema

ApiTransportError
    request could not complete, for example network failure or timeout
```

Control flow uses stable machine-readable values such as:

```text
HTTP status
error.type
error.code
```

Human-readable error messages are presentation/debug text and must not be parsed as protocol identifiers.

Request IDs are diagnostic context, not authentication, tenant context, Identity, or idempotency proof.

## Timeouts and cancellation

Every API request has a bounded timeout. The default transport timeout is:

```text
10000 ms
```

TanStack Query supplies an `AbortSignal` to browser query functions. That signal must propagate through the API client to `fetch`.

External query cancellation remains cancellation rather than being converted into an ordinary retryable transport failure.

## URL safety

The API client accepts application-relative backend paths, for example:

```text
/health/ready
/sales
/sales/<id>?include=lines
```

Feature code does not construct arbitrary absolute backend URLs. Paths capable of replacing the configured origin are rejected by the shared client boundary.

## Browser API client

Browser requests use:

```text
NEXT_PUBLIC_API_ORIGIN
```

through:

```text
browserApiClient
```

Browser transport uses `credentials: include` so the boundary can support the future cookie-based session model without M2 inventing sessions.

## Server API client

Next.js server-side API requests use:

```text
WEB_API_ORIGIN
```

through:

```text
createServerApiClient()
```

The server origin may differ from the public browser origin.

`WEB_API_ORIGIN` is server-only and must never enter browser JavaScript.

A future authenticated Server Component that needs request-bound session context should explicitly supply only the required cookie/request information to the server API client. Do not blindly forward all incoming headers, proxy headers, `Host`, or unrelated authorization material across service boundaries.

## Configuration boundaries

Server-only runtime configuration is owned by:

```text
src/platform/environment/server-environment.ts
```

Browser-safe build configuration is explicitly allowlisted through `NEXT_PUBLIC_*` values.

Anything under `NEXT_PUBLIC_*` is public and must never contain secrets, private service addresses, credentials, database information, or server tokens.

Feature code must not scatter direct `process.env` access.

## TanStack Query

TanStack Query owns browser-managed server-state lifecycle such as:

```text
refetching
interactive filtering
pagination
background refresh
user-triggered reload
mutation invalidation
browser lifecycle
```

It is not canonical business state.

Canonical business state remains owned by backend/domain/application capabilities.

Do not introduce another global state library merely to copy the same remote data.

### QueryClient

The browser application uses the established `QueryProvider` boundary.

Server QueryClient instances must not be shared globally across requests.

### Query keys

Query keys belong with their owning capability and remain hierarchical, deterministic, stable, and serializable.

Do not create one giant global query-key file for every future feature.

### Invalidation

The mutation/application capability that knows what became stale owns invalidation.

A page component should not need detailed knowledge of every cache affected by a business command.

Do not routinely clear the entire QueryClient as an invalidation strategy.

### Retry policy

Queries retry only failures that may reasonably recover, such as transport failures, timeouts, HTTP 408/429, and selected 5xx responses.

Stable application/client failures and protocol/schema violations are not blindly retried.

Mutations do not retry automatically unless the owning operation explicitly proves retry is safe.

## Server and browser data access

Prefer direct server-side API access when a Server Component only needs data to render.

Use TanStack Query when browser-managed remote-state lifecycle is genuinely required.

Future server prefetch/hydration may use the standard QueryClient/dehydrate/HydrationBoundary flow when it solves a real waterfall or experience problem. It is not mandatory for every request.

## Mutations

Future feature mutations belong with their owning feature/application capability and should compose:

```text
API client
+
shared contracts
+
TanStack mutation
+
explicit invalidation
```

Mutation hooks do not become a second business-rule layer.

## Next.js Route Handlers

Do not create a duplicate API inside `app/api/*` merely because App Router supports Route Handlers.

A Route Handler/proxy is appropriate only when it creates a real boundary, for example:

- protecting server-only credentials;
- same-origin cookie/session translation;
- webhook termination;
- access to a browser-inaccessible internal service;
- framework-specific protocol adaptation.

It is not a mandatory browser → Next.js → NestJS hop when the browser can safely use the Nest API directly.

## PostgreSQL and NestJS boundaries

The Web never imports:

```text
@manasiness/database
```

and never connects directly to PostgreSQL.

The Web may import:

```text
@manasiness/contracts
```

It must not import implementation modules from:

```text
apps/api
Nest controllers
Nest services
backend repositories
database adapters
```

## Operational health

The M1 readiness query remains:

```text
GET /health/ready
```

It proves the platform path:

```text
Next browser runtime
→ TanStack Query
→ browser API client
→ CORS
→ Nest API
→ PostgreSQL readiness
→ shared transport schema
```

This is operational/platform validation, not a product feature. Its engineering presentation belongs on `/foundation`, not in product navigation.

## Styling and theme

Semantic application-level tokens live under:

```text
src/platform/styling/
```

The Web uses:

```text
semantic CSS custom properties
+
global reset/base rules
+
CSS Modules
```

Theme preference supports:

```text
system
light
dark
```

and remains presentation state only.

Do not infer theme from Organization, Membership, Identity authorization, currency, country, or timezone.

## Localization and formatting

Presentation-locale infrastructure lives under:

```text
src/platform/i18n/
```

M2 supports:

```text
en-US
es-PE
```

with `en-US` fallback.

UI locale does not participate in product route identity and does not own Organization currency/timezone or business formatting policy.

Future feature copy remains feature-owned rather than turning the platform message catalog into a global dumping ground.

## Reusable UI and shared patterns

Domain-neutral reusable UI lives under explicit platform capabilities:

```text
platform/ui/
platform/forms/
platform/collections/
platform/feedback/
```

These layers may own reusable interaction/composition semantics, but they do not own feature schemas, business validation meaning, business commands, authorization decisions, or domain-specific status vocabulary.

## Accessibility, responsive, and visual quality

Shared M2 surfaces are protected through Browser E2E accessibility/responsive checks and deterministic visual regression.

Canonical guidance lives in:

```text
docs/product/accessibility-and-responsive-quality.md
docs/product/visual-regression.md
```

The `/foundation` route supplies product-neutral engineering fixtures for shared-pattern validation. New real product screens still require feature-level accessibility/responsive review.

## Commands

Development:

```powershell
pnpm --filter @manasiness/web dev
```

Web build/type/lint/unit tests:

```powershell
pnpm --filter @manasiness/web build
pnpm --filter @manasiness/web typecheck
pnpm --filter @manasiness/web lint
pnpm --filter @manasiness/web test
```

Portable functional Browser E2E:

```powershell
pnpm test:e2e
```

Canonical Linux visual comparison:

```powershell
pnpm test:visual
```

Intentional canonical visual-baseline update on the supported Linux environment:

```powershell
pnpm test:visual:update
```

The repository `Browser E2E` CI gate runs the functional and canonical visual projects together.

## Current scope and deferrals

M2 establishes shared product infrastructure, not the business application itself.

Still intentionally deferred are:

```text
authentication / sessions
Identity registration / recovery / account behavior
Organization persistence / creation / selection / real switching
Membership / permissions / authorization
Parties and relationship business screens
Sales / Purchasing / Catalog / Inventory business screens
Finance / Workforce / Reporting / Assistant business screens
marketing-site design
production deployment hardening
```

Do not fill those gaps with fake data, fake routes, placeholder authorization, or speculative domain components merely to make the shell look complete.

M3 should extend the established shell, transport, localization, theme, UI, and route seams rather than rebuilding them.
