# ADR 0002 — Use a modular monolith with explicit domain ownership

> **Status:** Accepted  
> **Date:** 2026-09-27

## Context

Manasiness contains multiple interacting business domains:

- Identity & Access;
- Organizations;
- Parties;
- Catalog;
- Inventory;
- Finance;
- Sales;
- Purchasing;
- Workforce;
- Operational Assistant;
- Reporting.

These domains need clear ownership but do not currently justify the operational cost of independent distributed services.

The system should remain easy to develop, test, deploy, and change while preventing the codebase from becoming one undifferentiated application.

## Decision

Manasiness V1 will use a **modular monolith**.

Domains remain logically separated inside the application.

Each canonical concept has one owning domain.

Owning domains control:

- lifecycle;
- invariants;
- authoritative mutations;
- persistence semantics.

Other domains collaborate through explicit application/domain capabilities rather than arbitrary direct writes to another domain's persistence.

A shared database is permitted.

Shared physical infrastructure does not imply shared business ownership.

Module boundaries should be proportional to domain complexity and should not require ceremonial layers where they add no value.

## Consequences

### Positive

- One deployable system remains operationally simple.
- Cross-domain atomic transactions remain practical.
- Domain boundaries improve discoverability.
- Business logic has clear ownership.
- Future extraction remains possible if real scaling requirements appear.
- No premature distributed-system complexity.

### Negative / trade-offs

- Boundary discipline must be enforced by architecture/tests/conventions rather than network isolation.
- Developers must resist convenient direct cross-module persistence access.
- The shared database may tempt accidental coupling.
- Some modules may still require carefully coordinated transactions.

### Follow-up

M1 will establish physical project/module conventions.

Later milestones will implement domain-specific boundaries.

## Alternatives considered

### Microservices from the beginning

Rejected because V1 does not justify:

- network boundaries;
- distributed transactions;
- service discovery;
- independent deployment;
- messaging infrastructure;
- larger observability/operations burden.

### Unstructured monolith

Rejected because Manasiness already contains several business domains with independent rules and lifecycles.

## References

- `docs/domain/domain-map.md`
- `docs/architecture/cross-cutting-policies.md`