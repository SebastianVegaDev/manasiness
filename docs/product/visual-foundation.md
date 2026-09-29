# Manasiness Visual Foundation

> **Status:** Active  
> **Milestone:** M2 — Product Experience  
> **Issue:** [#56](https://github.com/SebastianVegaDev/manasiness/issues/56)  
> **Scope:** Product visual identity, semantic design tokens, styling rules, typography, and theme behavior.

## 1. Purpose

This document defines the visual contract that later Manasiness UI work consumes.

It does not define final feature layouts, authentication screens, the application shell, or a complete component library. Those responsibilities remain with their owning M2/M3 issues.

The product-experience contract remains [`product-experience.md`](product-experience.md). This document supplies the visual primitives needed to implement that experience consistently.

## 2. Visual posture

Manasiness should feel:

```text
clear
operational
trustworthy
calm
dense when useful
uncluttered
```

The visual system should make business state easy to scan without making daily work look like an enterprise administration console.

Visual novelty is secondary to hierarchy and comprehension.

## 3. Brand identity

### Primary mark

The mark combines:

- an indigo rounded tile for stability and product identity;
- a connected `M` path for Manasiness and connected operational flows;
- a mint signal point for current state, attention, and forward movement.

The mark is intentionally simple enough to remain recognizable at application-icon size.

Runtime assets live at:

```text
apps/web/src/app/icon.svg
apps/web/public/brand/manasiness-mark.svg
```

### Wordmark

The canonical product wordmark is:

```text
[mark] Manasiness
```

`Manasiness` uses the product sans family at bold weight with tight heading tracking.

The wordmark is a treatment, not a separate raster logo. Keeping the text live preserves sharp rendering, accessibility, localization-independent product naming, and theme compatibility.

### Theme compatibility

The full-color mark uses a stable brand tile and white glyph, so it may be used on either light or dark surfaces without maintaining duplicate assets.

If a context genuinely requires monochrome output, use the same geometry as a single foreground color. Do not recolor the primary mark arbitrarily feature by feature.

### Brand restrictions

Do not:

- stretch or distort the mark;
- replace the brand indigo/mint inside the canonical mark with feature status colors;
- add shadows/gradients to the mark merely for decoration;
- use the signal point as a generic success-status icon;
- treat the mark as domain-owned UI.

## 4. Styling architecture

The Web styling stack is:

```text
semantic CSS custom properties
        ↓
global reset/base rules
        ↓
CSS Modules for page/component-local composition
```

The architectural rationale is recorded in [`../adr/0014-web-styling-and-theme-foundation.md`](../adr/0014-web-styling-and-theme-foundation.md).

Tailwind and a CSS-in-JS runtime are not part of the M2 foundation.

### Ownership

```text
apps/web/src/platform/styling/tokens.css
    semantic visual values and scales

apps/web/src/app/globals.css
    document reset and global element behavior

*.module.css
    local page/component composition
```

Later reusable primitives may own component-specific variants, but they must consume this token system rather than introduce a second palette or spacing scale.

## 5. Token consumption rules

Product UI should prefer semantic variables such as:

```css
color: var(--color-foreground);
background: var(--color-surface);
padding: var(--space-4);
border-radius: var(--radius-md);
```

Avoid normal feature styles such as:

```css
color: #4338ca;
padding: 17px;
border-radius: 9px;
```

A one-off literal is acceptable only when it describes intrinsic geometry rather than a reusable visual decision, and it should not silently create a parallel design scale.

Static brand SVG source is a deliberate exception because independent SVG files do not inherit application CSS custom properties.

## 6. Semantic color model

The semantic surface/color vocabulary includes:

| Token responsibility | Light | Dark |
| --- | --- | --- |
| Background | `#f8fafc` | `#0b1020` |
| Surface | `#ffffff` | `#111827` |
| Elevated surface | `#ffffff` | `#172033` |
| Foreground | `#0f172a` | `#f8fafc` |
| Muted foreground | `#475569` | `#cbd5e1` |
| Border | `#cbd5e1` | `#475569` |
| Primary | `#4338ca` | `#a5b4fc` |
| Accent | `#0f766e` | `#5eead4` |
| Success | `#047857` | `#6ee7b7` |
| Warning | `#a16207` | `#fbbf24` |
| Critical | `#b91c1c` | `#fca5a5` |
| Focus | `#4f46e5` | `#c7d2fe` |

Components consume the semantic token name, not the literal table value.

Status color must never be the only carrier of meaning. Later badges, alerts, errors, and confirmations must include understandable text and/or iconography.

## 7. Typography

Manasiness uses **Geist** as the product sans family through `next/font`.

This provides one readable family for operational interfaces while Next.js optimizes and self-hosts the generated font assets at runtime.

The fallback stack remains a platform sans stack so text remains usable if font loading ever fails.

### Hierarchy

The token scale provides:

```text
12px  xs
14px  sm
16px  md
18px  lg
20px  xl
24px  2xl
30px  3xl
36px  4xl
```

Body copy normally begins at `md`.

Dense supporting metadata may use `sm`. `xs` is reserved for labels/eyebrows and similarly secondary information; it is not a default body size.

Headings use tighter line height/tracking than body copy.

### Numeric data

Operational quantities, balances, dates, and comparable metrics may opt into:

```html
data-numeric="tabular"
```

which enables tabular numerals without changing the product typeface.

## 8. Spacing, radius, and elevation

The spacing scale is based on a 4px unit with intentionally selected larger steps:

```text
0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px
```

Use the scale to express hierarchy and density rather than inventing nearby values for each screen.

Radius tokens cover small controls through larger product surfaces. Pill radius is reserved for genuinely pill-shaped controls/statuses.

Elevation is deliberately restrained:

```text
shadow-sm
shadow-md
shadow-lg
```

Borders and surface hierarchy should do most structural work. Strong shadows are not the default separator for every card.

## 9. Layout and controls

Content-width tokens establish three responsibilities:

```text
readable  42rem
standard  72rem
wide      90rem
```

Prose/forms should not stretch simply because a monitor is wide. Data-rich collections may legitimately use the wider surface.

Control-height tokens are:

```text
small   32px
medium  40px
large   48px
```

The accessibility touch-target minimum token is **44px**. A compact visual control may therefore require additional hit-area treatment when used on touch-oriented surfaces.

## 10. Focus and interaction

Visible keyboard focus uses the semantic focus color with:

```text
3px outline
2px offset
```

Do not remove focus outlines without supplying an equally visible replacement.

Motion uses fast/normal/slow duration tokens and shared easing tokens. Motion should communicate state/orientation rather than decorate routine work.

Global reduced-motion behavior collapses nonessential animation and transition duration when the operating system requests reduced motion.

## 11. Theme strategy

Supported theme preferences are:

```text
system
light
dark
```

The default is `system`.

### System preference

When no explicit preference exists, CSS follows:

```css
prefers-color-scheme
```

without requiring React state or client hydration.

### Explicit browser preference

Before authenticated preference infrastructure exists, a UI-only preference may be stored in:

```text
localStorage["manasiness.theme"]
```

with `light` or `dark`.

`system`, an invalid value, a missing value, or unavailable storage all fall back to the system strategy.

### Initialization

The root layout includes a small `beforeInteractive` script that applies an explicit stored `data-theme` value before hydration.

This avoids rendering the light palette and then visibly switching to a saved dark palette after React starts.

The root element uses `suppressHydrationWarning` only for this intentional theme attribute boundary; it is not permission to hide arbitrary hydration mismatches.

### Ownership boundary

Theme preference is presentation state.

It must not be stored as or inferred from:

- Organization currency;
- Organization timezone;
- Organization country;
- Membership;
- Identity authorization.

Issue #58 owns UI locale, and M3 owns authenticated Identity/Organization behavior.

## 12. Accessibility spot checks

Representative WCAG contrast checks for normal text include:

| Pair | Contrast |
| --- | ---: |
| Light foreground / background | `17.06:1` |
| Light muted foreground / surface | `7.58:1` |
| Light primary / primary foreground | `7.90:1` |
| Light accent / accent foreground | `5.47:1` |
| Light warning / warning foreground | `4.92:1` |
| Dark foreground / background | `18.10:1` |
| Dark muted foreground / surface | `11.95:1` |
| Dark primary / primary foreground | `8.90:1` |
| Dark accent / accent foreground | `12.07:1` |

These checks establish a safe token baseline; they do not replace issue #63's later automated accessibility testing or component-level review.

## 13. Layering

The visual layer scale reserves semantic levels for:

```text
base
sticky
dropdown
overlay
modal
toast
```

A feature should not invent large arbitrary `z-index` values to win stacking conflicts. Later primitives own the exact use of these levels.

## 14. What #56 deliberately does not build

This issue does not introduce:

- authentication UI;
- the M2 application shell;
- product-domain pages;
- a generic UI component library;
- shadcn/ui;
- Storybook;
- a standalone design-system package;
- Organization preference persistence;
- domain-specific status components.

The temporary engineering landing only consumes the new foundation so the theme/brand/tokens are exercised by real runtime markup. Issue #59 will replace it with the actual application shell.

## 15. Acceptance baseline

The visual foundation is ready for later M2 work when:

- the root runtime loads one semantic token source;
- light/dark/system behavior is deterministic;
- persisted explicit theme preference is applied before hydration;
- typography is loaded through the root layout;
- the application icon and reusable mark are present;
- local CSS consumes tokens rather than duplicating palette/spacing values;
- representative contrast/focus/reduced-motion requirements are met;
- later primitives can be implemented without reopening global palette, spacing, typography, or theme ownership.
