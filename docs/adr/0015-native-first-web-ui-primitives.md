# ADR 0015 — Native-first Web UI primitives

> **Status:** Accepted  
> **Date:** 2026-09-29

## Context

Issue #56 established the Web visual foundation with semantic CSS custom properties, global base styles, and CSS Modules.

Issue #57 must now establish the reusable interaction primitive layer that later application-shell, authentication, account, and product-feature interfaces can compose.

The key architectural question is whether Manasiness should introduce a headless component dependency immediately or keep the first primitive layer source-owned on top of semantic HTML and browser behavior.

The current Web stack is:

```text
Next.js 16
React 19
semantic CSS custom properties
CSS Modules
Playwright
strict TypeScript
```

There is no existing UI-library dependency.

## Decision

Manasiness adopts a **native-first, source-owned** UI primitive strategy for the initial M2 primitive layer.

Canonical ownership is:

```text
apps/web/src/platform/ui/
```

The primitive layer uses native HTML elements whenever the platform already provides the required semantics.

Examples include:

```text
button
a
input
textarea
select
label
fieldset
dialog
```

Manasiness wraps these elements only where a shared product API, styling contract, accessibility relationship, or interaction behavior provides concrete value.

No headless primitive package is added by issue #57.

## Why native-first

Native controls provide the strongest baseline for:

- browser semantics;
- keyboard activation;
- form participation;
- accessible names;
- disabled state;
- mobile interaction;
- reduced JavaScript.

Wrapping a native control in another dependency does not automatically improve those properties.

The M2 primitive set can meet its immediate requirements without introducing a broad package solely for future possibilities.

## Complex interaction boundary

Native-first does not mean "implement every complex widget ourselves."

Issue #57 implements only two shared interactive patterns beyond ordinary native form controls:

```text
Menu
Dialog
```

### Dialog

Dialog uses the native HTML `<dialog>` element and `showModal()`.

The browser supplies top-layer modality and makes the rest of the document inert.

Manasiness supplies:

- controlled React state;
- title/description wiring;
- explicit close affordance;
- Escape synchronization;
- focus return;
- token-driven styling.

### Menu

The initial menu is an intentionally limited WAI-ARIA menu-button implementation.

It covers:

- menu-button semantics;
- `aria-expanded`;
- arrow-key opening;
- arrow-key item navigation;
- Home/End navigation;
- Escape close and trigger focus return;
- Tab dismissal;
- action and navigation menu items;
- disabled menu-item semantics;
- outside-pointer dismissal.

It deliberately does not cover nested menus, menu checkboxes/radios, advanced typeahead, or collision-aware arbitrary popup positioning.

If those become requirements, the dependency decision must be revisited rather than continuously growing custom widget infrastructure.

## Evaluated headless options

### Base UI

Base UI 1.8.0 was evaluated.

It is a strong candidate for future complex primitives because it is:

- unstyled;
- accessibility-focused;
- compatible with React 19;
- compatible with CSS Modules;
- compatible with Turbopack;
- component-level/tree-shakable from one package;
- capable of complex patterns such as combobox, menu, popover, select, tabs, tooltip, and dialog.

It is not adopted now because the current primitive scope is primarily native semantics, and adding the package would expand runtime/dependency/upgrade surface before those advanced behaviors are required.

### Radix Primitives

Radix Primitives was also evaluated.

It remains a valid alternative for accessible, unstyled, composable widgets with established focus and keyboard behavior.

The same deferral applies: issue #57 does not yet need enough non-native behavior to justify introducing it.

## Dependency adoption trigger

Re-open this decision when a real product requirement needs one or more of:

- searchable combobox/autocomplete;
- custom select behavior beyond a native bounded select;
- nested menus;
- complex popover collision/positioning;
- advanced layered focus management;
- interaction behavior that would otherwise require a substantial custom widget implementation.

At that point:

1. compare current maintained options again;
2. adopt only the dependency needed by real consumers;
3. keep Manasiness wrapper APIs source-owned;
4. normalize styling to semantic tokens;
5. avoid importing a prebuilt visual theme;
6. add representative interaction tests.

## Primitive ownership

`platform/ui` is not a generic shared-code folder.

A primitive must be:

- domain-neutral;
- cross-cutting;
- semantically stable;
- token-driven;
- accessibility-reviewed.

Feature-specific components stay with their owning feature.

No standalone workspace package is created because the Web application remains the only product UI consumer.

## Styling contract

Primitive CSS uses the existing semantic tokens from:

```text
apps/web/src/platform/styling/tokens.css
```

Issue #57 may extend that same token source when real interaction states reveal a missing semantic value.

It must not create a second palette or second theme source.

The issue adds semantic interaction-state values for:

- primary hover/active;
- secondary hover/active;
- muted interactive hover/active;
- critical hover/active;
- modal backdrop.

These values remain part of the #56 token contract.

## Server/client boundary

Most primitives remain server-compatible.

Only primitives that actually need browser state/APIs are Client Components.

In the initial set:

```text
Menu   -> client boundary
Dialog -> client boundary
```

This prevents one interactive control from forcing an entire route or application shell into the client module graph.

## Accessibility contract

Primitive APIs prefer native semantics and explicit relationships over hidden magic.

The foundation requires:

- visible focus;
- 44px minimum touch targets for actions;
- accessible names for icon-only buttons;
- native disabled behavior for normal controls;
- `aria-disabled` only where widget semantics require a focusable disabled item;
- label/description relationships for fields;
- fieldset/legend semantics for radio groups;
- no color-only status meaning;
- predictable focus return from modal/menu interactions.

## Testing contract

Representative behavior is tested in Browser E2E.

Tests assert observable semantics and interaction:

```text
accessible names
aria relationships
disabled behavior
keyboard navigation
Escape behavior
focus movement
focus return
```

Tests do not snapshot implementation class names.

## Consequences

### Positive

- the shared UI layer has one explicit owner;
- no unnecessary runtime dependency is added;
- native semantics remain the default;
- primitive styles consume one token system;
- interactive client boundaries stay local;
- feature code receives stable, domain-neutral building blocks;
- future dependency adoption has explicit triggers instead of being accidental.

### Trade-offs

- Manasiness owns the maintenance of its small menu implementation;
- the initial menu does not provide advanced positioning/submenu features;
- a future complex widget may justify migrating part of the behavior to a headless dependency;
- native `select` intentionally limits custom visual behavior until a real combobox/select requirement appears.

## Alternatives considered

### Adopt Base UI for every primitive now

Deferred.

It is technically suitable, but most of the current set would merely wrap behavior already supplied by HTML.

### Adopt Radix/shadcn-style source copies now

Deferred.

Shadcn-style source ownership can be useful, but copying a catalog before consumers exist would conflict with issue #57's requirement to keep the primitive set intentionally small.

### Build a standalone `packages/ui`

Rejected.

There is one current product UI consumer. A package would create speculative cross-workspace reuse and additional publishing/build boundaries.

### Build every expected catalog primitive now

Rejected.

Combobox, tabs, generic popover, tooltip, data table, date picker, and toast orchestration do not yet have sufficient owning requirements in #57.

## References

- `docs/product/product-experience.md`
- `docs/product/visual-foundation.md`
- `docs/product/ui-primitives.md`
- `apps/web/src/platform/ui/`
- `apps/web/src/platform/styling/tokens.css`
- Issue #57
- WAI-ARIA Authoring Practices: Menu Button Pattern
- MDN: `HTMLDialogElement.showModal()`
