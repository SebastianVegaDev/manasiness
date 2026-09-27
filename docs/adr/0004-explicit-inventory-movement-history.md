# ADR 0004 — Preserve inventory history through explicit movements

> **Status:** Accepted  
> **Date:** 2026-09-27

## Context

Legacy primarily represents inventory using mutable `Product.stock`.

Stock also changes according to generic `paid` states on Sales and supplier Orders.

This makes current quantity available but does not provide a canonical answer to:

> Why is stock this quantity?

V1's product vision requires operational traceability.

## Decision

Inventory quantity changes must be represented through explicit Inventory Movements or equivalent Inventory-owned historical facts.

Examples include:

- purchase receipt;
- Sale fulfillment;
- customer return;
- supplier return;
- loss;
- damage;
- adjustment;
- correction.

A current Stock Balance may be stored/materialized for efficiency.

It is not the only historical source of explanation.

Ordinary Product editing must not silently modify inventory quantity.

Inventory owns quantity invariants.

Sales and Purchasing request Inventory capabilities rather than directly mutating stock.

## Consequences

### Positive

- Stock becomes explainable.
- Corrections preserve history.
- Reports and audits can understand inventory movement.
- Future warehouses/locations can evolve from a sound model.
- Sales/Payment semantics no longer control stock accidentally.

### Negative / trade-offs

- Inventory implementation is more complex than one mutable integer.
- Balance consistency must be protected transactionally.
- High-volume systems may eventually require projections/materialization strategies.

### Follow-up

Issue #6 defines detailed Catalog/Inventory semantics.

M5 implements the model and concurrency behavior.

## Alternatives considered

### `Product.stock` as sole source of truth

Rejected because it cannot explain changes and encourages silent mutation.

### Reconstruct stock only from Sales/Purchases

Rejected because not every real stock change is a Sale or Purchase and correction/loss/return behavior requires explicit inventory semantics.

## References

- `docs/product/product-vision.md`
- `docs/product/legacy-audit.md`
- `docs/domain/domain-map.md`