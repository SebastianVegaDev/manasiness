# ADR 0005 — Separate operational lifecycle from financial settlement

> **Status:** Accepted  
> **Date:** 2026-09-27

## Context

Legacy uses generic states such as:

```text
pending
paid
canceled
```

to represent several unrelated facts simultaneously.

Payment state controls:

- reporting;
- stock effects;
- transaction status;
- timestamps.

This fails for ordinary real-world situations such as:

```text
goods delivered
customer pays later
```

or:

```text
goods received
supplier paid later
```

## Decision

Commercial/operational lifecycle and financial settlement are separate dimensions.

Examples:

```text
Sale operational lifecycle
≠
Receivable settlement

Purchase lifecycle
≠
Receipt lifecycle
≠
Payable settlement
```

Payments are Finance concepts.

A commercial operation may be operationally complete while financially:

- unpaid;
- partially paid;
- fully paid.

Inventory consequences must follow operational/receipt semantics rather than generic Payment status.

Business-event timestamps must remain independent.

## Consequences

### Positive

- Credit Sales are represented correctly.
- Partial Payments become natural.
- Supplier debt is represented correctly.
- Inventory can reflect physical reality before settlement.
- Reporting can distinguish Sales, cash movement, Receivables, and Payables.
- Payment no longer rewrites commercial history.

### Negative / trade-offs

- More state dimensions must be represented.
- UI must communicate operational and financial status clearly.
- Domain workflows require more explicit rules than one generic status field.

### Follow-up

Issue #7 defines Finance semantics.

Issues #8 and #9 define Sales and Purchasing lifecycles.

## Alternatives considered

### One universal status

Rejected because independent real-world facts cannot be represented reliably.

### Treat Payment as transaction completion

Rejected because physical/commercial execution and settlement often happen at different times.

## References

- `docs/product/legacy-audit.md`
- `docs/domain/domain-map.md`
- `docs/architecture/cross-cutting-policies.md`