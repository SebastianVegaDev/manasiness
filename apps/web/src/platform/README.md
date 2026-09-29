# Web Platform

`platform/` contains technical capabilities required by the web application that are not owned by a product feature.

Examples include:

- runtime configuration;
- API transport infrastructure;
- observability integration;
- browser/runtime adapters;
- framework integration boundaries;
- application-level styling tokens;
- theme initialization.

Platform code must not become a generic location for business behavior.

Business rules remain owned by the backend/domain capabilities that define them.

## Server and client boundaries

Next.js code may execute in different runtime contexts.

Code that handles secrets, privileged credentials, private service addresses, or server-only infrastructure must remain explicitly server-only.

Use:

```typescript
import 'server-only';
```

for modules that must never enter a Client Component dependency graph.

## Runtime configuration

Environment access is centralized under:

```text
platform/environment/
```

The current configuration model deliberately separates:

```text
server-only runtime configuration
```

from:

```text
browser-safe build configuration
```

Feature code must not read arbitrary `process.env` values.

## Public configuration

Only explicitly allowlisted `NEXT_PUBLIC_*` values may enter browser bundles.

A `NEXT_PUBLIC_*` prefix is an exposure decision.

It must never be applied to a value merely to make it accessible from a Client Component.

## Server configuration

Private server configuration is validated through the server environment boundary and protected with `server-only`.

The Next.js instrumentation hook validates required Node-runtime configuration before the server becomes ready.

## Styling tokens

Application-level semantic visual tokens live under:

```text
platform/styling/
```

This boundary owns product-wide CSS custom properties such as semantic colors, spacing, radii, elevation, typography scales, focus values, motion values, content widths, and stacking levels.

It does not own feature-specific layout or business presentation semantics.

Feature and later primitive CSS should consume these tokens instead of creating independent palettes or spacing scales.

## Theme initialization

Theme preference parsing and pre-hydration initialization live under:

```text
platform/theme/
```

Theme state is presentation state only. It must not become Organization configuration or authorization state.

The durable styling/theme rationale is recorded in:

```text
docs/adr/0014-web-styling-and-theme-foundation.md
```

Product visual guidance lives in:

```text
docs/product/visual-foundation.md
```

## Data access

The web application must not connect directly to PostgreSQL or duplicate backend persistence logic.

Future data access should cross an approved API/application boundary.

Server Components may perform server-side API communication, but being server-side does not make them owners of backend business rules.
