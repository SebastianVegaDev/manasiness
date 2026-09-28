# ADR 0009 — Tenant persistence isolation uses explicit context, constraints, and PostgreSQL RLS

> **Status:** Accepted  
> **Date:** 2026-09-28

## Context

Organization is the tenant boundary for Manasiness operational data.

Future Organization-owned domains include concepts such as:

```text
Party
Customer Relationship
Supplier Relationship
Product
Inventory
Sale
Purchase
Receivable
Payable
Expense
Worker Relationship
```

A cross-Organization read or write is a security failure.

Relying on every repository author to remember:

```text
WHERE organization_id = ?
```

is insufficient as the sole isolation mechanism.

At the same time, database Row Level Security alone cannot replace application authorization, domain ownership, or relational integrity.

M1 therefore needs a defense-in-depth strategy before real tenant-owned domain tables appear.

## Decision

Manasiness V1 uses three complementary tenant-persistence controls:

```text
explicit Organization context
+
tenant-qualified relational constraints
+
PostgreSQL Row Level Security
```

The application runtime additionally uses a non-privileged PostgreSQL role that cannot bypass RLS.

## Explicit Organization context

Every Organization-owned application/persistence operation requires an explicit Organization identifier.

Tenant context must not be inferred from:

```text
browser input alone
entity ID
server-global state
database session defaults
host name
process timezone
```

Authentication and Membership authorization determine whether an actor is allowed to operate within that Organization.

Those concerns remain outside this ADR.

This ADR defines persistence behavior after an authoritative Organization context exists.

## Canonical tenant identity

The tenant identifier is the canonical durable identifier of the owning Organization.

Organization persistence itself remains owned by M3.

Issue #31 does not create an Organization table.

A globally unique entity identifier never grants global visibility.

## Tenant database scope

Organization-owned persistence enters the database through:

```text
TenantDatabaseScope
```

The scope:

```text
opens one PostgreSQL transaction
sets manasiness.organization_id transaction-locally
provides the transaction-bound DatabaseExecutor
commits or rolls back
releases the connection
```

The setting uses PostgreSQL transaction-local configuration.

Tenant state therefore disappears automatically when the transaction ends.

## Fail-closed behavior

If no tenant context exists, Organization-owned RLS policies do not match any Organization.

Unscoped application access therefore sees no tenant rows rather than all tenant rows.

The absence of tenant context is not interpreted as:

```text
all Organizations
```

## Row Level Security

Every Organization-owned table uses PostgreSQL Row Level Security.

Policies compare the row's:

```text
organization_id
```

to:

```text
current_setting(
    'manasiness.organization_id',
    true
)
```

Both read visibility and new row values are checked.

Tenant-owned tables require:

```text
ENABLE ROW LEVEL SECURITY
FORCE ROW LEVEL SECURITY
```

## Runtime database role

The application runtime role must not be:

```text
SUPERUSER
BYPASSRLS
database owner
tenant-table owner
schema migration owner
```

The API validates important runtime-role properties during startup and fails when an obviously privileged role is used.

Schema migration credentials and runtime credentials remain separate.

Production role names belong to deployment infrastructure rather than product migrations.

## PostgreSQL privileges and RLS

RLS is an additional restriction over ordinary PostgreSQL privileges.

The runtime role still requires appropriate table-level permissions.

Local development configures migration-owner default privileges so newly created product tables receive normal application DML privileges.

RLS then determines which rows those privileges may affect.

## Tenant-qualified relationships

Organization-owned foreign references should normally include tenant identity.

Conceptually:

```text
parent:
    id
    organization_id

UNIQUE (
    organization_id,
    id
)
```

and:

```text
child:
    organization_id
    parent_id

FOREIGN KEY (
    organization_id,
    parent_id
)
REFERENCES parent (
    organization_id,
    id
)
```

This prevents an Organization A row from referencing an Organization B row.

Global uniqueness of `parent.id` does not replace this relational invariant.

## Domain ownership

Tenant isolation does not make all Organization-owned tables one domain.

For example:

```text
Sales
Inventory
Finance
```

remain independent owners of their behavior and persistence.

RLS protects Organization boundaries.

