# Web Platform

`platform/` contains technical capabilities required by the web application that are not owned by a product feature.

Examples include:

- runtime configuration;
- API transport infrastructure;
- observability integration;
- browser/runtime adapters;
- framework integration boundaries;
- application-level styling tokens;
- theme initialization;
- localization and presentation formatting;
- reusable domain-neutral UI primitives;
- reusable domain-neutral form and collection composition.

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

Interactive UI code should establish the smallest possible Client Component boundary. A menu or dialog requiring browser state must not force an entire route or shell into the client module graph.

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

This boundary owns product-wide CSS custom properties such as semantic colors, interaction-state colors, spacing, radii, elevation, typography scales, focus values, motion values, content widths, and stacking levels.

It does not own feature-specific layout or business presentation semantics.

Feature and primitive CSS should consume these tokens instead of creating independent palettes or spacing scales.

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

## Localization and formatting

Presentation-locale infrastructure lives under:

```text
platform/i18n/
```

This boundary owns:

- supported UI locale identifiers;
- request-language negotiation;
- Server and Client Component translation access;
- browser-safe message context;
- standards-based number/date/time presentation formatting.

It does not own:

- Organization currency or timezone selection;
- tax/accounting localization;
- authentication preference persistence;
- business calculations;
- API error semantics.

Currency and timezone remain explicit inputs supplied by their owning business/application capability.

The localization contract is documented in:

```text
docs/product/localization-and-copy.md
docs/adr/0016-web-localization-runtime-boundary.md
```

## Reusable UI primitives

Domain-neutral product UI primitives live under:

```text
platform/ui/
```

This boundary owns shared interaction semantics such as buttons, fields, choice controls, menus, dialogs, status badges, separators, and loading skeletons.

It does not own:

- business components;
- API calls;
- domain rules;
- feature-specific status vocabulary;
- form orchestration;
- application-shell composition;
- product wording that belongs to a consumer.

The primitive contract is documented in:

```text
docs/product/ui-primitives.md
docs/adr/0015-native-first-web-ui-primitives.md
```

Do not create generic `components`, `common`, or `utils` folders as an alternative ownership model.

## Reusable form composition

Domain-neutral form composition lives under:

```text
platform/forms/
```

This boundary coordinates accessible field/error relationships, generic submission/focus conventions, structured API-error classification, and consequential confirmation composition.

It does not own feature schemas, business validation meaning, API commands, feature error copy, or post-success navigation.

The form interaction contract is documented in:

```text
docs/product/form-and-mutation-patterns.md
```

## Reusable collection composition

Domain-neutral collection composition lives under:

```text
platform/collections/
```

This boundary owns reusable collection toolbar layout, URL-state transformation helpers, pagination presentation, collection-specific loading/absence/error presentation, and semantic table/compact composition.

It does not own:

- feature records or query definitions;
- search meaning;
- filter vocabulary;
- business columns/actions;
- domain status meaning;
- backend pagination semantics;
- authorization or business availability.

The collection interaction contract is documented in:

```text
docs/product/collection-and-data-display-patterns.md
```

## Data access

The web application must not connect directly to PostgreSQL or duplicate backend persistence logic.

Future data access should cross an approved API/application boundary.

Server Components may perform server-side API communication, but being server-side does not make them owners of backend business rules.
