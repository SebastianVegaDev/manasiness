# Accessibility and responsive quality gate

> **Status:** Active
> **Milestone:** M2 — Product Experience Foundation
> **Issue:** [#63](https://github.com/SebastianVegaDev/manasiness/issues/63)

## Engineering baseline

Reusable Web surfaces target applicable WCAG 2.2 AA success criteria. This is an engineering target, not a certification claim. Semantic landmarks and headings, accessible names and descriptions, keyboard operation, visible focus, form labels and errors, dialog focus behavior, status announcements, contrast, non-color meaning, touch targets, reduced motion, and reflow all belong to the source components and their composition.

Automated scanning cannot establish a complete accessible experience. The existing `Browser E2E` quality gate runs `@axe-core/playwright` against the application shell in light and dark themes, open compact navigation, and the foundation page at rest and with representative dialogs. It includes WCAG 2.0/2.1 A and AA, WCAG 2.2 AA, and axe best-practice rules. Serious and critical violations fail the gate. There are no rule exclusions. Scan results are attached to the Playwright report for diagnosis.

Browser tests also exercise the skip link, keyboard navigation and focus return, menu operation, form controls, collection search, destructive confirmation, and reduced-motion interactions. The foundation route is an engineering fixture, not a product destination or substitute for later feature reviews.

## Stable viewport matrix

| Viewport | Size | Expected shell |
| --- | --- | --- |
| Small mobile | 320 × 568 | Compact |
| Large mobile | 390 × 844 | Compact |
| Tablet | 768 × 1024 | Compact |
| Compact laptop | 1024 × 768 | Desktop |
| Standard desktop | 1280 × 800 | Desktop |
| Wide desktop | 1440 × 900 | Desktop |

At each size, browser tests check the shell and foundation for unintended page overflow and verify the expected collection layout. They also check dialogs within the small mobile viewport, Spanish copy at small mobile width, and 200% text enlargement at 320 CSS pixels. Intentional scrolling inside a wide data region may remain appropriate when the owning collection documents it; page-level horizontal scrolling should not appear accidentally.

## Manual review for later UI changes

For a PR that changes reusable UI or introduces a new screen, review the relevant states in both themes and at mobile and desktop widths:

1. Use only the keyboard. Check focus order, visibility, open/close behavior, focus return, and that no control traps focus.
2. Read the page with a screen reader. Check landmarks, heading order, control names, form errors, status announcements, and dialog context.
3. Enlarge text and zoom the browser. Check that essential content and primary actions remain visible and understandable without unintended page overflow.
4. Check contrast and status meaning in normal, hover, focus, disabled, success, warning, and error states. Meaning must not depend on color alone.
5. Try touch-sized controls on a compact viewport and confirm overlays remain within the visual viewport.
6. Enable reduced motion and confirm that state changes remain understandable without animation.

Record any deferred concern with the affected surface, reason, and follow-up issue. Run `pnpm test:e2e` for the automated browser gate when changing shared surfaces.
