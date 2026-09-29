# ADR 0014 — Native CSS tokens and scoped Web styling

> **Status:** Accepted  
> **Date:** 2026-09-29

## Context

M2 begins the durable Manasiness product experience.

Issue #55 established the information architecture before visual implementation. Issue #56 now needs one styling and theme foundation that later primitives, authentication flows, the application shell, and business features can reuse without inventing independent colors, spacing, typography, shadows, or theme behavior.

The Web runtime already uses Next.js App Router and React. It has no styling framework or component-library dependency.

The decision must therefore answer whether Manasiness should add a utility framework now or use the CSS capabilities already provided by the selected platform.

## Decision

Manasiness Web uses:

```text
CSS custom properties
        +
root-level global CSS
        +
CSS Modules for local component/page styling
```

Semantic design tokens are the single visual-value source and live under:

```text
apps/web/src/platform/styling/
```

Global reset/base behavior is loaded by the root App Router layout.

Feature and reusable-component styles may use CSS Modules, but they consume semantic tokens instead of reproducing literal colors, spacing scales, radii, shadows, focus values, or motion values.

## Tailwind CSS

Tailwind CSS is not adopted in issue #56.

The current requirement is fully covered by platform-native CSS custom properties and CSS Modules, which Next.js supports directly. Adding Tailwind now would introduce build dependencies and a second styling vocabulary before reusable primitives or feature composition demonstrate a concrete need for utility-class authoring.

This is a deferral, not a permanent prohibition.

A future issue may adopt Tailwind if real implementation evidence shows a clear maintenance or delivery advantage. Such a change must preserve the semantic-token contract rather than turn raw utility palette values into the product API.

## Semantic token contract

Components consume semantic names such as:

```text
--color-surface
--color-foreground
--color-primary
--color-critical
--space-4
--radius-md
--shadow-md
--control-height-md
--motion-duration-normal
```

Component APIs must not expose implementation palette names such as `indigo-600` or make arbitrary hexadecimal values a normal customization mechanism.

Brand-source artwork is the narrow exception: standalone SVG assets contain their canonical brand colors because they cannot inherit application CSS variables when used as independent files.

## Theme model

The supported preferences are:

```text
system
light
dark
```

`system` is the default.

Without an explicit browser preference, CSS follows `prefers-color-scheme` directly. An explicit `light` or `dark` browser preference is stored under:

```text
manasiness.theme
```

and represented on the root document through:

```text
data-theme="light"
data-theme="dark"
```

A small `beforeInteractive` initialization script applies an explicit stored preference before React hydration. The root element permits that expected pre-hydration attribute difference, avoiding a broken theme flash/hydration warning boundary.

Theme preference is UI-only browser state in M2.

It is not:

```text
Organization configuration
business timezone
currency
Membership state
authorization state
```

M3 authentication and later preference persistence may integrate with this seam deliberately without moving theme ownership into Organization business data.

## Typography

The product uses Geist through `next/font`.

The font is optimized/self-hosted by Next.js for the runtime, avoiding a browser-time dependency on a remote font CDN and reducing layout instability.

Dense numeric data uses the same product family with tabular-number behavior where alignment matters rather than introducing a decorative secondary typeface.

## Brand assets

The primary Manasiness mark is a compact indigo tile with a connected `M` path and a mint signal point.

The product runtime owns:

```text
apps/web/src/app/icon.svg
apps/web/public/brand/manasiness-mark.svg
```

The App Router metadata convention serves `icon.svg` as the application icon. The public mark is the reusable runtime asset for product lockups.

The canonical wordmark treatment is the mark followed by `Manasiness` in the product typeface at bold weight. The full-color mark is designed to remain legible on both light and dark surfaces; monochrome treatment is reserved for contexts that cannot reproduce the primary mark and does not require a separate runtime asset yet.

## Accessibility

The token foundation includes:

- explicit focus-ring color/width/offset;
- readable light/dark foreground pairs;
- status foreground/background pairs;
- a 44px minimum touch-target token;
- reduced-motion fallback behavior;
- semantic status colors that later components must pair with text/icon meaning rather than hue alone.

Issue #63 remains responsible for repeatable automated and manual accessibility gates.

## UI package boundary

Issue #56 does not create a standalone UI workspace package.

There is only one current product UI consumer: `apps/web`.

Issue #57 will establish the source-owned primitive layer inside the Web application. A separate package requires a real second consumer or another concrete ownership reason.

## Consequences

### Positive

- no new styling/runtime dependency is required;
- semantic tokens remain independent from a CSS framework;
- light and dark themes share one contract;
- local styles are scoped through built-in CSS Modules;
- future primitives can compose the same values without duplicating a palette;
- brand/font/theme behavior has one application-level owner;
- theme initialization does not require making the root application a Client Component.

### Trade-offs

- CSS Modules are more verbose than utility-class authoring for some layouts;
- repository conventions, review, and later primitives must prevent arbitrary one-off CSS values;
- dark semantic values are intentionally repeated in the explicit-dark and system-dark selectors so system preference works without JavaScript;
- a future Tailwind adoption would require mapping its utilities back onto this semantic token contract.

## Alternatives considered

### Tailwind CSS now

Deferred.

It is a capable and supported Next.js option, but issue #56 does not yet have a concrete utility-class requirement that justifies adding its build toolchain.

### CSS-in-JS runtime library

Rejected.

It adds runtime/client complexity and a new dependency without improving the requirements owned by this issue.

### Theme-provider library

Rejected for M2.

The current theme requirement is small enough to implement with CSS media queries, one local preference key, and a pre-hydration script. A provider would add client state and dependency surface before any product theme control exists.

### Standalone design-system package

Rejected.

No second consumer exists, and speculative cross-workspace reuse would conflict with repository ownership rules.

## References

- `docs/product/product-experience.md`
- `docs/product/visual-foundation.md`
- `apps/web/src/platform/styling/tokens.css`
- `apps/web/src/platform/theme/`
- Issue #56