It does not grant one module permission to write another module's tables.

## Platform-global data

Some concepts may legitimately exist outside Organization scope.

The primary planned example is platform Identity.

A global Identity may participate in several Organizations through Memberships.

Its global existence does not provide global visibility into Organization-owned data.

Unscoped persistence must remain an explicit exception.

## Background and system operations

Background/system work also requires explicit Organization context when operating on tenant-owned data.

There is no hidden:

```text
current Organization
```

global.

A worker processing Organization A must explicitly enter Organization A's database scope.

Cross-Organization administrative/reporting capabilities require a separately designed capability rather than silently omitting the tenant scope.

## RLS does not replace authorization

RLS answers:

```text
Which tenant rows can this database operation touch?
```

Authorization answers:

```text
Is this actor allowed to perform this capability?
```

These are different questions.

M3 remains responsible for:

```text
Identity
Organization
Membership
authorization
```

## RLS does not replace constraints

RLS controls row visibility and row modifications.

Relational constraints still protect structural integrity.

Tenant-qualified foreign keys remain necessary where one tenant-owned table references another.

## Migration requirements

The first migration that introduces an Organization-owned table should include tenant isolation.

Do not introduce:

```text
table now
tenant isolation later
```

as the normal workflow.

Migration review must confirm:

```text
organization_id NOT NULL
tenant-qualified relationships
RLS policy
ENABLE ROW LEVEL SECURITY
FORCE ROW LEVEL SECURITY
runtime privileges
integration coverage
```

## Testing

Tenant isolation is verified using a real non-privileged PostgreSQL runtime role.

Reusable tests should cover:

```text
tenant A reads tenant A
tenant A cannot read tenant B
tenant A cannot write tenant B
missing tenant context fails closed
cross-tenant foreign references fail
same-tenant references succeed
tenant context does not leak through pooling
RLS is enabled
RLS is forced
runtime role cannot bypass RLS
```

Testing RLS while connected as a superuser is not considered valid tenant-isolation testing.

## Alternatives considered

### Application filters only

Rejected as the complete strategy.

Explicit repository filtering remains useful, but a missed predicate could expose another Organization's rows.

Defense in depth requires an independent persistence barrier.

### Schema constraints without RLS

Rejected as the complete strategy.

Composite foreign keys prevent invalid relationships but do not prevent an unfiltered SELECT from returning rows belonging to several Organizations.

### PostgreSQL RLS only

Rejected as the complete strategy.

RLS cannot determine Membership authorization or domain capability rules.

It also does not replace tenant-qualified relational constraints or module ownership.

### One schema/database per Organization

Rejected for V1.

It substantially increases provisioning, migrations, connection management, operations, and cross-tenant platform complexity without a current requirement that justifies the cost.

### Encode tenant into IDs

Rejected.

Canonical IDs remain opaque and globally unique.

Tenant ownership stays explicit.

### Hidden process-global tenant variable

Rejected.

It is unsafe under concurrency and obscures persistence dependencies.

Tenant context must be explicit at the application boundary and transaction-local at the database boundary.

## Consequences

### Positive

- cross-tenant access has multiple independent defenses;
- missing tenant context fails closed;
- query-filter mistakes are less likely to become data leaks;
- cross-tenant relationships are structurally invalid;
- runtime credentials cannot silently bypass RLS;
- tenant state cannot leak through pooled connections;
- future domains receive one clear persistence pattern from their first migration.

### Negative / trade-offs

- tenant persistence requires explicit scope plumbing;
- even simple scoped reads use a short PostgreSQL transaction;
- migrations require RLS review in addition to schema review;
- production infrastructure must provision separate migration and runtime roles;
- cross-Organization administrative capabilities require deliberate exceptions.

These costs are accepted because tenant isolation is a core security invariant.

## Non-goals

This ADR does not implement:

- Authentication;
- sessions;
- Membership authorization;
- Organization persistence;
- Organization settings;
- cross-Organization reporting;
- domain repositories;
- domain-specific schema.

## References

- `docs/architecture/cross-cutting-policies.md`
- `packages/database/README.md`
- `packages/database/src/schema/README.md`
- Issue #31