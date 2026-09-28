# API Domain Modules

This directory is the physical home for future Manasiness business modules.

Do not create empty domain modules merely to mirror the conceptual domain map.

A module should appear here when an implementation issue gives it a concrete responsibility.

## Ownership

A business module owns the behavior associated with its canonical domain concepts.

Depending on its complexity, a module may contain responsibilities such as:

```text
modules/<domain>/
    domain/
    application/
    infrastructure/
    presentation/
```

These folders are not mandatory ceremony.

Create a layer only when the domain actually has behavior that belongs there.

## Domain

Domain code owns business meaning and invariants.

It must not depend on:

- NestJS controllers;
- HTTP request objects;
- database-driver details;
- Drizzle transaction lifecycle;
- browser concepts.

Domain code should not decide when a database transaction begins or commits.

## Application

Application code coordinates business use cases.

It is the appropriate place for responsibilities such as:

- use-case orchestration;
- authorization coordination;
- transaction boundaries;
- collaboration between module-owned capabilities.

Transaction scope follows the business command.

For example, a future command may conceptually require:

```text
Confirm Sale
    ↓
one transaction
    ├── persist authoritative Sales consequence
    ├── persist Inventory consequence
    └── persist Finance consequence
```

The application capability owns whether those consequences must succeed or fail together.

A transaction spanning several modules does not transfer ownership between those modules.

## Database access

The API platform exposes two distinct database capabilities:

```text
DATABASE_EXECUTOR
DATABASE_TRANSACTION_RUNNER
```

`DATABASE_EXECUTOR` is the normal persistence execution boundary.

`DATABASE_TRANSACTION_RUNNER` opens an explicit application-owned transaction.

Persistence adapters should accept a `DatabaseExecutor` for the operation they perform.

Conceptually:

```typescript
async save(
    executor: DatabaseExecutor,
    entity: Entity,
): Promise<void> {
    // Drizzle query using executor.
}
```

That executor may be:

```text
normal database executor
```

or:

```text
transaction-bound executor
```

The persistence logic should not need two implementations.

## Transaction ownership

A repository or persistence adapter must not start an independent top-level transaction when the application use case owns atomicity.

Avoid:

```text
Controller
    ↓
repositoryA.transaction()
repositoryB.transaction()
```

and avoid:

```text
Repository method
    ↓
always starts a new transaction
```

Prefer:

```text
Application use case
    ↓
transactionRunner.run(...)
    ↓
shared transaction executor
    ├── module-owned persistence A
    └── module-owned persistence B
```

## Nested transactions

Manasiness does not currently support nested application transaction boundaries.

If code is already executing inside:

```text
DatabaseTransactionRunner.run(...)
```

it must reuse the provided transaction executor.

It must not call the transaction runner again.

This rule is deliberate even though the underlying database/ORM may support savepoints.

Nested/savepoint semantics should only become part of the application contract when a concrete business requirement justifies them.

## Transaction context lifetime

A transaction executor belongs only to the callback in which it was provided.

Do not:

- store it in singleton state;
- cache it;
- return it from the transaction callback;
- use it from detached background work;
- use it after the transaction callback has completed.

Every database operation participating in the transaction must be awaited before the callback returns.

## Controllers

Controllers and other transport adapters translate external interactions into application capabilities.

Controllers must not:

- own business invariants;
- manually call `BEGIN`, `COMMIT`, or `ROLLBACK`;
- coordinate several repositories directly;
- write another module's persistence.

HTTP request lifetime is not automatically a transaction lifetime.

A transaction exists because a business command requires atomicity.

## Infrastructure

Infrastructure contains replaceable technical adapters required by the owning module.

Examples may eventually include:

- persistence adapters;
- external integrations;
- framework adapters.

Infrastructure does not own domain semantics merely because it performs I/O.

A persistence adapter owns the physical persistence implementation for its module.

It does not own the application transaction boundary.

## Cross-module collaboration

One module must not write another module's persistence directly.

If Module A needs behavior owned by Module B, it should collaborate through an explicit capability owned by Module B.

For example:

```text
Sales application use case
    ↓
Inventory-owned capability
```

is preferable to:

```text
Sales repository
    ↓
UPDATE inventory_tables
```

even when both operations participate in the same PostgreSQL transaction.

A shared PostgreSQL database does not make persistence ownership shared.

## External I/O

Long-running or unreliable external I/O should not be performed unnecessarily while holding a database transaction open.

Examples include:

- email delivery;
- HTTP calls to third parties;
- webhooks;
- payment-provider calls;
- remote file uploads.

If database state and an external side effect eventually require reliable coordination, that requirement must receive an explicit architecture solution.

Issue #30 does not introduce sagas, distributed transactions, or an outbox.

## Platform boundary

Cross-cutting process and database infrastructure belongs under `src/platform/`.

`platform/` must not become a generic location for business behavior.

Likewise, do not create generic repository areas such as:

```text
shared/
common/
utils/
```

to bypass explicit ownership.