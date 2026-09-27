# ADR 0001 — Organization is the tenant boundary

> **Status:** Accepted  
> **Date:** 2026-09-27

## Context

Manasiness is a multi-tenant SaaS.

Legacy used `store` as both:

- business;
- login principal;
- tenant.

V1 separates authentication Identity from the business itself.

The product needs one explicit boundary that determines ownership and isolation of operational business data.

## Decision

`Organization` is the primary tenant boundary for Manasiness V1.

Unless explicitly documented otherwise, business-domain records belong to exactly one Organization.

Examples include:

- Parties;
- Products;
- Inventory;
- Sales;
- Purchases;
- Workforce;
- Finance.

Identity is platform-level and may participate in multiple Organizations through Memberships.

Tenant isolation must use defense in depth rather than depending on a single application check.

The exact persistence/security mechanisms are deferred to M1 and M3.

## Consequences

### Positive

- Tenant ownership is explicit.
- One Identity may operate several businesses.
- Several Identities may operate one business.
- Business data has a clear isolation boundary.
- Authorization can always be evaluated in Organization context.
- Future customer/supplier access does not require redesigning Organization ownership.

### Negative / trade-offs

- Organization context must be propagated consistently.
- Queries and references require tenant-awareness.
- Testing must explicitly cover cross-tenant isolation.
- Some globally shared concepts require careful separation from Organization-owned concepts.

### Follow-up

M1/M3 will define:

- persistence enforcement;
- Organization-context propagation;
- authorization;
- tenant-isolation tests;
- possible database-level isolation mechanisms.

## Alternatives considered

### Store/account as tenant

Rejected because it conflates authentication with business ownership and prevents proper multi-user/multi-Organization access.

### Global business data with authorization filters only

Rejected because ownership becomes ambiguous and accidental cross-tenant access becomes easier.

## References

- `docs/product/product-vision.md`
- `docs/domain/domain-map.md`
- `docs/domain/identity-organizations-parties.md`