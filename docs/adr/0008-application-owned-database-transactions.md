# ADR 0008 — Application-owned database transaction boundaries

> **Status:** Accepted  
> **Date:** 2026-09-28

## Context

Manasiness is a modular monolith backed by one primary PostgreSQL database.

Future business commands may need to coordinate persistence consequences owned by several modules.

For example:

```text
Confirm Sale
├── persist authoritative Sales state
├── produce Inventory consequence
└── establish Finance consequence
```

Partial completion could violate business invariants.

M0 therefore requires atomicity where several consequences must succeed or fail together.

At the same time, transaction support must not weaken domain ownership.

A shared PostgreSQL transaction must not become justification for:

```text
Sales
→ direct writes to Inventory persistence
```

or for every repository to independently decide transaction behavior.

## Decision

Top-level database transactions are owned by application use cases.

The application layer decides which persistence consequences belong to one atomic business command.

Manasiness exposes a small:

```text
DatabaseTransactionRunner
```

rather than a generic Unit of Work or repository registry.

Conceptually:

```text
application capability
    ↓
DatabaseTransactionRunner
    ↓
transaction-bound DatabaseExecutor
    ├── module-owned persistence operation
    ├── module-owned persistence operation
    └── module-owned persistence operation
```

## Database executor

Persistence operations accept a:

```text
DatabaseExecutor
```

The same persistence implementation can therefore operate with:

```text
normal database executor
```

or:

```text
transaction-bound executor
```

without duplicating queries.

The executor intentionally does not expose transaction creation as part of the persistence-adapter contract.

## Repository behavior

Repositories and persistence adapters do not own top-level transaction boundaries.

A repository must not automatically start a transaction simply because one method performs a write.

If several operations need atomicity, the application capability opens one transaction and supplies its executor to the participating adapters.

## Controller behavior

Controllers do not own business transaction boundaries.

This mapping is rejected:

```text
one HTTP request
=
one database transaction
```

A transaction exists because a business invariant requires atomicity, not because transport happened to use HTTP.

## Connection model

A transaction checks out one node-postgres client from the application pool.

All operations within that transaction execute through a Drizzle client bound to that same checked-out client.

This preserves PostgreSQL transaction semantics because a transaction belongs to one physical database session.

## Commit and rollback

The transaction runner follows:

```text
acquire client
↓
BEGIN
↓
execute application callback
↓
COMMIT
↓
release client
```

When application execution fails:

```text
application failure
↓
ROLLBACK
↓
release client
↓
propagate original failure
```

The checked-out client is released in a `finally` path.

Failures that make the transaction-control state unreliable cause the client to be destroyed rather than returned to the pool.

## Isolation

The V1 baseline is:

```text
READ COMMITTED
READ WRITE
```

A stronger isolation level is not selected globally without a concrete concurrency invariant that requires it.

Future capabilities may introduce explicit transaction options when justified.

## Nested transactions

Nested application transaction boundaries are prohibited.

Code already operating inside a transaction must reuse the supplied transaction executor.

Although PostgreSQL and Drizzle can implement nested behavior with savepoints, Manasiness does not expose savepoint semantics without a concrete business requirement.

This avoids ambiguous behavior such as:

```text
inner rollback
+
outer continuation
```

being introduced accidentally by technical layering.

A future requirement for savepoints requires an explicit architecture change.

## Transaction context lifetime

Transaction executors must not escape their transaction callback.

They must not be:

- persisted;
- cached;
- stored in singleton state;
- returned to callers;
- used from detached asynchronous work;
- reused after commit or rollback.

Every database operation participating in a transaction must complete before the transaction callback resolves.

## Error propagation

When an application operation fails and rollback succeeds, the original error is propagated.

Rollback does not replace the business/application failure with a generic transaction error.

If rollback also fails, both failures are preserved because transaction cleanup itself has become an infrastructure failure.

## Domain ownership

A shared transaction does not create shared domain ownership.

For example:

```text
Sales + Inventory + Finance
```

may participate in one transaction.

Still:

```text
Sales owns Sales behavior and persistence
Inventory owns Inventory behavior and persistence
Finance owns Finance behavior and persistence
```

Cross-domain orchestration belongs to the application layer.

Direct cross-domain table mutation remains prohibited.

## External I/O

Long-running or unreliable external I/O should not unnecessarily occur while holding a database transaction open.

Examples include:

- third-party HTTP requests;
- email delivery;
- webhooks;
- payment-provider calls;
- remote object storage.

If external effects later need reliable coordination with committed database state, a deliberate reliability pattern must be chosen.

This ADR does not introduce distributed transactions, sagas, or an outbox.

## Testing

Transaction infrastructure is verified against a real PostgreSQL test database.

Integration tests cover:

```text
commit
rollback
atomic rollback
connection reuse
nested transaction rejection
isolation baseline
```

Tests use a single-connection pool where useful so connection leaks become observable.

## Consequences

### Positive

- application use cases own atomicity explicitly;
- repositories remain reusable inside and outside transactions;
- one transaction can span several module-owned capabilities;
- database connections have one auditable lifecycle;
- controllers remain transport adapters;
- transaction infrastructure does not become a domain service locator;
- domain ownership survives cross-module atomicity.

### Negative / trade-offs

- application orchestration must explicitly pass transaction executors;
- transaction context cannot be treated as implicit global state;
- nested/savepoint behavior is unavailable until deliberately introduced;
- code must avoid letting transaction-bound executors escape their callback lifetime.

## Alternatives considered

### Repository-owned transactions

Rejected because repository methods cannot know the complete business invariant that may span several repositories/modules.

### Controller-owned transactions

Rejected because HTTP request boundaries are transport concerns rather than business atomicity boundaries.

### Generic Unit of Work with repository registry

Rejected because it would centralize domain persistence behind one generic service locator and weaken module ownership.

### Implicit global transaction context

Rejected for the initial architecture.

Automatically resolving the current transaction from hidden async context would make transaction participation less explicit and harder to reason about.

Async context is used only to detect prohibited nested transaction boundaries.

### Nested/savepoint transactions

Deferred.

The underlying stack supports them, but no current business requirement justifies exposing their semantics.

### Distributed transactions

Rejected for V1.

Manasiness is a modular monolith using one primary PostgreSQL database.

## References

- `docs/architecture/cross-cutting-policies.md`
- `packages/database/README.md`
- `apps/api/src/modules/README.md`
- Issue #30