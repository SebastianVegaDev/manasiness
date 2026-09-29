# Manasiness Product Documentation

Product documentation defines what Manasiness is, who it serves, which product behavior is intentional, and how the experience should be organized before implementation details shape those decisions accidentally.

Use the smallest document set relevant to the work.

## Canonical product documents

| Document | Responsibility |
| --- | --- |
| [`product-vision.md`](product-vision.md) | V1 product direction, target users, capability boundary, product principles, and non-goals. |
| [`product-experience.md`](product-experience.md) | M2 product-experience principles, V1 information architecture, navigation model, route model, URL-state expectations, responsive posture, and shell handoff seams. |
| [`visual-foundation.md`](visual-foundation.md) | M2 visual identity, semantic design tokens, typography, theme behavior, styling rules, and brand-asset guidance. |
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
