# M2 Product Experience Readiness

> **Status:** Ready for M3 after the Issue #65 readiness PR is green  
> **Milestone:** M2 — Product Experience Foundation  
> **Issue:** [#65](https://github.com/SebastianVegaDev/manasiness/issues/65)  
> **Baseline entering the readiness pass:** `main@9350fb798290399c5ccbd1f0b618e525a9fc986e`

## Purpose

This record closes M2 as one integrated product-experience foundation rather than as a collection of individually completed UI issues.

It summarizes the durable baseline established by Issues #55–#64, the architecture and quality review performed for #65, the extension points M3 should consume, and the behavior that remains intentionally deferred.

This document is an exit record, not a replacement for the owning product documents. Detailed contracts remain in the documents indexed by [`README.md`](README.md).

## Readiness conclusion

M2 is ready to be treated as shared product infrastructure for M3 when the #65 pull request passes the repository quality gates.

The review found no blocking product-experience or Web/backend ownership violation.

Two documentation inconsistencies required reconciliation during the exit pass:

1. `apps/web/README.md` still described product-experience work as future work from the M1 perspective;
2. the styling/theme ADR reused identifier `0014`, which was already owned by the M1 Web API client/server-state ADR.

The Web README is reconciled with the implemented M2 baseline. The duplicate styling/theme ADR is renumbered to `0017`, the next unused identifier, without changing its accepted architectural decision. Existing accepted ADRs `0015` and `0016` retain their identities.

## Integrated experience map

The durable V1 product map remains:

```text
Operate
├── Overview
├── Sales
└── Purchasing

Manage
├── Catalog
├── Inventory
├── Relationships
└── Workforce

Understand
├── Finance
└── Reporting

Persistent utility
└── Operational Assistant

Secondary shell controls
├── Organization switcher
├── Organization Settings
└── Identity / Account
```

M2 implements the application shell and a real `Overview` destination only.

Later business areas remain visibly unavailable rather than linking to fake CRUD/product screens. A destination becomes navigable only when its owning capability and route actually exist.

The stable Organization-scoped route contract remains:

```text
/app/[organizationId]/...
```

with:

```text
/app/[organizationId]
    ↓
/app/[organizationId]/overview
```

The URL carries intended Organization context. It does not prove Membership, authorization, or tenant access. M3 must validate those concerns explicitly.

The `/foundation` route remains an engineering fixture for shared M2 behavior and browser validation. It is not part of product navigation and must not become a substitute for feature-owned screens.

## Shared Web ownership baseline

M2 leaves reusable responsibilities with explicit owners:

| Responsibility | Owner |
| --- | --- |
| HTTP transport and structured API failures | `apps/web/src/platform/api/` |
| Browser server-state infrastructure | `apps/web/src/platform/query/` |
| Semantic visual tokens | `apps/web/src/platform/styling/` |
| Presentation theme initialization | `apps/web/src/platform/theme/` |
| UI locale, messages, presentation formatting | `apps/web/src/platform/i18n/` |
| Domain-neutral interaction primitives | `apps/web/src/platform/ui/` |
| Application shell and page composition | `apps/web/src/platform/shell/` |
| Domain-neutral form composition | `apps/web/src/platform/forms/` |
| Domain-neutral collection composition | `apps/web/src/platform/collections/` |
| Domain-neutral feedback/confirmation composition | `apps/web/src/platform/feedback/` |
| Product/business UI and feature queries/commands | `apps/web/src/features/<feature>/` when introduced |

These boundaries are intentionally not a generic shared-code layer.

The final Web tree contains no top-level `components/`, `common/`, or `utils/` dumping ground. Shared code is grouped by responsibility.

## Architecture conformance

The #65 review confirmed the following baseline.

### Web/backend boundary

Web code does not import database or NestJS implementation internals.

The canonical direction remains:

```text
route / component / feature
        ↓
feature query or command
        ↓
Web API client
        ↓
shared transport contract
        ↓
NestJS API/application capability
```

Raw backend `fetch()` conventions have not proliferated outside the owned transport boundary.

`@manasiness/contracts` may be shared across API and Web. `@manasiness/database`, controllers, services, repositories, and backend implementation modules remain outside the Web dependency graph.

### Business ownership

`platform/ui`, `platform/forms`, `platform/collections`, `platform/feedback`, and `platform/i18n` remain domain-neutral.

They do not own:

- business invariants;
- authorization decisions;
- domain status vocabularies;
- feature commands;
- Organization currency/timezone policy;
- tax/accounting behavior;
- canonical business state.

TanStack Query remains remote/server-state infrastructure. Its cache is not business truth.

### Server and Client Components

Interactive behavior remains isolated to the smallest useful Client Component boundary.

M2 does not turn the entire application shell or route tree into one global Client Component merely to support menus, dialogs, theme, localization, or feedback.

### No fake M3 model

M2 contains no real session, Membership, permission, Identity, Organization persistence, or authorization model.

The shell exposes presentation seams for future authenticated data without fabricating user names, Organization names, memberships, or permission outcomes.

## Visual and interaction baseline

The shared experience is governed by semantic tokens rather than feature-local palettes.

The current styling contract uses:

```text
semantic CSS custom properties
+
global reset/base rules
+
CSS Modules for local composition
```

Supported presentation themes are:

```text
system
light
dark
```

Theme preference remains presentation state. It is not Organization configuration, Membership state, or authorization state.

The shared primitive layer remains native-first and source-owned. Complex dependencies are introduced only when a real requirement exceeds the current native/shared boundary.

Representative M2 composition covers:

- form validation and pending/error treatment;
- search/filter/pagination URL state;
- collection loading, refresh, empty, zero-result, error, and unavailable states;
- success/warning/error feedback;
- request-ID presentation for structured failures;
- transient notifications;
- menus and dialogs;
- consequential/destructive confirmation.

Feature/domain wording and business consequences remain consumer-owned.

## Localization baseline

Initial UI locales are:

```text
en-US
es-PE
```

with explicit fallback:

```text
en-US
```

Presentation locale does not participate in product route identity.

M2 does not infer Organization currency, timezone, country, tax behavior, or authorization from UI language, and it does not infer UI language from those business settings.

Authenticated language preference persistence remains an M3/later integration concern.

## Accessibility and responsive baseline

Reusable M2 surfaces target applicable WCAG 2.2 AA success criteria as an engineering baseline, not as a certification claim.

The automated Browser E2E gate covers representative:

- axe scanning without rule exclusions for the owned baseline;
- landmarks and headings;
- skip navigation;
- keyboard traversal;
- menu/dialog focus movement and return;
- form labels and error relationships;
- compact/mobile navigation;
- collection interaction;
- destructive confirmation;
- reduced-motion behavior;
- page overflow/reflow;
- Spanish copy at compact width;
- 200% text enlargement.

The stable viewport matrix is:

| Viewport | Size | Expected shell |
| --- | --- | --- |
| Small mobile | `320 × 568` | Compact |
| Large mobile | `390 × 844` | Compact |
| Tablet | `768 × 1024` | Compact |
| Compact laptop | `1024 × 768` | Desktop |
| Standard desktop | `1280 × 800` | Desktop |
| Wide desktop | `1440 × 900` | Desktop |

The #65 review confirms the automated evidence and the source-level accessibility contract. It does **not** claim formal accessibility certification or an exhaustive assistive-technology audit. Every future real feature screen still requires the manual keyboard, screen-reader, zoom/reflow, contrast, touch-target, and reduced-motion review defined in [`accessibility-and-responsive-quality.md`](accessibility-and-responsive-quality.md).

## Visual-regression baseline

M2 protects ten deliberate canonical images through Playwright on the repository's Linux baseline:

```text
Ubuntu 24.04
Playwright-managed Chromium
```

Coverage includes:

- desktop shell, light;
- wide shell, dark;
- compact shell, navigation closed;
- compact shell, navigation open;
- invalid form;
- collection empty;
- collection loading;
- success feedback;
- structured internal error;
- irreversible confirmation.

The comparison policy remains strict. Normal pull-request CI compares committed snapshots and never updates them automatically.

Intentional baseline regeneration is a separate manual workflow that produces an artifact for human inspection. Snapshot generation is not snapshot approval.

Visual failure diagnostics remain available through the existing Playwright report and test-result artifacts.

## M3 handoff

M3 should extend the existing product shell rather than replace it.

### Authenticated application boundary

The current product route group and Organization-scoped layout provide the insertion point for an authenticated boundary around:

```text
/app/[organizationId]/...
```

M3 owns login, registration, recovery, authenticated entry, session resolution, and access failure behavior.

### Organization selection and validation

M3 owns:

- Organization creation/selection;
- resolving trusted Organization display data;
- validating Membership for the Organization in the URL;
- real Organization switching;
- unauthorized/not-accessible outcomes.

The shell exposes:

```text
data-shell-slot="organization-switcher"
```

as the stable composition location. The route Organization ID remains context, not authorization proof.

### Identity/account controls

The shell exposes:

```text
data-shell-slot="identity-account-menu"
```

for authenticated Identity/account behavior.

M3 may replace the non-interactive seam with trusted Identity/account actions without moving session or authorization logic into the shell primitive itself.

### Membership-aware navigation

M3 may filter or annotate navigation according to resolved Membership/permissions.

That visibility is a usability layer only. Backend/application authorization remains authoritative even when an item is hidden or disabled in the UI.

### Request-bound server API access

When server-rendered authenticated work needs session context, M3 should use the existing server API-client seam and explicitly propagate only the required request context. It should not duplicate a second API or forward arbitrary request headers.

### Preferences

Authenticated preference integration may extend the existing theme/locale presentation seams, but Organization business settings remain separate from Identity presentation preferences.

## Intentional deferrals after M2

M2 intentionally does not implement:

- authentication or session persistence;
- Identity registration/recovery/account behavior;
- Membership or permission enforcement;
- Organization persistence, creation, selection, or real switching;
- Parties, Sales, Purchasing, Catalog, Inventory, Finance, Workforce, Reporting, or Assistant business screens;
- feature-owned message catalogs beyond real consumers;
- speculative combobox, generic popover, tabs, tooltip, date picker, or data-table primitives;
- marketing-site design;
- production deployment/hardening;
- formal accessibility certification;
- automatic visual-baseline acceptance.

These are ownership boundaries, not unfinished placeholders that M2 should fill speculatively.

## Documentation review

The #65 pass reviewed:

```text
AGENTS.md
apps/web/README.md
apps/web/src/platform/README.md
docs/product/* M2 contracts
docs/adr/* M2 decisions
Browser E2E accessibility/responsive guidance
visual-regression guidance
```

`AGENTS.md` remains compatible with the final M2 implementation and requires no readiness-specific rule change.

The product documents remain the source of truth for their individual concerns. This exit record only connects them and records the M3 boundary.

## Validation contract for the readiness PR

The #65 pull request must pass the repository-pinned clean CI path including:

```text
frozen dependency install
format check
lint
typecheck
production build
unit / integration / API tests
database migration validation
Browser E2E
accessibility / responsive Browser E2E
visual regression
```

CI success on the final #65 head is the execution evidence for the M2 exit gate.

Do not mark this record final if those gates are not green.

## Exit criteria

M2 may close when the #65 PR demonstrates all of the following:

- Issues #55–#64 are complete;
- the product map and route contract remain coherent;
- unavailable domains are not fake working screens;
- visual tokens/themes and shared patterns compose coherently;
- browser, accessibility/responsive, and visual-regression checks pass together;
- Web ownership and backend boundaries remain intact;
- no M3 authentication/Organization behavior leaked into M2;
- M3 extension points are explicit;
- documentation matches the implemented foundation;
- the readiness PR is fully green.

At that point, M2 is a stable baseline for M3 and later feature milestones rather than a promise to freeze UI architecture permanently. Future changes remain possible, but they must be justified by their owning product/domain requirement and preserve the source-of-truth hierarchy.
