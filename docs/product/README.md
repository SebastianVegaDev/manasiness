# Manasiness Product Documentation

Product documentation defines what Manasiness is, who it serves, which product behavior is intentional, and how the experience should be organized before implementation details shape those decisions accidentally.

Use the smallest document set relevant to the work.

## Canonical product documents

| Document | Responsibility |
| --- | --- |
| [`product-vision.md`](product-vision.md) | V1 product direction, target users, capability boundary, product principles, and non-goals. |
| [`product-experience.md`](product-experience.md) | M2 product-experience principles, V1 information architecture, navigation model, route model, URL-state expectations, responsive posture, and shell handoff seams. |
| [`visual-foundation.md`](visual-foundation.md) | M2 visual identity, semantic design tokens, typography, theme behavior, styling rules, and brand-asset guidance. |
| [`ui-primitives.md`](ui-primitives.md) | M2 reusable UI primitive ownership, API conventions, accessibility behavior, native/headless dependency boundary, and testing expectations. |
| [`localization-and-copy.md`](localization-and-copy.md) | M2 UI-locale resolution, message ownership, presentation-formatting boundaries, and product copy/microcopy conventions. |
| [`application-shell.md`](application-shell.md) | M2 application-shell ownership, route composition, responsive navigation, page-layout primitives, and M3 extension points. |
| [`form-and-mutation-patterns.md`](form-and-mutation-patterns.md) | M2 form-state strategy, validation layers, accessible field composition, form-specific structured API-error mapping, mutation behavior, and unsaved-change policy. |
| [`collection-and-data-display-patterns.md`](collection-and-data-display-patterns.md) | M2 collection composition, search/filter URL state, pagination presentation, semantic/compact data display, and collection-specific loading/absence/error states. |
| [`feedback-and-state-patterns.md`](feedback-and-state-patterns.md) | M2 product-wide feedback channels, generic async/empty/error states, transient notifications, broad failure treatment, consequential confirmation, and accessibility rules. |
| [`accessibility-and-responsive-quality.md`](accessibility-and-responsive-quality.md) | M2 accessibility baseline, viewport matrix, automated checks, and manual review checklist. |
| [`legacy-audit.md`](legacy-audit.md) | Evidence from the legacy product: workflows and UX patterns worth preserving, redesigning, replacing, or removing. |

## How to use these documents

Read [`product-vision.md`](product-vision.md) before changing product scope or introducing a new capability.

Read [`product-experience.md`](product-experience.md) before changing:

- global navigation;
- product route namespaces;
- application-shell hierarchy;
- Organization/account control placement;
- collection URL-state conventions;
- responsive navigation behavior;
- the relationship between domain boundaries and user-facing product areas.

Read [`visual-foundation.md`](visual-foundation.md) before changing:

- brand treatment;
- global color semantics;
- typography or spacing scales;
- theme behavior;
- focus/motion/layout visual primitives;
- styling ownership or token-consumption rules.

Read [`ui-primitives.md`](ui-primitives.md) before:

- adding a reusable primitive;
- changing shared button/field/choice-control APIs;
- introducing menu/dialog/popover behavior;
- adding a headless UI dependency;
- changing shared disabled/focus/accessibility behavior;
- moving a feature component into `platform/ui`.

Read [`localization-and-copy.md`](localization-and-copy.md) before changing:

- supported UI locales or fallback behavior;
- locale detection or preference precedence;
- product message ownership/key conventions;
- translation access in Server or Client Components;
- user-facing number/date/currency/time formatting;
- product microcopy conventions;
- the separation between UI locale and Organization currency/timezone.

Read [`application-shell.md`](application-shell.md) before changing:

- shell ownership or Server/Client boundaries;
- desktop/compact navigation composition;
- page-layout primitives;
- working versus unavailable navigation behavior;
- Organization/Identity shell extension points;
- M3 route/authentication handoff seams.

Read [`form-and-mutation-patterns.md`](form-and-mutation-patterns.md) before changing:

- form-state or submission strategy;
- field validation/error wiring;
- mutation pending/retry behavior;
- structured API-error handling in forms;
- unsaved-change protection;
- shared form infrastructure under `platform/forms`.

Read [`collection-and-data-display-patterns.md`](collection-and-data-display-patterns.md) before changing:

- collection-page composition;
- search/filter URL behavior;
- collection pagination presentation;
- table versus compact/mobile data presentation;
- collection loading, refresh, empty, zero-result, error, or unavailable states;
- reusable collection infrastructure under `platform/collections`;
- the decision boundary for bulk selection or a headless table dependency.

Read [`feedback-and-state-patterns.md`](feedback-and-state-patterns.md) before changing:

- product-wide inline alert or banner behavior;
- transient toast/notification behavior;
- generic page/section loading, empty, no-history, not-configured, unavailable, or error states;
- broad API/client failure treatment;
- request-ID presentation;
- consequential/destructive confirmation behavior;
- live-region and feedback focus behavior;
- reusable feedback infrastructure under `platform/feedback`.

Read [`accessibility-and-responsive-quality.md`](accessibility-and-responsive-quality.md) when reviewing accessibility, responsive behavior, or their browser quality gate.

Read [`legacy-audit.md`](legacy-audit.md) when legacy behavior is relevant. Legacy is evidence, not the new product or architecture source of truth.

Business terminology, ownership, invariants, and lifecycle semantics remain governed by [`../domain/`](../domain/).

Cross-cutting architecture and accepted technical decisions remain governed by [`../architecture/`](../architecture/) and [`../adr/`](../adr/).

## Decision hierarchy

When documents appear to pull in different directions, preserve the repository hierarchy:

```text
Product requirements
        ↓
Domain invariants
        ↓
Cross-cutting policies
        ↓
Architectural decisions
        ↓
Implementation convenience
```

A UI or route must adapt to established business semantics rather than redefine them for implementation convenience.
