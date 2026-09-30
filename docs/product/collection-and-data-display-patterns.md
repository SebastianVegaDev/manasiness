# Collection and Data-Display Interaction Patterns

> **Status:** Active  
> **Milestone:** M2 — Product Experience Foundation  
> **Issue:** [#61](https://github.com/SebastianVegaDev/manasiness/issues/61)  
> **Scope:** Operational collection composition, search/filter URL state, pagination presentation, responsive data display, and collection-specific async/absence states.

## 1. Purpose

Manasiness will repeatedly present operational collections: products, relationships, transactions, movements, workers, receivables, and other feature-owned records.

Those features need a consistent interaction posture without turning the Web platform into a universal business data-grid or CRUD framework.

This document defines the reusable collection contract before real domain screens multiply.

It does **not** define:

- backend search algorithms;
- a shared business query model;
- domain columns or filters;
- Product, Party, Sale, Inventory, or other business screens;
- offset, cursor, or continuation-token semantics;
- bulk editing;
- export/CSV behavior.

## 2. Ownership

The reusable boundary lives at:

```text
apps/web/src/platform/collections/
```

Responsibilities remain split deliberately:

```text
platform/ui
    primitive controls and visual semantics

platform/collections
    collection-page composition
    URL-state transformation helpers
    toolbar layout
    collection pagination presentation
    collection-specific loading/absence/error presentation
    semantic table frame
    responsive table/compact composition

feature code
    records and server-state query definitions
    query keys and invalidation
    search meaning
    filter vocabulary
    columns and compact fields
    status business meaning
    row/item actions
    backend pagination contract
    permission/business availability meaning
```

The reusable layer composes interaction structure. It does not become the owner of feature semantics.

A future `CustomerTable`, `InventoryMovementList`, or `SalesFilters` therefore belongs with its feature even if it composes the shared collection boundary.

## 3. Canonical collection-page composition

A normal operational collection should make these responsibilities recognizable:

```text
page context / title / primary action
        ↓
collection toolbar
    search
    filters
    result/status summary
        ↓
collection body
    tabular or compact representation
        ↓
pagination / continuation navigation
        ↓
collection-specific absence or recovery state when required
```

Not every screen must visibly render every region. A collection with no meaningful filters should not invent filters just to match a template.

The point is stable responsibility, not visual ceremony.

## 4. Search behavior

### 4.1 Default: explicit search for server-backed operational collections

The M2 default is explicit search submission.

The operator may type without immediately changing the viewed server result. Search is applied when they submit the search intent, normally with Enter or an explicit Search action.

Reasons:

- server-backed search may be non-trivial;
- explicit submission avoids one remote request per keystroke by default;
- URL/history changes represent deliberate view changes;
- keyboard behavior is predictable;
- later feature APIs remain free to choose appropriate query semantics.

This is a default, not a prohibition on debounce.

A feature may use debounced search when concrete evidence shows that:

- the search is cheap enough;
- intermediate queries are useful rather than noisy;
- cancellation/stale-result behavior is handled correctly;
- the behavior materially improves the workflow.

Do not create a product-wide debounce interval before a real consumer needs one.

### 4.2 Search URL key

The conventional free-text query parameter is:

```text
q
```

Example:

```text
/app/<organizationId>/relationships?q=acme
```

Route segments remain stable and non-localized.

### 4.3 Clearing search

Clearing an applied search removes `q` from the URL rather than serializing an empty string.

Changing or clearing search normally resets feature-owned pagination state because the previous pagination position may no longer exist in the new result set.

### 4.4 Search and focus

Submitting search should not arbitrarily move focus when the resulting page remains understandable.

If route navigation remounts the surface, later feature work should preserve a sensible orientation/focus strategy rather than forcing focus to the first row after every query.

## 5. Filter behavior

Simple filters whose selection fully expresses intent may apply immediately.

Examples include a single status filter or a small mutually-exclusive view selector.

The shared foundation does not define every future filter control. A feature may later need menus, multi-select, date ranges, or domain-specific selectors.

### 5.1 Active state

Applied filters must remain visible and understandable from the controls themselves or a concise active-filter summary.

Do not hide meaningful active filters only inside a closed menu with no external indication.

### 5.2 URL state

Shareable filters belong in the URL when they materially change which records are shown.

Defaults should be omitted when the URL remains unambiguous.

For example, if `status=all` is the canonical default:

```text
/app/<organizationId>/inventory
```

is preferred to:

```text
/app/<organizationId>/inventory?status=all
```

A non-default view may use:

```text
/app/<organizationId>/inventory?status=attention
```

### 5.3 Multi-value filters

When a future feature needs a multi-value filter, serialization must be deterministic and feature-owned.

Do not introduce a global encoding convention until there is a concrete consumer whose semantics can be evaluated.

## 6. URL-state helper boundary

`collection-url-state.ts` provides pure transformation helpers for collection query strings.

It supports:

- preserving unrelated query parameters;
- setting meaningful collection state;
- removing cleared values;
- omitting configured defaults;
- resetting pagination keys when search/filter state changes;
- constructing a route href without coupling to Next.js router hooks.

The helper deliberately does **not** define:

- which filters a feature has;
- which page/cursor key a feature uses;
- whether a value is authorized or business-valid;
- backend query syntax.

That information remains feature-owned.

## 7. Pagination

### 7.1 Product default

Explicit paginated navigation is the V1 default for ordinary operational lists when a collection cannot reasonably be displayed as one bounded result set.

This preserves:

- stable navigation intent;
- understandable back/forward behavior;
- shareable location where the backend contract permits it;
- deliberate scanning instead of an endless scroll surface.

Infinite scroll is not the default. A future workflow may justify it when sequential exploration is genuinely more useful than stable list location.

### 7.2 Backend semantics stay feature-owned

M2 does not choose globally between:

```text
page number
offset / limit
cursor
continuation token
```

`CollectionPagination` receives opaque `previousHref` and `nextHref` values plus presentation copy.

The feature creates those hrefs from its API/query semantics.

This keeps a future cursor-backed endpoint from being forced through a fake page-number abstraction.

### 7.3 Pagination and URL reset

When search/filter state materially changes the result set, feature pagination state should normally return to its initial position.

The pure URL-state helper can reset whichever pagination key the feature owns.

## 8. Semantic data display

### 8.1 Use a table when the relationship is tabular

Use semantic `<table>` markup when users need to compare repeated records across stable columns.

The shared `CollectionTable` provides a presentation frame and requires a caption. The feature supplies:

- column headers;
- row cells;
- `scope` semantics where appropriate;
- actions;
- business labels;
- sorting controls if later introduced.

Do not render a grid of generic divs merely to avoid table semantics.

### 8.2 Alignment

Operational numeric values benefit from stable scanning.

Use end alignment and tabular numerals for quantities/money when appropriate.

Dates/timestamps use the #58 presentation formatter with explicit business timezone where an instant requires it.

Currency formatting always receives an explicit currency from the owning business context.

Formatting remains presentation. It does not perform business calculations.

### 8.3 Status

Status presentation must combine semantic wording with visual treatment.

A badge color alone is not the state.

The feature owns which business status maps to which semantic tone. `platform/collections` does not contain a universal domain-status dictionary.

### 8.4 Row and item actions

Actions remain feature-owned because their consequences are business semantics.

The shared collection layer must not manufacture generic `Edit`/`Delete` actions.

If a domain requires cancellation, correction, reversal, deactivation, or another historical operation, the feature must expose that real capability instead.

## 9. Responsive data display

The default shared collection layout is compact-first and switches to tabular presentation at the same `64rem` desktop boundary used by the M2 application shell.

`CollectionResponsiveDataView` accepts two feature-composed representations:

```text
table
compact
```

CSS selects the active presentation.

This is intentional: the feature is responsible for defining a meaningful compact reading order rather than relying on a generic script to transform arbitrary columns into cards.

### Compact rules

Compact/mobile presentation must preserve all essential information and actions.

Prefer:

- clear item identity first;
- status near identity;
- a small set of labelled facts;
- actions that remain reachable by keyboard/touch.

Do not simply hide important columns to make the viewport fit.

### Horizontal overflow

Horizontal table scrolling is acceptable only when the underlying data is genuinely wide and no more understandable compact/recomposed layout exists.

It is not the first response to mobile width.

## 10. Collection states

Collection absence and async behavior are not one generic empty card.

### Initial loading

Initial loading means no usable collection content is available yet.

A bounded skeleton may preserve expected layout while an accessible status communicates loading proportionately.

Do not announce every skeleton row individually.

### Background refresh

When usable data already exists, keep it visible during background refresh.

Show a secondary refreshing indicator instead of replacing the whole collection with a loading screen.

This reduces layout shift and preserves the operator's context.

### Empty collection

The source collection genuinely contains no records.

Copy may explain what that means and may offer a legitimate creation/import action when the feature actually supports one.

M2 does not invent such actions in the engineering fixture.

### Zero results

The source collection exists, but current search/filter state matches nothing.

The recovery action is normally to change or reset the current view, not to create fake business data.

### Recoverable load error

A failed read is an error, not an empty collection.

Expose retry only when retry is genuinely safe and useful.

Issue #62 owns the broader product feedback/error vocabulary; #61 establishes the collection-specific distinction.

### Unavailable / permission-aware later

Unavailable and future permission-restricted states remain distinct from not found, empty, and network failure.

M2 provides neutral presentation structure without implementing M3 authorization behavior.

## 11. TanStack Table evaluation

`@tanstack/react-table` is **not adopted in #61**.

A headless table engine becomes valuable when real product screens repeatedly need coordinated behavior such as:

- complex sorting;
- column visibility/order;
- nested row models;
- multi-column filtering;
- selection;
- expandable/grouped rows;
- sophisticated client-side table state.

The current M2 requirement is smaller: semantic display, URL-backed collection controls, pagination presentation, responsive composition, and state differentiation.

Adding a broad table-state abstraction now would prepay complexity before any real domain table demonstrates it.

This decision is reversible. If later screens establish repeated complex behavior, evaluate a maintained headless engine while keeping business columns/query semantics feature-owned.

## 12. Selection and bulk actions

Reusable selection and bulk actions are deferred.

There is no current M2 consumer that can define:

- what selection means across pagination;
- whether selection survives filter changes;
- which bulk operations are safe;
- authorization/consequence behavior;
- partial-failure semantics.

Those questions are business/application concerns, not generic checkbox infrastructure.

Introduce shared selection only after a concrete V1 workflow establishes the contract.

## 13. Accessibility baseline

Collection composition must preserve:

- visible/accessible names for search and filter controls;
- Enter submission for explicit search;
- keyboard-operable links, controls, menus, and actions;
- semantic table/caption/header relationships when tabular;
- non-color-only status meaning;
- compact presentation with equivalent essential information;
- understandable pagination labels;
- proportionate live/status messaging;
- no focus trap during filtering or pagination;
- no unintended horizontal page overflow in normal compact composition.

Issue #63 will strengthen this with automated accessibility and responsive quality gates.

## 14. Representative engineering fixture

`/foundation` contains a domain-neutral collection fixture.

It demonstrates:

- explicit search submitted by Enter/button;
- simple immediate status filtering;
- `q`, `status`, and demonstration pagination URL state;
- default-parameter omission;
- pagination reset after search/filter change;
- semantic desktop table;
- complete compact/mobile list;
- localized number/date presentation through #58 infrastructure;
- semantic status badges with text;
- initial loading;
- background refresh with retained data;
- true empty state;
- zero-result state;
- recoverable load error;
- unavailable state.

The fixture is engineering evidence. Its records are intentionally neutral and do not represent Product, Customer, Sale, Inventory, or another unfinished business capability.

## 15. Testing strategy

### Unit

Pure URL-state behavior is tested without Next.js or a browser:

- unrelated parameters survive;
- changed search/filter values are applied;
- pagination reset keys are removed;
- cleared/default values disappear;
- href construction omits an empty query string.

### Browser E2E

Dedicated collection-pattern browser tests prove:

- keyboard search submission;
- URL-state changes;
- pagination reset after search;
- zero-result recovery;
- distinct collection states;
- desktop semantic-table presentation;
- compact/mobile equivalent presentation;
- no unintended horizontal page overflow.

Business query correctness remains for the feature/API tests that eventually own those capabilities.

## 16. Re-evaluation triggers

Revisit this foundation when real features demonstrate repeated need for:

- complex client-side sorting/filtering;
- reusable column-state management;
- bulk selection/actions;
- virtualization for genuinely large rendered sets;
- advanced sticky/multi-level table headers;
- a different pagination interaction justified by a domain API;
- richer filter-menu primitives.

Do not expand the shared layer merely because a capability is common in generic enterprise grids.

## 17. Handoff to later M2 issues

Issue #62 should reuse these collection states when defining the broader feedback vocabulary rather than replacing their meaning.

Issue #63 should scan/test the representative collection surface for accessibility, keyboard behavior, and responsive reflow.

Issue #64 may capture selective deterministic visual baselines of collection and absence states without turning every fixture permutation into a screenshot.

The durable boundary after #61 is:

```text
shared composition is platform-owned
business collection meaning is feature-owned
backend query semantics are API/feature-owned
```
