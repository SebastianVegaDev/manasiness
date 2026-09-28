# Web Platform

`platform/` contains technical capabilities required by the web application that are not owned by a product feature.

Examples may eventually include:

- runtime environment access;
- API transport infrastructure;
- observability integration;
- browser/runtime adapters;
- framework integration boundaries.

Platform code must not become a generic location for business behavior.

Business rules remain owned by the backend/domain capabilities that define them.

## Server and client boundaries

Next.js modules may execute in different runtime contexts.

Code that handles secrets, privileged credentials, or server-only infrastructure must remain explicitly server-only.

Use:

```typescript
import 'server-only';
```

for modules that must never enter a Client Component dependency graph.

Do not expose a value through `NEXT_PUBLIC_*` unless it is intentionally public.

## Environment configuration

The current environment boundary is intentionally minimal.

Issue #27 owns the complete typed runtime-configuration strategy.

Until then, new environment access should not be scattered throughout route components.

## Data access

The web application must not connect directly to PostgreSQL or duplicate backend persistence logic.

Future data access should cross an approved API/application boundary.

Server Components are allowed to perform server-side application/API communication, but being server-side does not make them owners of backend business rules.