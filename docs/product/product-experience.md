# Manasiness Product Experience and Information Architecture

> **Status:** Active
> **Milestone:** M2 — Product Experience
> **Scope:** Manasiness V1
> **Issue:** [#55](https://github.com/SebastianVegaDev/manasiness/issues/55)
> **Purpose:** Define the product-experience principles, information architecture, route model, navigation model, and interaction posture that later Manasiness UI work must preserve.

---

## 1. Why this document exists

The M0 product vision defines Manasiness as an operating system for small businesses whose primary operator needs clarity, speed, confidence, and control.

M1 established the executable engineering platform but intentionally deferred product visual design and information architecture to M2.

This document closes that information-architecture gap before reusable components or feature screens begin to multiply.

It defines how Manasiness should be organized from the operator's point of view while preserving the domain boundaries already established internally.

This document is a product-experience contract.

It does **not** define:

- authentication or authorization behavior;
- Organization persistence or Membership behavior;
- database schemas;
- API contracts;
- business state machines;
- styling-library selection;
- component-library implementation;
- final visual identity;
- individual feature-screen layouts.

Those responsibilities remain with their owning milestones and issues.

---

## 2. Sources and decision hierarchy

This contract is grounded in:

- [`product-vision.md`](product-vision.md);
- [`legacy-audit.md`](legacy-audit.md);
- [`../domain/domain-map.md`](../domain/domain-map.md);
- [`../domain/ubiquitous-language.md`](../domain/ubiquitous-language.md);
- the owning domain documents under [`../domain/`](../domain/);
- [`../architecture/m1-engineering-platform.md`](../architecture/m1-engineering-platform.md);
- [`../architecture/cross-cutting-policies.md`](../architecture/cross-cutting-policies.md);
- accepted ADRs;
- the current repository and issue #55.

When a future UI decision conflicts with a product or domain invariant, the UI must adapt to the invariant rather than reinterpret the business model for convenience.

A navigation structure is not a domain model.

Likewise, a domain boundary does not automatically deserve a top-level navigation destination.

The product experience should expose the mental model that helps an operator complete real work while implementation continues to preserve explicit domain ownership underneath.

---

## 3. Product-experience principles

### 3.1 Optimize for daily operational work

Manasiness is primarily for small-business owners and small operational teams who use the product to understand and perform recurring business work.

The experience should optimize for:

- registering common operations quickly;
- scanning current operational state;
- finding records without reconstructing context manually;
- understanding what remains pending;
- reaching history when current state needs explanation;
- returning to frequent work without unnecessary administrative navigation.

Enterprise administration patterns must not dominate the ordinary operating experience.

---

### 3.2 Clarity before visual novelty

A user should be able to answer these questions quickly on every meaningful surface:

```text
Where am I?
What am I looking at?
What is the current state?
What can I do here?
What happened if something changed?
```

Visual treatment may evolve during M2, but it must strengthen hierarchy and comprehension rather than compete with them.

---

### 3.3 Fast recognition and low interaction cost

Repeated work should favor recognition over recall.

Important destinations, current location, filters, statuses, primary actions, and pending conditions should be visible where the operator needs them.

Common actions should not require traversing several unrelated layers merely because backend concepts are modeled separately.

---

### 3.4 Current state and history belong together

The product vision requires important state to remain explainable.

Product interfaces should therefore make current state easy to scan while preserving a clear path to relevant history.

For example, a current inventory quantity, receivable balance, or relationship status may be the first thing shown, but the experience must not make the historical explanation inaccessible.

The UI must not imply that a mutable current value is the only truth when the owning domain preserves historical facts.

---

### 3.5 Consequential actions are explicit

Destructive, corrective, irreversible, financially meaningful, or history-changing actions must not compete visually with ordinary frequent actions.

They should:

- use explicit action names;
- state consequences where necessary;
- distinguish reversible state changes from destructive behavior;
- avoid vague confirmations such as `Are you sure?` without context;
- preserve the correction/history semantics defined by the owning domain.

A generic `Edit` or `Delete` interaction must not be invented when the domain requires correction, cancellation, reversal, deactivation, or supersession instead.

---

### 3.6 UI states are part of the product

The following are first-class product states rather than incidental rendering details:

```text
loading
empty
zero search/filter results
success
recoverable error
unavailable
not found
permission-restricted later
background refresh later
```

A blank region is not an acceptable generic representation for all absence or failure states.

Each state should explain what is happening and, when a legitimate next action exists, make that action understandable.

---

### 3.7 Necessary complexity stays inside the product

Operators should not need to understand internal architecture terms in order to use Manasiness.

Examples:

- `Party` remains a useful canonical domain concept, but the primary navigation should communicate business relationships rather than expose an implementation-oriented party registry label without context;
- Membership and Identity remain distinct internally, but ordinary business navigation should not force users to reason about that distinction until they enter access/account management;
- receivables and payables remain explicit business concepts, but they do not each require independent global navigation if Finance can organize them coherently.

The product should simplify the user's mental workload without collapsing domain concepts that have different lifecycles.

---

### 3.8 Laptop-first does not mean desktop-only

A common laptop is an important operating surface for data-rich business work, but every shared experience must also remain usable on tablet and mobile widths.

Responsive behavior should preserve:

- orientation;
- access to primary actions;
- readable hierarchy;
- complete essential information;
- keyboard accessibility where a keyboard exists;
- usable touch targets where touch is expected.

A desktop sidebar compressed into an unusable narrow column is not a mobile navigation strategy.

---

### 3.9 Accessibility is product quality

Accessibility is part of correctness for the experience layer, not optional polish.

The shared product model must support:

- semantic landmarks and heading hierarchy;
- keyboard operation;
- visible focus;
- accessible names and descriptions;
- non-color-only status meaning;
- understandable errors and validation;
- reduced-motion compatibility where motion exists;
- reflow without losing essential information.

Issue #63 will establish repeatable quality gates, but earlier M2 work must not knowingly create structures that depend on inaccessible behavior.

---

### 3.10 The Web presents business capabilities; it does not redefine them

Routes, navigation, components, and presentation state do not own business invariants.

The Web continues to consume trusted application/API capabilities through the boundaries established in M1.

Navigation visibility may eventually reflect authorization for usability, but hidden navigation is never the authorization boundary.

---

## 4. V1 information architecture

### 4.1 Top-level product areas

Manasiness V1 uses the following product areas:

| Product area | Navigation role | Operator purpose |
| --- | --- | --- |
| Overview | Primary | Understand what needs attention and orient to the current Organization. |
| Sales | Primary | Register and inspect customer commercial transactions and their operational status. |
| Purchasing | Primary | Register and inspect supplier purchasing activity. |
| Catalog | Primary | Maintain the products and catalog information used by commercial workflows. |
| Inventory | Primary | Understand stock state, movement, adjustments, and inventory-related work. |
| Relationships | Primary | Find and understand customers, suppliers, and other meaningful business counterparties without exposing `Party` as unexplained UI jargon. |
| Finance | Primary | Understand payments, receivables, payables, expenses, cash movement, and other operational financial state. |
| Workforce | Primary | Manage worker relationships and workforce history separately from authentication access. |
| Reporting | Primary | Analyze operational information and trends across trusted domain data. |
| Operational Assistant | Persistent product utility | Ask questions or invoke supported capabilities through the same trusted application boundaries as other interfaces. |
| Organization Settings | Secondary | Configure Organization-scoped product settings and, later, Organization access/administration capabilities owned by M3+. |
| Identity / Account | Secondary | Manage the authenticated person's account/session concerns independently from Organization business data. |

These are product-level areas, not promises that every destination exists immediately after M2.

Unimplemented areas are not represented by fake screens.

---

### 4.2 Navigation grouping

The primary product navigation should group destinations by operator intent rather than present one undifferentiated list.

The conceptual grouping is:

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

The exact visual treatment belongs to later M2 work.

The grouping itself is durable unless product evidence demonstrates that another model is clearer.

---

### 4.3 Concepts that are not separate global destinations

Backend/domain separation must not automatically create global navigation.

The following concepts are subordinate to owning product areas unless later product evidence justifies promotion:

- Customer Relationship and Supplier Relationship are views within **Relationships**, not separate global applications;
- Party is an internal canonical concept and detail identity, not an unexplained global label;
- receivables, payables, payments, expenses, and cash movement belong under **Finance**;
- product categories and catalog attributes belong under **Catalog**;
- inventory movements, corrections, losses, damages, and adjustments belong under **Inventory**;
- Membership and permission management belong under Organization/access administration when M3 defines them;
- Identity/session/security settings belong under the account surface, not Organization Settings;
- quick-create actions are actions, not navigation destinations;
- history belongs with the owning entity or operation rather than in a generic global `History` section;
- technical readiness/health is operational engineering information, not a product destination.

---

### 4.4 Why Relationships and Workforce remain separate

`Party` is the shared representation of a real person or company with whom an Organization has a meaningful relationship.

Customer, Supplier, and Worker relationships do not have identical lifecycles.

The information architecture therefore keeps:

```text
Relationships
```

as the business-counterparty discovery and relationship surface, while:

```text
Workforce
```

remains a dedicated operational area for worker-specific lifecycle and workforce behavior.

A person who is both a Supplier and Worker must still represent one real-world Party internally where the domain requires it.

Navigation must not force duplicate business identities merely because the user enters them through different product areas.

---

### 4.5 Why the Operational Assistant is a utility rather than a domain

The Operational Assistant is an interface into trusted Manasiness capabilities.

It is not a source of business truth and does not own duplicate Sales, Inventory, Finance, or other business rules.

It therefore receives a persistent, easy-to-reach product entry point without being presented as another backend domain.

A full Assistant destination may exist for conversation/history when implemented, but supported commands and queries must continue to execute through the same application capabilities used elsewhere.

---

## 5. Application-shell mental model

The authenticated product shell is conceptually composed of four responsibilities:

```text
Organization context
        ↓
Primary navigation
        ↓
Page context and actions
        ↓
Owned feature content
```

Cross-cutting account and Organization controls remain shell concerns, while business content remains feature-owned.

The shell must provide orientation without becoming the owner of domain behavior.

---

## 6. Desktop navigation model

At desktop and common laptop widths, the intended model is a persistent product navigation region plus a primary content region.

### Navigation region

The navigation region should provide:

- Manasiness product identity;
- current Organization context;
- a future Organization-switcher control in a stable high-level location;
- grouped primary navigation;
- a persistent Operational Assistant entry point;
- Organization Settings as a secondary destination;
- Identity/account controls in a distinct account location;
- clear current-location indication.

Organization switching and account controls must be visually distinct because they change different contexts.

Changing Organization context is not the same action as changing the authenticated Identity or signing out.

### Content region

The content region should provide:

- page hierarchy/context;
- a clear page title;
- concise description when useful;
- the primary action for the current capability when one exists;
- contextual/secondary navigation owned by the current feature;
- the feature content itself.

The shell should not reserve large visual space for decorative product chrome at the expense of operational content.

---

## 7. Compact and mobile navigation model

Compact/mobile behavior must use the same information architecture but a different navigation presentation.

The conceptual model is:

- a compact application bar preserves current page and Organization orientation;
- an explicit navigation trigger opens the primary navigation in a modal/drawer-like surface;
- the opened navigation preserves the same grouping and ordering as desktop;
- current location remains indicated without relying only on color;
- opening, closing, and returning focus must be keyboard/screen-reader compatible;
- selecting a destination closes the navigation and moves the user to the selected page;
- essential navigation must not require hover;
- content scrolling must remain independent from the navigation overlay where appropriate;
- safe-area and viewport constraints must be respected on mobile devices.

A fixed bottom navigation is **not** the V1 default because the product has more high-value destinations than a small tab bar can represent without arbitrary prioritization.

If later product evidence identifies a genuinely small set of universal mobile actions, they may be added without replacing the canonical navigation model.

---

## 8. Primary and secondary navigation responsibilities

### Primary navigation

Primary navigation answers:

> Which major operational area do I want to work in?

It contains durable V1 product destinations.

Primary navigation must not contain:

- individual records;
- recent-history shortcuts that change unpredictably;
- temporary onboarding steps;
- modal commands;
- development-only routes;
- destinations that do not exist yet.

### Secondary navigation

Secondary navigation answers:

> Which sub-area or view inside the current capability do I want?

Examples may eventually include:

```text
Relationships
├── All relationships
├── Customers
└── Suppliers

Finance
├── Overview
├── Receivables
├── Payables
└── Expenses
```

These examples define information hierarchy, not required screen implementations for issue #55.

Feature-owned secondary navigation may use tabs, sub-navigation, or another accessible pattern when later UX issues justify the exact component.

---

## 9. Route model

### 9.1 Public and product namespaces

The route architecture must keep public/authentication concerns separate from Organization-scoped product work.

The intended conceptual structure is:

```text
public/authentication routes
        │
        └── M3-owned authentication flows

authenticated account routes
        │
        └── Identity/account concerns

Organization-scoped product routes
        │
        └── /app/[organizationId]/...
```

Next.js route groups may provide implementation composition boundaries without affecting URLs.

For example, later implementation may use conceptual groups such as:

```text
(public)
(product)
```

but issue #55 does not create route directories or authentication guards.

---

### 9.2 Organization scope is explicit in product URLs

Organization-scoped product URLs use an explicit Organization identifier:

```text
/app/[organizationId]/...
```

The `organizationId` is an opaque canonical entity identifier.

The UI and routing layer must not derive authorization, chronology, entity type, or business meaning from identifier bits.

An Organization identifier in a URL selects intended context; it does not prove Membership or authorization.

M3 must validate access through the owning authentication/authorization boundaries.

This explicit route scope provides several benefits:

- a copied product URL retains its intended Organization context;
- multi-Organization identities do not silently reinterpret a shared link using whichever Organization happened to be selected previously;
- browser history preserves Organization context;
- future switching behavior has a stable routing seam.

If a user cannot access the Organization named by a URL, M3 must handle that state safely rather than silently substituting another Organization and pretending the original link was satisfied.

---

### 9.3 Stable V1 route namespaces

The durable product namespaces are:

```text
/app/[organizationId]/overview
/app/[organizationId]/sales
/app/[organizationId]/purchasing
/app/[organizationId]/catalog
/app/[organizationId]/inventory
/app/[organizationId]/relationships
/app/[organizationId]/finance
/app/[organizationId]/workforce
/app/[organizationId]/reports
/app/[organizationId]/assistant
/app/[organizationId]/settings
```

The bare Organization product root:

```text
/app/[organizationId]
```

should resolve to the Organization's Overview once the shell is implemented.

User-facing navigation labels may be localized later, but route path segments remain stable and non-localized.

Bookmarks and links must not change merely because a user changes UI language.

---

### 9.4 Account routes remain outside Organization scope

Identity/account concerns are not Organization business settings.

Future account routes therefore live outside the Organization product namespace, conceptually:

```text
/account
/account/security
```

Exact account capabilities belong to M3 and later Identity work.

The important contract is that `/account` is Identity-scoped while `/app/[organizationId]/settings` is Organization-scoped.

---

### 9.5 List, detail, create, and edit semantics

Where a feature owns a collection and stable entity details, prefer predictable paths:

```text
collection
/app/[organizationId]/sales

detail
/app/[organizationId]/sales/[saleId]

creation when a dedicated page is justified
/app/[organizationId]/sales/new
```

`new` is reserved for creating a new business record through a capability that genuinely exists.

Use an `edit` route only when the owning domain defines the information as directly editable master/current data and a dedicated edit page is useful.

Do **not** infer this generic pattern:

```text
historical transaction
→ /edit
→ overwrite history
```

for records whose domain semantics require correction, cancellation, reversal, supersession, deactivation, or another explicit command.

Lifecycle actions belong in the owning detail/workflow context and must use domain-correct language.

---

### 9.6 Nested routes should represent hierarchy, not database joins

A nested URL is justified when it communicates stable user-visible hierarchy.

It is not justified merely because two tables reference each other.

For example:

```text
/relationships/[partyId]
```

can represent a stable relationship detail identity without forcing separate duplicate customer/supplier entity URLs when one Party participates in more than one relationship.

The exact subordinate views inside that detail remain owned by later domain/product issues.

---

## 10. Search, filter, sort, and pagination URL state

A user should be able to refresh, use Back/Forward, or share a collection view without unexpectedly losing meaningful navigational state.

Therefore, represent state in the URL when it materially changes **which records are being viewed** or **how the collection is navigated**.

Appropriate URL state includes, when applicable:

- text search;
- active filters;
- sort choice;
- a visible page number;
- another stable pagination position chosen by the feature;
- a navigational sub-view whose state is meaningful to revisit.

The exact filter and pagination mechanics remain feature-owned and are refined by issue #61.

### URL-state conventions

Use these principles:

- prefer semantic parameter names;
- use `q` as the normal text-search parameter when a feature has one primary free-text search;
- omit default values when omission has one unambiguous meaning;
- serialize multi-value filters deterministically;
- do not store sensitive information in query parameters;
- do not expose backend implementation details merely because an API uses them internally;
- do not make ephemeral interface state shareable by accident.

Ephemeral state should normally remain outside the URL, including:

```text
mobile navigation open/closed
temporary toast visibility
hover state
an unopened confirmation dialog
unsaved form values
focus state
```

If a domain later uses cursor pagination, the UI must not globally pretend that every feature has page-number semantics.

Conversely, backend cursor implementation must not prevent a feature from presenting a stable page-oriented UX if its owning API intentionally supports that contract.

---

## 11. Current-location and hierarchy behavior

### Current location

Every navigation presentation must communicate the active product area using more than color alone.

Later implementation should use the appropriate semantic state such as `aria-current` where applicable.

The product should not highlight multiple unrelated primary destinations simultaneously.

### Page hierarchy

Top-level destinations normally require a page title but not redundant breadcrumbs.

Breadcrumbs or another hierarchy indicator become useful when the user moves into deeper context such as:

```text
Relationships
→ relationship detail
→ history sub-view
```

or another multi-level structure where the parent context would otherwise become unclear.

Breadcrumbs must represent navigational hierarchy rather than reproduce every technical route segment.

---

## 12. Organization and Identity shell locations

### Organization context

The current Organization belongs near the product identity and primary navigation because it changes the business context of nearly every product destination.

The future Organization switcher should therefore occupy a stable, prominent shell location in both desktop and compact navigation.

It must not be hidden inside Organization Settings as if switching Organizations were an administrative edit.

### Organization Settings

Organization Settings is a secondary destination associated with the current Organization.

It may later contain Organization-scoped configuration and M3+ administration experiences, but issue #55 implements none of them.

### Identity / account controls

Identity/account controls belong in a separate account affordance, conventionally at the secondary edge of the shell rather than among business-domain destinations.

The account control is the future home for session/account actions such as profile/security/sign-out behavior.

It must not imply that an authenticated Identity is automatically a Worker or other Party relationship.

---

## 13. Unimplemented, unavailable, not-found, and restricted destinations

These states are different and must not be collapsed.

### Not yet implemented

If a capability has not been built:

- do not render it as a working navigation link;
- do not create a fake empty CRUD screen;
- do not populate it with fabricated business data;
- do not use a permanent `Coming soon` page as a substitute for an implemented capability.

During incremental M2/M3 development, the navigation should contain only real destinations.

The full information architecture remains documented here until each route exists legitimately.

### Temporarily unavailable

If an implemented destination exists but a real dependency is unavailable, preserve the destination and present an explicit unavailable/error state with a recovery action when recovery is meaningful.

### Not found

A nonexistent resource or route should produce an understandable not-found experience rather than silently redirecting the user to an unrelated destination.

When the user is already inside the product shell, the not-found experience should preserve enough shell context to recover safely when doing so does not violate security semantics.

### Permission restricted later

M3+ may hide capabilities the user cannot use in order to reduce confusion, but the backend/application authorization boundary remains authoritative.

The exact distinction between `not found` and `forbidden` for protected business resources must follow the owning security design and must not leak cross-Organization information.

---

## 14. Operational density and hierarchy

Manasiness should be data-rich without becoming visually cramped.

### Default posture

- prioritize useful business information over decorative whitespace;
- preserve clear grouping and readable line length;
- use space to communicate hierarchy, not simply to make pages look sparse;
- allow collection/table surfaces to use wider space than forms or prose-heavy detail sections;
- keep high-frequency controls near the content they affect;
- make current status easy to scan;
- keep secondary metadata available without competing with primary state.

Issue #56 owns the concrete spacing, typography, content-width, and control-size tokens.

This document defines the behavior those tokens must support.

---

## 15. Action hierarchy

A normal page should have a clear action hierarchy.

### Primary actions

Use prominent placement for the one action that best represents the common next step in the current context when such an action exists.

Examples may later include creating a sale, receiving a purchase, or adding a product, depending on the owning feature.

### Secondary actions

Less frequent but legitimate actions should remain discoverable without competing with the primary action.

### Consequential/destructive actions

Consequential actions should be visually secondary until intentionally invoked.

They should not be placed directly next to frequent safe actions in ways that increase accidental activation.

Confirmation requirements depend on the consequence and owning domain rather than on a global rule that every mutation requires a modal.

---

## 16. Collection and scanning posture

Legacy evidence showed that searchable collections, filters close to the data, active/inactive views, explicit empty states, detail history, and quick registration flows were valuable.

M2 preserves those product lessons without copying the legacy visual design.

Repeated collection workflows should support:

- search close to the collection it affects;
- visible active filters;
- predictable reset behavior;
- scannable statuses;
- explicit result counts or result context where useful;
- clear zero-result behavior distinct from a genuinely empty collection;
- direct access to meaningful detail/history;
- responsive alternatives when a desktop table cannot remain usable on a compact screen.

Issue #61 owns the reusable collection interaction implementation.

---

## 17. First-class common states

Every later feature should distinguish the state it is actually in.

| State | Product meaning |
| --- | --- |
| Loading | Data or capability is being obtained and useful content is not ready yet. |
| Background refresh | Existing trustworthy content remains visible while fresher data is requested. |
| Empty | The collection or history genuinely contains no records yet. |
| Zero results | Records may exist, but the current search/filter produced no matches. |
| Success | The requested operation completed; feedback should be proportionate to whether the resulting UI already makes success obvious. |
| Recoverable error | The operation/view failed and there is a meaningful retry or correction path. |
| Unavailable | The capability exists but cannot currently be used because a real dependency or prerequisite is unavailable. |
| Not found | The requested destination/resource does not exist or is intentionally presented as not found. |
| Restricted | A later authorization policy does not allow the Identity to use the capability; presentation must not replace enforcement. |

Issues #60–#62 define reusable implementation patterns for these states.

---

## 18. Responsive content behavior

Responsive design should change composition before it sacrifices comprehension.

Expected behavior includes:

- side-by-side regions may stack when width becomes insufficient;
- secondary metadata may move below primary information but should not disappear if essential;
- dense tables may transition to a compact list/card representation when horizontal compression would make them unusable;
- genuine wide tabular data may use controlled horizontal scrolling when that preserves meaning better than destructive reflow;
- primary actions must remain reachable;
- dialog/popover-like surfaces must remain within the viewport;
- localized labels must have room to expand without causing uncontrolled overflow.

The product must not depend on browser-width JavaScript when CSS/layout semantics can express the responsive behavior correctly.

---

## 19. Accessibility expectations for navigation and hierarchy

Later shell and primitive implementation must preserve at minimum:

- semantic `nav` and `main` landmarks where appropriate;
- a logical heading hierarchy;
- a keyboard-accessible route to main content;
- keyboard-operable navigation controls;
- visible focus;
- an accessible name and state for compact-navigation controls;
- focus containment and return for overlay navigation where applicable;
- status/current-location meaning that is not color-only;
- no hover-only essential actions;
- usable touch targets;
- content order that remains understandable after responsive reflow.

These are structural requirements before issue #63 adds automated and manual verification gates.

---

## 20. Product copy and route language

User-facing copy should use the language and tone conventions established by issue #58.

Route path segments, however, are technical navigation identifiers and remain stable rather than being translated per UI locale.

This separation prevents:

- bookmarks changing with locale;
- links becoming invalid after a language change;
- route logic becoming coupled to translation catalogs.

User-facing labels may be localized independently from route slugs.

---

## 21. Ownership boundaries

### Shell owns

The application shell owns composition responsibilities such as:

- product identity;
- Organization-context placement;
- primary navigation;
- account-control placement;
- global page-content region;
- shared orientation behavior.

### Features own

Feature areas own:

- their business-facing pages;
- feature queries and mutations;
- columns and filters;
- detail composition;
- capability-specific actions;
- domain-specific status and error meaning;
- feature-owned secondary navigation.

### Platform UI owns later

The reusable UI layer created during M2 may own generic visual/interaction primitives, but it must not own Sales, Inventory, Finance, Party, or other business semantics.

### Backend/application remains authoritative

The Web must continue to use the established API/application boundaries.

No route, navigation item, button visibility rule, or client cache becomes canonical business state or security enforcement.

---

## 22. Development behavior while the product is incomplete

M2 and later milestones will implement the product incrementally.

During that period:

```text
documented IA
≠
permission to create fake routes
```

The product should expose only destinations that provide real behavior.

A contributor may use development-only fixtures or test routes when an owning issue explicitly needs them, but such surfaces must not masquerade as shipped business capabilities.

The M1 Web → API readiness surface may remain available as an engineering aid until issue #59 gives it an intentional non-product location.

It must not become a permanent business navigation destination.

---

## 23. Decisions intentionally deferred to later M2 work

This document deliberately does not decide:

- the styling mechanism or Tailwind adoption (#56);
- brand colors, typography, spacing values, shadows, and theme implementation (#56);
- the exact reusable primitive set (#57);
- localization library and message-catalog mechanics (#58);
- shell component implementation and exact responsive breakpoints (#59);
- form-state library or validation component APIs (#60);
- collection component architecture and pagination implementation (#61);
- toast/alert implementation details (#62);
- automated accessibility tooling and viewport matrix (#63);
- visual-regression baseline mechanics (#64).

Those issues must implement within the product and navigation contract established here rather than reopening the IA independently feature by feature.

---

## 24. M3 handoff seams

M3 may add real Identity, Organization, Membership, authentication, and authorization behavior through the seams defined here:

```text
public/authentication route group
        ↓
authenticated account surface
        ↓
Organization-scoped /app/[organizationId] product shell
        ↓
Organization switcher slot
        ↓
Identity/account control slot
        ↓
permission-aware navigation presentation
```

M3 must not reinterpret these seams as permission enforcement by presentation alone.

Organization access remains an application/security responsibility and Organization tenant isolation remains independently enforced in persistence.

---

## 25. Acceptance-criteria mapping

Issue #55 is satisfied by this contract as follows:

- M2 product-experience principles are defined in sections 3 and 14–19;
- V1 top-level information architecture is defined in section 4;
- primary and secondary navigation responsibilities are defined in sections 4 and 8;
- desktop and compact/mobile navigation behavior is defined in sections 6 and 7;
- Organization and Identity control locations are defined in section 12;
- route naming/grouping conventions are defined in section 9;
- search/filter/sort/pagination URL-state expectations are defined in section 10;
- density, hierarchy, destructive-action posture, and common states are defined in sections 14–17;
- M3 and domain persistence remain explicitly outside this issue in sections 1, 21, 23, and 24;
- fake CRUD screens and empty domain routes are explicitly prohibited in sections 13 and 22.

---

## 26. Durable contract

The central product-experience contract is:

> Manasiness organizes the product around the operator's real work, keeps Organization context explicit, preserves domain-correct language and history, exposes only real capabilities, and provides stable navigation and URLs without moving business rules or authorization into the Web shell.

Later feature work may refine local workflows.

It should not reinvent the global information architecture independently unless new product evidence requires this contract to be changed deliberately.
