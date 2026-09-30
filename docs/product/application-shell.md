# Manasiness Application Shell

> **Status:** Active  
> **Milestone:** M2 — Product Experience  
> **Issue:** [#59](https://github.com/SebastianVegaDev/manasiness/issues/59)  
> **Scope:** Application chrome, responsive navigation, page composition, route seams, and M3 handoff points.

## Purpose

This document records the implemented M2 shell contract.

The information architecture remains governed by [`product-experience.md`](product-experience.md). The visual system remains governed by [`visual-foundation.md`](visual-foundation.md). Localization/copy behavior remains governed by [`localization-and-copy.md`](localization-and-copy.md).

The shell implements those contracts without becoming a business domain or authentication layer.

## Ownership

Runtime shell code lives under:

```text
apps/web/src/platform/shell/
```

It owns:

- product identity and orientation;
- primary navigation composition;
- current-location presentation;
- responsive desktop/compact navigation behavior;
- Organization and Identity/account extension slots;
- the main landmark and skip-to-content entry;
- reusable page containers, headers, actions, sections, and breadcrumb composition.

It does not own:

- sessions or authentication;
- Membership or permission enforcement;
- Organization persistence/display data;
- feature queries or commands;
- domain-specific secondary navigation;
- domain-specific state vocabulary.

## Route composition

M2 establishes:

```text
/
/app/[organizationId]
/app/[organizationId]/overview
/foundation
```

The root route is an intentionally unscoped M2 product-experience surface. It exists before M3 owns unauthenticated entry and Organization selection.

The Organization-scoped route is implemented through an App Router route group:

```text
app/(product)/app/[organizationId]/...
```

The `(product)` segment is organizational and does not appear in the URL.

The bare Organization URL redirects to its overview:

```text
/app/[organizationId]
    ↓
/app/[organizationId]/overview
```

The `organizationId` remains opaque. M2 uses it only to preserve route context and never interprets identifier bits as authorization, chronology, entity type, or business state.

M3 must validate whether the authenticated Identity has an appropriate Membership for the Organization named by the URL.

## Navigation availability

The #55 information architecture remains visible enough to communicate the durable product model, but M2 does not create working links for capabilities that do not exist.

Current behavior is:

```text
Overview                 working destination
Sales                    unavailable item
Purchasing               unavailable item
Catalog                  unavailable item
Inventory                unavailable item
Relationships            unavailable item
Workforce                unavailable item
Finance                  unavailable item
Reporting                unavailable item
Operational Assistant    unavailable item
Organization Settings    unavailable item
```

Unavailable items have explicit visible status and no `href`.

This avoids both extremes:

- hiding the intended product map so the shell cannot be evaluated; and
- creating fake CRUD routes simply to make navigation look complete.

Later feature milestones must turn a destination into a link only when a real route/capability exists.

## Desktop model

At `64rem` and above, the shell uses a persistent navigation region plus a content region.

The navigation region contains:

- Manasiness brand identity;
- Organization context slot;
- grouped primary navigation;
- Organization Settings seam;
- Identity/account seam.

The sidebar is independently scrollable and remains within the viewport.

Operational content keeps its own width contract through `PageContainer` rather than stretching to fill every wide monitor.

## Compact/mobile model

Below `64rem`, the persistent sidebar becomes a compact sticky application bar.

The bar preserves:

- brand identity;
- current page orientation;
- an explicit navigation trigger.

The trigger opens navigation through the shared #57 `Dialog` primitive. This preserves native modal behavior, Escape handling, focus containment, and return focus rather than reimplementing a second overlay/focus system inside the shell.

The dialog contains the same information architecture and ordering as desktop.

Safe-area insets are respected at the compact application bar and navigation surface.

## Page composition

`page-layout.tsx` intentionally exposes small compositional pieces rather than one business-aware mega-layout:

```text
PageContainer
PageHeader
PageHeading
PageEyebrow
PageTitle
PageDescription
PageActions
PageSection
Breadcrumbs
```

Copy remains consumer-owned. For example, `Breadcrumbs` requires its localized accessible label rather than injecting English wording.

Feature screens remain free to compose only the pieces they need.

## Organization and account seams

The shell exposes stable DOM/component locations for M3:

```text
data-shell-slot="organization-switcher"
data-shell-slot="identity-account-menu"
```

They are currently non-interactive presentation seams.

The Organization slot may show the shortened opaque identifier when the URL already supplies one so the user can distinguish route context without Manasiness inventing an Organization name.

M3 should replace the temporary context copy with trusted Organization display data and real switching behavior.

The account seam contains no fake Identity name/avatar/session behavior.

## Engineering foundation route

M1 readiness and primitive diagnostics now live at:

```text
/foundation
```

This route is not present in product navigation.

It remains useful for engineering/browser smoke coverage while no longer presenting API readiness or primitive diagnostics as user-facing product capabilities.

## Accessibility contract

The shell currently guarantees:

- semantic `nav` and `main` landmarks;
- a keyboard-reachable skip link;
- `aria-current="page"` on the active working destination;
- visible text for unavailable destinations;
- an accessible compact-navigation trigger and dialog;
- Escape close and focus return through the shared dialog primitive;
- no hover-only essential navigation;
- touch-target sizing based on the visual foundation;
- reduced-motion behavior inherited from global styling.

Issue #63 will add automated accessibility scanning and broader keyboard/reflow gates.

## M3 handoff

M3 may add an authenticated product boundary above the existing Organization layout without changing product URLs.

M3 owns:

- login/registration/recovery routes;
- authenticated entry routing;
- Organization selection/creation;
- Membership validation for route-scoped Organization IDs;
- Organization display name and switcher behavior;
- Identity/account menu behavior;
- permission-aware navigation visibility;
- unauthorized/not-accessible states.

Navigation visibility remains usability behavior, not authorization enforcement.
