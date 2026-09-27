# Manasiness Architecture Decision Records

Architecture Decision Records document consequential decisions whose rationale should remain understandable after the original implementation context has disappeared.

ADRs are intended for decisions that:

- affect several domains or milestones;
- are expensive to reverse;
- constrain future architecture;
- resolve meaningful alternatives;
- require future contributors to understand why a particular direction was chosen.

ADRs should **not** be created for ordinary coding preferences.

Examples that normally do not need an ADR:

- naming a local variable;
- selecting a minor utility;
- formatting preferences;
- routine refactoring.

---

## Naming

Use:

```text
NNNN-kebab-case-title.md
```

Example:

```text
0004-explicit-inventory-movement-history.md
```

Numbers are monotonic and are not reused.

---

## Status

Each ADR uses one of:

- `Proposed`
- `Accepted`
- `Deprecated`
- `Superseded`
- `Rejected`

An accepted ADR should not normally be rewritten to hide the original decision.

If the architecture changes materially, create a new ADR and mark the previous one as superseded.

Minor wording corrections that do not change the decision are acceptable.

---

## Required sections

Each ADR should contain:

1. Title
2. Status
3. Date
4. Context
5. Decision
6. Consequences
7. Alternatives considered
8. References where useful

---

## Decision scope

An ADR describes **why and what** was decided.

Implementation documentation describes **how** the current code realizes that decision.

Avoid embedding large implementation tutorials into ADRs.

---

## Source-of-truth relationship

Architecture decisions must remain compatible with:

```text
Product Vision
→ Ubiquitous Language
→ Domain Map
→ Domain policies
→ ADRs
→ Implementation
```

An ADR cannot silently redefine product/domain semantics.

If a new architectural decision requires changing an earlier domain decision, update the relevant domain documentation explicitly.

---

## Initial ADR index

| ADR | Decision | Status |
|---|---|---|
| 0001 | Organization is the tenant boundary | Accepted |
| 0002 | Use a modular monolith with explicit domain ownership | Accepted |
| 0003 | Separate Identity, Membership, and Party | Accepted |
| 0004 | Preserve inventory history through explicit movements | Accepted |
| 0005 | Separate operational lifecycle from financial settlement | Accepted |
| 0006 | Operational Assistant executes application capabilities | Accepted |