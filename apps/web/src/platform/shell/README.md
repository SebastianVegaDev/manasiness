# Web Application Shell

`platform/shell/` owns product chrome and reusable page composition for the Manasiness Web application.

It is governed by:

- `docs/product/product-experience.md`;
- `docs/product/visual-foundation.md`;
- `docs/product/localization-and-copy.md`;
- `docs/product/application-shell.md`.

## Responsibilities

The shell owns:

- product/brand orientation;
- primary navigation composition;
- current-location presentation;
- compact/mobile navigation state;
- the future Organization switcher slot;
- the future Identity/account slot;
- the main-content landmark and skip link;
- reusable page-layout composition such as page containers, headings, actions, sections, and breadcrumbs.

The shell does **not** own:

- authentication or sessions;
- Organization persistence or Membership validation;
- permission enforcement;
- business-domain routes, queries, commands, or state;
- feature-specific secondary navigation;
- product-domain empty/loading/error semantics.

## Server/client boundary

`ApplicationShell` remains a Server Component.

`ApplicationNavigation` is the narrow Client Component boundary because it needs:

- the current pathname;
- compact-navigation open/close state;
- localized client-side navigation copy.

Feature content is passed through the shell as Server Component children and is not converted into client state merely because navigation is interactive.

## Route structure

M2 establishes the Organization-scoped composition seam:

```text
app/(product)/app/[organizationId]/layout.tsx
app/(product)/app/[organizationId]/page.tsx
app/(product)/app/[organizationId]/overview/page.tsx
```

The route group does not change the public URL.

The bare Organization route redirects to:

```text
/app/[organizationId]/overview
```

M2 does not validate whether the identifier belongs to an accessible Organization. M3 must add the authenticated boundary, Membership validation, and Organization display data without changing the shell contract.

## Availability

Only a destination backed by a real implemented capability may be rendered as a working navigation link.

The M2 shell shows the durable #55 information architecture, but unfinished destinations are static unavailable items with explicit copy. They do not point at fake CRUD pages.

## Engineering surface

The M1 health/primitive diagnostics moved to:

```text
/foundation
```

That route is intentionally absent from product navigation. It exists as an engineering surface and must not be treated as a business capability.
