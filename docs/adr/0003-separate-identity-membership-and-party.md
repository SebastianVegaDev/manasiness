# ADR 0003 — Separate Identity, Membership, and Party

> **Status:** Accepted  
> **Date:** 2026-09-27

## Context

Legacy conflated several real-world concepts.

`store` represented both business and authentication.

`users` represented:

- customers;
- suppliers;
- workers.

Those concepts have different lifecycles and security requirements.

V1 also requires:

- several Identities per Organization;
- one Identity in multiple Organizations;
- customers without accounts;
- suppliers without accounts;
- workers without accounts;
- future portal access;
- multi-role Parties.

## Decision

Manasiness models the concepts independently:

```text
Identity
→ authentication principal

Membership
→ internal Identity ↔ Organization participation

Organization
→ tenant business

Party
→ Organization-scoped real-world person/company

Customer/Supplier/Worker
→ Party relationships
```

Party records do not require Identity.

Worker does not imply Membership.

Membership does not imply Worker.

Future external customer/supplier portal access must not automatically create internal Membership.

Identity-to-Person-Party association is optional and explicit.

## Consequences

### Positive

- Authentication is decoupled from commercial identity.
- Workers can exist without accounts.
- Customers/suppliers can later receive portal access without data migration.
- One Party can simultaneously be customer and supplier.
- Authorization is not confused with employment.
- Organization business data remains tenant-scoped.

### Negative / trade-offs

- The model contains more concepts than Legacy.
- Linking a real human's Identity and Party requires explicit handling.
- UI must explain account access separately from business relationships.

### Follow-up

M3 implements Identity/Membership behavior.

M4 implements Parties and commercial relationships.

M9 implements Worker Relationship.

## Alternatives considered

### One User entity for everything

Rejected because authentication, employment, and commercial relationships evolve independently.

### Automatically create Identity for every Party

Rejected because most counterparties do not need application access and unnecessary accounts increase complexity/security exposure.

## References

- `docs/domain/ubiquitous-language.md`
- `docs/domain/identity-organizations-parties.md`