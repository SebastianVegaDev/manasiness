# Manasiness UI Primitive Foundation

> **Status:** Active  
> **Milestone:** M2 — Product Experience Foundation  
> **Issue:** [#57](https://github.com/SebastianVegaDev/manasiness/issues/57)  
> **Scope:** Reusable, accessible, token-driven Web interaction primitives.

## 1. Purpose

This document defines the reusable UI primitive boundary for `apps/web`.

The primitive layer exists so the application shell, M3 authentication flows, and later product features do not repeatedly solve the same button, field, choice-control, menu, dialog, status, and loading behavior.

It is intentionally not a complete component catalog.

It does not own:

- business rules;
- API calls;
- product-domain terminology;
- data-table architecture;
- form orchestration;
- feedback/toast orchestration;
- navigation composition;
- feature-specific cards, tables, filters, or workflows.

The visual-value contract remains [`visual-foundation.md`](visual-foundation.md). Primitives consume that contract rather than creating another one.

## 2. Canonical ownership

Reusable product UI primitives live at:

```text
apps/web/src/platform/ui/
```

This is an explicit platform capability, not a generic component dumping ground.

A component belongs here only when all of the following are true:

1. it represents a broadly reusable interaction or presentation primitive;
2. its semantics do not depend on a business domain;
3. more than one product area is reasonably expected to compose it;
4. its API can remain stable without knowing future feature data models;
5. central ownership prevents repeated accessibility or interaction work.

Feature-owned components remain with their feature.

Examples that **do not** belong here:

```text
SaleCard
CustomerTable
InventoryStatus
QuotationEditor
WorkerShiftSummary
```

Those names encode business meaning and should remain owned by the capability that understands that meaning.

## 3. Source ownership versus dependency ownership

Issue #57 evaluated current headless primitive options, including Radix Primitives and Base UI.

Both provide meaningful accessibility value for complex widgets.

Base UI 1.8.0 was particularly relevant because it is unstyled, React-compatible, works with CSS Modules, supports modern bundlers including Turbopack, and centralizes difficult focus/keyboard behavior.

Manasiness does **not** adopt a headless primitive dependency in #57.

The current primitive set can be implemented with semantic HTML plus a small amount of focused React behavior:

- native `button`, `a`, `input`, `textarea`, `select`, `fieldset`, and `label`;
- native checkbox/radio controls with source-owned visual treatment;
- native modal `<dialog>` through `showModal()`;
- one intentionally limited menu-button implementation following the WAI-ARIA menu-button pattern.

Adding a dependency merely to wrap native controls would expand the runtime and upgrade surface without improving the current requirement.

This decision is recorded in [`../adr/0015-native-first-web-ui-primitives.md`](../adr/0015-native-first-web-ui-primitives.md).

### Dependency adoption trigger

The decision is not permanent.

Re-evaluate a headless primitive dependency when a real consumer needs behavior such as:

- collision-aware arbitrary popovers;
- nested/submenus;
- searchable combobox/autocomplete behavior;
- advanced custom select behavior;
- complex focus scopes across layered overlays;
- interaction patterns whose correct implementation would duplicate a maintained library.

At that point, adopt the smallest justified boundary and keep the Manasiness wrapper/API source-owned.

## 4. Implemented primitive set

The initial primitive set is:

```text
Button
IconButton
AppLink

Field
FieldLabel
FieldDescription
FieldError
Input
Textarea
Select

Checkbox
RadioGroup
Radio
Switch

Badge
Separator
Skeleton

Menu
MenuItem
MenuLink

Dialog
AlertDialog
DialogCloseButton
```

This set covers the immediate cross-cutting needs of:

- application-shell actions;
- M3 authentication and account forms;
- bounded choice fields;
- binary preferences;
- status labels;
- loading placeholders;
- action/navigation menus;
- modal and confirmation foundations.

Higher-level feedback composition is implemented by issue #62 under:

```text
apps/web/src/platform/feedback/
```

That layer composes these primitives rather than adding toast orchestration to `platform/ui`.

## 5. Intentionally deferred primitives

The following low-level primitives are still **not** implemented:

```text
Combobox / Autocomplete
generic Popover
Tabs
Tooltip
Date picker
Data table
```

### Combobox

`Select` is intentionally native for bounded, reasonably sized option lists.

A combobox becomes justified when a real feature needs searchable, asynchronous, or large-option selection. That is the point where a headless primitive dependency is likely more valuable than custom behavior.

### Generic popover

The current menu has one concrete ownership contract: a menu button and menu items.

A generic popover would create a lower-level positioning/focus API before a real consumer defines its needs.

### Tabs

No M2 consumer currently requires tabbed content. Tabs should not be added because they are common in component catalogs.

### Tooltip

Icon-only actions already require an explicit accessible label.

A dedicated tooltip remains deferred until a real product surface needs supplementary hover/focus help. The WAI-ARIA APG tooltip pattern is also still documented as work in progress, so Manasiness should not introduce a generic tooltip API speculatively.

### Toast orchestration handoff

Issue #57 deliberately deferred transient feedback strategy.

Issue #62 now owns and implements that responsibility in `platform/feedback` through product-wide feedback composition and `FeedbackToastProvider`.

Toast lifecycle remains outside `platform/ui` because it is orchestration, not a low-level visual primitive.

## 6. Component API conventions

### Variants express meaning

Primitive variants use semantic names.

Examples:

```text
Button
    primary
    secondary
    ghost
    critical

Badge
    neutral
    primary
    success
    warning
    critical
```

Do not expose raw palette names such as `indigo600`.

Do not accept arbitrary color values as a normal primitive API.

### Sizes are intentionally limited

Button sizes are:

```text
sm
md
lg
```

The visual size may be compact, but the interactive hit area continues to honor the shared 44px touch-target minimum.

### `className` is an escape hatch, not a parallel theme

Primitives accept `className` where composition requires local layout control.

Feature CSS may use that escape hatch for:

- grid/flex placement;
- width within a feature layout;
- feature-owned spacing between composed primitives.

It should not routinely override:

- product colors;
- focus treatment;
- primitive state semantics;
- control heights;
- disabled behavior.

If many consumers override the same primitive style, fix the primitive API or token contract instead.

### Refs

DOM-backed controls forward refs when refs are useful for:

- focus;
- form integration;
- imperative browser APIs;
- composition.

The primitive layer does not invent an imperative handle when the underlying DOM node is sufficient.

### Controlled versus uncontrolled

Native form controls retain the normal React controlled/uncontrolled contract.

The `Dialog` primitive is controlled through:

```text
open
onOpenChange
```

The `Menu` currently owns its transient open state because no cross-product requirement needs externally controlled menu state.

### Composition over prop matrices

A primitive should expose the smallest stable semantic API and accept children for content.

Do not add large collections of feature-oriented props to avoid writing a feature-owned or platform-composition component.

## 7. Button semantics

`Button` renders a real HTML `button`.

Default type is:

```text
button
```

A submit button must opt into:

```text
type="submit"
```

`pending`:

- sets `aria-busy`;
- disables repeated activation;
- may provide a `pendingLabel`;
- does not invent asynchronous business behavior.

`IconButton` requires a `label` prop so icon-only actions always have an accessible name.

### Disabled versus `aria-disabled`

Normal buttons use the native `disabled` attribute.

The menu is the deliberate exception: disabled menu items use `aria-disabled` so they remain discoverable in menu keyboard navigation, matching menu-widget expectations.

Do not replace native `disabled` with `aria-disabled` merely for styling convenience.

## 8. Field semantics

The primitive layer does not hide HTML relationships behind a form framework.

A field should use stable explicit relationships:

```tsx
<Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" aria-describedby="email-description" />
    <FieldDescription id="email-description">
        Used for account communication.
    </FieldDescription>
</Field>
```

Validation/orchestration is owned by issue #60.

That layer may connect:

```text
aria-invalid
aria-errormessage
validation messages
submission state
```

without replacing these primitive semantics.

## 9. Choice controls

### Checkbox

`Checkbox` renders a real checkbox input and requires visible label content.

Optional description text is connected through `aria-describedby`.

### Radio group

`RadioGroup` renders `fieldset` + `legend`.

Each `Radio` remains a real radio input.

Items in one logical group must share the same native `name`.

### Switch

`Switch` is a native checkbox input with:

```text
role="switch"
```

Use it only for a true on/off state whose change takes effect as a setting/state toggle.

Do not use Switch for:

- multi-option choices;
- form submission actions;
- commands such as "Run sync".

## 10. Badge semantics

A badge always renders visible content.

Status hue cannot be its only meaning.

Correct:

```text
[green styling] Paid
[red styling] Overdue
```

Incorrect:

```text
green dot with no understandable text
red dot with no understandable text
```

Domain-specific status vocabulary remains feature-owned. The shared primitive only supplies visual tone.

Issue #62 reuses this primitive for product-wide feedback examples without turning broad feedback tones into domain status definitions.

## 11. Skeleton semantics

`Skeleton` is presentation-only and is hidden from assistive technology.

The surrounding loading region owns meaningful loading semantics such as:

```text
aria-busy
status text
```

A skeleton must not be the only indication that content is loading.

Issue #62 preserves this rule in generic `FeedbackLoadingState`; issue #61 preserves it for collection loading.

## 12. Menu behavior

`Menu` implements the WAI-ARIA menu-button contract for a small action/navigation menu.

Trigger behavior:

- renders a real button;
- exposes `aria-haspopup="menu"`;
- exposes `aria-expanded`;
- links trigger and menu with `aria-controls`;
- `ArrowDown` opens and focuses the first item;
- `ArrowUp` opens and focuses the last item;
- click/Enter/Space open through native button activation.

Open-menu behavior:

- menu container uses `role="menu"`;
- items use `role="menuitem"`;
- `ArrowDown` and `ArrowUp` move focus cyclically;
- `Home` and `End` move to boundaries;
- `Escape` closes and restores focus to the trigger;
- `Tab` closes the menu and allows normal sequential navigation to continue;
- activation closes and restores trigger focus;
- outside pointer interaction closes without stealing focus.

Disabled menu items use `aria-disabled` and do not activate.

### Menu scope boundary

The M2 menu does not implement:

- nested submenus;
- checkbox/radio menu items;
- typeahead;
- collision-aware portal positioning;
- arbitrary popup content.

Those requirements would trigger re-evaluation of a maintained headless primitive.

## 13. Dialog behavior

`Dialog` uses the native HTML `<dialog>` element and `showModal()`.

This gives the browser ownership of:

- top-layer modal presentation;
- making the rest of the document inert;
- native modal focus behavior.

Manasiness owns:

- the controlled React API;
- title/description relationships;
- explicit close affordance;
- Escape integration with `onOpenChange`;
- restoring focus to the element that opened the dialog;
- design-token styling.

Every dialog has an explicit close control.

`AlertDialog` uses the same foundation with `role="alertdialog"` for interruptive confirmation/decision cases.

Feature code still owns the actual confirmation action and its business consequences.

Issue #62 composes `AlertDialog` into `platform/feedback/DestructiveConfirmationDialog`, where consequence vocabulary and reversible/irreversible presentation belong.

## 14. Server and client boundaries

Most primitives are server-compatible markup/style wrappers.

Only interaction primitives that require browser state/APIs establish a Client Component boundary:

```text
Menu
Dialog
```

Importing one interactive primitive must not make the entire application shell a Client Component.

Server Components should compose interactive leaves where needed.

Higher-level client orchestration such as `FeedbackToastProvider` belongs outside `platform/ui` and should likewise be placed at the narrowest useful boundary.

## 15. Testing strategy

The current repository already has:

- strict TypeScript;
- formatting/lint gates;
- production build;
- Playwright browser E2E.

Issue #57 uses the cheapest layer that proves each primitive concern.

Browser E2E verifies representative behavior for:

- explicit field accessible name/description relationship;
- native disabled button semantics;
- menu keyboard open/navigation/Escape/focus return;
- dialog accessible naming;
- dialog initial focus;
- Escape close;
- dialog focus return.

Issue #62 owns higher-level feedback/toast browser behavior. Tests deliberately do not snapshot CSS class strings.

## 16. Temporary engineering surface

The `/foundation` route is an engineering-only surface for reusable M2 interaction evidence.

Issue #57 added primitive diagnostics there. Later M2 issues add product-neutral fixtures for form, collection, and feedback behavior without inventing product-domain screens.

This is not a product-domain surface and must not become a substitute for real feature ownership.

## 17. Review checklist

Before adding a new primitive under `platform/ui`, ask:

1. Is it genuinely cross-cutting?
2. Can native HTML already solve the semantics?
3. Is the interaction sufficiently complex to justify a maintained headless dependency?
4. Does it consume existing semantic tokens?
5. Does it keep business language out of the primitive API?
6. Does it preserve keyboard behavior and visible focus?
7. Can it remain a server-compatible component, or is a client boundary truly required?
8. Is a new primitive better than feature-owned or platform-owned composition?
9. Is there a real consumer now?

If the last answer is no, defer it.
