# Manasiness Web

`@manasiness/web` is the Next.js web runtime for Manasiness.

M1 establishes the engineering platform. Product information architecture, branding, navigation, localization behavior, and reusable UI-system decisions remain M2 responsibilities.

## Runtime

The application uses:

- Node.js 24;
- Next.js 16;
- React 19;
- TypeScript;
- App Router;
- Zod for runtime configuration validation.

## Local development

Create the local environment file:

```powershell
Copy-Item apps/web/.env.example apps/web/.env
```

Then run:

```powershell
pnpm --filter @manasiness/web dev
```

The default development address is:

```text
http://localhost:3000
```

## Configuration boundaries

The web application has two different configuration surfaces.

### Server-only runtime configuration

Server configuration includes:

```text
APP_ENV
WEB_API_ORIGIN
```

`WEB_API_ORIGIN` is available only to server-side code.

It may eventually point to an internal/private API address that must never be sent to browser JavaScript.

Server runtime configuration is validated when the Next.js Node server starts.

### Browser-safe build configuration

Browser-visible configuration is explicitly allowlisted.

The current public contract contains:

```text
NEXT_PUBLIC_API_ORIGIN
```

Values using `NEXT_PUBLIC_*` are incorporated into browser JavaScript during `next build`.

They must therefore:

- contain no credentials;
- contain no secret tokens;
- contain no private service addresses;
- be treated as public information.

The public API origin may differ from the server API origin.

Example:

```text
WEB_API_ORIGIN=http://api.internal:3001
NEXT_PUBLIC_API_ORIGIN=https://api.example.com
```

## Environment access

Feature code must not read arbitrary environment variables.

Server configuration belongs under:

```text
src/platform/environment/
```

Server-only modules use:

```typescript
import 'server-only';
```

Browser-safe configuration is exposed through the explicit public environment boundary.

Do not create ad hoc `process.env` reads in routes, features, components, or hooks.

## API boundary

The web application does not connect directly to PostgreSQL.

Both browser-side and server-side requests eventually communicate through approved API/application boundaries.

The distinction between:

```text
WEB_API_ORIGIN
```

and:

```text
NEXT_PUBLIC_API_ORIGIN
```

exists because the Next.js server and the browser may have different network views of the API.

## Testing configuration

Environment parsers receive explicit environment objects.

Tests should use:

```text
test/support/web-environment.ts
```

rather than mutating global `process.env`.

## Source layout

```text
src/
    app/
        # App Router route composition

    features/
        # Future concrete product-facing capabilities

    platform/
        environment/
        # Other technical infrastructure
```

`app/` is not the default home for all reusable code.

`features/` receives capabilities when real UX gives them ownership.

`platform/` contains technical infrastructure and must not become a generic shared-code directory.

## Commands

Development:

```powershell
pnpm --filter @manasiness/web dev
```

Build:

```powershell
pnpm --filter @manasiness/web build
```

Production start:

```powershell
pnpm --filter @manasiness/web start
```

Typecheck:

```powershell
pnpm --filter @manasiness/web typecheck
```

Lint:

```powershell
pnpm --filter @manasiness/web lint
```

## UI scope

M1 still does not establish:

```text
Tailwind
shadcn/ui
brand assets
theme tokens
navigation architecture
dashboard layout
authentication screens
component library
```

Those remain product/UI decisions for M2.