# ADR 0006 — Operational Assistant executes application capabilities

> **Status:** Accepted  
> **Date:** 2026-09-27

## Context

Manasiness V1 includes an Operational Assistant that should allow users to query and eventually execute business operations using natural language.

A conversational interface creates a risk of implementing a second independent path for business behavior.

For example, an Assistant that directly writes Sales or Inventory persistence could bypass:

- validation;
- authorization;
- tenant isolation;
- domain invariants;
- transactions;
- auditability.

The initial product does not require generative AI.

## Decision

The Operational Assistant is an interpretation/orchestration interface over existing application capabilities.

Conceptually:

```text
User language
    ↓
Intent recognition
    ↓
Slot/entity resolution
    ↓
Clarification
    ↓
Authorization
    ↓
Confirmation where required
    ↓
Application use case
    ↓
Owning domain
```

The Assistant must not directly mutate another domain's persistence.

The web UI, Assistant, and future integrations should use the same authoritative application/domain capabilities.

Initial Intent recognition should be deterministic and constrained.

A future LLM may improve interpretation but does not receive authority to bypass supported capabilities.

## Consequences

### Positive

- One implementation of business rules.
- Assistant actions obey normal authorization.
- Tenant isolation remains consistent.
- Future AI models can be replaced without rewriting domain behavior.
- Assistant-generated actions remain testable and auditable.
- Natural-language ambiguity can be handled explicitly.

### Negative / trade-offs

- Assistant capabilities are limited to explicitly supported use cases.
- Entity resolution and clarification require deliberate design.
- Arbitrary "agentic" database actions are intentionally prohibited.

### Follow-up

Issue #11 defines the Assistant contract.

M10 implements intents, resolution, confirmation, and execution.

## Alternatives considered

### Assistant writes directly to database

Rejected because it bypasses ownership, invariants, authorization, and transactional consistency.

### LLM owns business rules

Rejected because probabilistic interpretation must not become the source of trusted business semantics.

### Build a second Assistant-specific service layer

Rejected because this would duplicate application behavior already used by other product interfaces.

## References

- `docs/product/product-vision.md`
- `docs/domain/domain-map.md`
- `docs/architecture/cross-cutting-policies.md`