# Manasiness — Cross-Cutting Domain Policies

> **Status:** Active  
> **Milestone:** M0 — Product & Domain Foundation  
> **Scope:** Manasiness V1  
> **Purpose:** Establish cross-cutting rules that every domain and future implementation must respect.

---

# 1. Purpose

Some decisions affect nearly every Manasiness domain.

If Sales, Inventory, Finance, Parties, Purchasing, and Workforce independently invent different conventions for:

- tenant ownership;
- identifiers;
- time;
- deletion;
- history;
- auditability;
- transactions;
- idempotency;
- invariant enforcement;
- cross-domain access;

the product may remain functional initially while becoming increasingly difficult to trust and evolve.

This document defines the common policies that apply across Manasiness V1.

These policies describe required semantics.

They intentionally avoid prematurely specifying:

- ORM implementation;
- NestJS decorators;
- database table layouts;
- middleware;
- event buses;
- queue technologies;
- concrete authentication mechanisms.

Implementation must conform to these policies rather than redefine them.

---

# 2. Policy hierarchy

When implementation decisions conflict, use the following hierarchy:

```text
Product requirements
        ↓
Domain invariants
        ↓
Cross-cutting policies
        ↓
Architectural decisions
        ↓
Implementation convenience
```

Implementation convenience must not silently weaken a product or domain invariant.

---

# 3. Organization is the tenant boundary

`Organization` is the primary tenant boundary for Manasiness business data.

Unless explicitly documented otherwise, operational records belong to exactly one Organization.

Examples include:

```text
Party
Customer Relationship
Supplier Relationship
Worker Relationship
Product
Inventory
Sale
Purchase
Receivable
Payable
Expense
```

Platform-level Identity is the main intentional exception.

An Identity may participate in multiple Organizations through Memberships.

---

# 4. Tenant ownership must be explicit

Organization ownership must never depend only on the currently authenticated session or an implicit global variable.

Every Organization-scoped operation must have an unambiguous Organization context.

Conceptually:

```text
Actor
+
Organization
+
Requested capability
```

must be known before an Organization-scoped mutation is executed.

---

# 5. Cross-tenant references are prohibited by default

An Organization-owned entity must not reference another Organization's private business entity unless a future domain explicitly defines a legitimate cross-Organization concept.

For example:

```text
Organization A Sale
→ Organization B Customer Party
```

is invalid.

Likewise:

```text
Organization A Purchase
→ Organization B Supplier Relationship
```

is invalid.

Global Identity linkage must not weaken this rule.

---

# 6. Tenant isolation is defense in depth

Tenant isolation is too important to rely on one check.

The implementation should eventually enforce it across appropriate layers, such as:

- authorization/application boundaries;
- domain references;
- persistence queries;
- database constraints;
- database security mechanisms where appropriate;
- automated tests.

This policy does not yet mandate PostgreSQL Row Level Security or any specific mechanism.

M1/M3 will decide the implementation.

The invariant is already fixed:

> Cross-Organization reads and writes must fail safely.

---

# 7. Canonical identifiers

Durable domain entities should have stable opaque identifiers.

Identifiers must not derive identity from mutable business attributes such as:

- name;
- email;
- phone;
- SKU description.

An entity's identifier remains stable when its descriptive information changes.

---

# 8. Global uniqueness versus tenant ownership

Durable internal identifiers should be globally unique across the Manasiness system.

Organization ownership remains explicit and must not be inferred from the identifier itself.

Conceptually:

```text
entityId = globally unique
organizationId = explicit tenant ownership
```

Global uniqueness simplifies:

- logs;
- audit records;
- cross-module references;
- debugging;
- data migrations;
- public API evolution.

It does **not** make Organization-owned data globally accessible.

---

# 9. Identifier representation is deferred

M0 does not choose the exact identifier encoding.

Candidates may eventually include UUID-family identifiers or another opaque globally unique representation.

The implementation choice belongs to M1.

The fixed semantic requirements are:

- stable;
- opaque;
- globally unique for durable entities;
- safe for distributed generation if later useful;
- not derived from mutable business information.

---

# 10. Human-readable numbers are not entity identity

Some business documents may later need Organization-scoped human-readable references such as:

```text
SALE-000142
PUR-000091
```

These are business-facing references.

They must not replace the canonical internal identifier.

Conceptually:

```text
Internal ID
≠
Business reference number
```

Rules for business numbering belong to the owning domain.

---

# 11. Canonical time representation

Persisted instants representing when something actually happened should have unambiguous timezone semantics.

The implementation should treat absolute timestamps as points in time independent from display timezone.

The expected architectural direction is:

> persist absolute instants in UTC-equivalent form and convert them for business presentation according to explicit timezone context.

The exact database/TypeScript representation belongs to M1.

---

# 12. Organization timezone

An Organization requires an explicit business timezone for operations where local business date matters.

Examples:

- "sales today";
- daily reports;
- business closing day;
- date-based filtering.

`Today` must never silently mean:

```text
server local timezone
```

It means the relevant Organization's business day.

The detailed Organization-settings implementation belongs to later milestones.

---

# 13. System time versus business time

Manasiness distinguishes technical record timestamps from business-event timestamps.

Technical metadata may include:

```text
createdAt
updatedAt
```

Business events may include concepts such as:

```text
occurredAt
confirmedAt
receivedAt
paidAt
cancelledAt
```

These represent different facts.

They must not be substituted for one another.

---

# 14. `createdAt` semantics

`createdAt` means:

> When Manasiness created this record.

It does not necessarily mean:

- when the Sale happened;
- when merchandise was received;
- when Payment occurred;
- when employment started.

When business occurrence differs from record creation, the domain must represent the business-effective time explicitly.

---

# 15. `updatedAt` semantics

`updatedAt` means:

> When the record's mutable representation was last changed.

It must not be used as the only history mechanism.

It must never replace meaningful business-event timestamps.

---

# 16. Historical timestamps are not rewritten

Later operations must not rewrite when previous business events happened.

For example:

```text
Sale occurred September 1
Payment received September 10
```

must remain:

```text
Sale.occurredAt = September 1
Payment.paidAt   = September 10
```

Payment must not change `Sale.occurredAt` to September 10.

This directly rejects a Legacy behavior identified in Issue #2.

---

# 17. Business-effective dates

Some domains may need both:

```text
recordedAt
```

and:

```text
effectiveAt
```

For example, a business operator may record today an inventory correction that is explicitly effective for an earlier operational date.

Whether backdating is permitted is domain-specific.

The cross-cutting rule is:

> System-recording time and business-effective time must not be conflated.

---

# 18. Deletion is not one universal operation

Manasiness distinguishes:

```text
Deactivate
Archive
End relationship
Soft-delete
Hard-delete
Anonymize
```

These concepts solve different problems.

No universal `deleted = true` behavior should automatically be applied to every domain.

---

# 19. Deactivation

Use **deactivation** when an entity should no longer participate in normal new operations but must remain historically identifiable.

Examples may include:

- Product no longer sold;
- Customer Relationship no longer actively used;
- Supplier Relationship ended.

Deactivation preserves history.

---

# 20. Relationship termination

Relationships with meaningful lifecycles should be explicitly ended rather than deleting the underlying Party.

Example:

```text
Party
├── Customer Relationship → active
└── Supplier Relationship → ended
```

Ending one relationship does not erase the Party or other relationships.

---

# 21. Archival

Archival is primarily an information-management concern.

An archived entity may remain valid historically but be removed from ordinary active workflows or default searches.

Domains may introduce archival where it improves usability.

Archive and delete are not synonyms.

---

# 22. Soft deletion

Soft deletion should not become the default solution for every lifecycle problem.

It may be appropriate when a concept genuinely requires deletion semantics while retaining recoverability or references.

Before adding soft deletion, the owning domain should ask whether the real business operation is actually:

- deactivate;
- cancel;
- end;
- archive;
- reverse.

---

# 23. Hard deletion

Hard deletion is permitted only when historical integrity and legal/product requirements allow it.

Typical candidates may include:

- unreferenced transient records;
- incomplete drafts that have never produced meaningful business consequences;
- temporary security artifacts;
- data subject to an explicitly designed erasure process.

Consequential business records should not normally disappear.

---

# 24. Referenced master data must preserve historical meaning

A historical transaction must remain understandable when referenced master data changes state.

Examples:

```text
Product deactivated
→ old Sale Item remains understandable

Supplier relationship ended
→ old Purchase remains understandable

Worker relationship ended
→ historical attribution remains

Customer deactivated
→ old Receivable remains attributable
```

Master-data lifecycle operations must not conceptually invalidate historical transactions.

---

# 25. Historical business facts should prefer explicit correction

Consequential facts should not be silently overwritten when correcting mistakes.

Depending on the domain, correction may use:

- explicit amendment;
- compensating operation;
- reversal;
- cancellation plus replacement;
- inventory adjustment.

Exact behavior belongs to each owning domain.

The cross-cutting principle is:

> Important history should show that a correction happened.

---

# 26. Auditability

Not every technical change needs a permanent audit record.

However, security-sensitive or financially/operationally consequential mutations should remain attributable.

Examples include:

- authorization changes;
- Membership changes;
- significant Identity-security operations;
- Sale cancellation/correction;
- Purchase cancellation/correction;
- Payment recording/reversal;
- Inventory Adjustment;
- important Finance corrections;
- Party merge if ever implemented.

---

# 27. Actor attribution

A consequential operation should be attributable to an Actor.

Possible Actor categories include:

```text
Identity
System
Integration
```

Future categories may be added deliberately.

`Actor` is not synonymous with Worker.

---

# 28. User-initiated Actor

For authenticated operations, attribution should preserve the Identity responsible for initiating the action.

Where relevant, the context should also preserve:

- Organization;
- Membership/authorization context;
- operation;
- target;
- timestamp.

This allows later questions such as:

> Who cancelled this Sale?

---

# 29. System-initiated Actor

Automated operations must not pretend they were performed by a human.

System-originated work should be attributable as a system Actor with enough context to understand why it happened.

Examples could eventually include:

- scheduled automation;
- reconciliation;
- background processing.

---

# 30. Integration-initiated Actor

Future integrations may initiate operations.

They should have explicit machine/integration attribution rather than impersonating a human Identity unless delegation is explicitly part of the authorization model.

---

# 31. Audit information should be purposeful

Audit records should contain enough information to establish:

- actor;
- Organization context where applicable;
- action;
- affected business object;
- time;
- outcome where useful;
- reason where a domain requires one.

Audit infrastructure must avoid indiscriminately storing:

- passwords;
- secret tokens;
- unnecessary personal information;
- large unbounded request payloads.

Observability and auditing are related but not identical concerns.

---

# 32. Transaction boundary principle

A business command that must preserve several invariants atomically should execute as one transactional unit where the persistence architecture supports it.

Example:

```text
Create/confirm Sale
├── persist authoritative Sale state
├── produce required Inventory consequence
└── establish required Finance consequence
```

If partial completion would leave the system in an invalid business state, the operation requires an atomic strategy.

---

# 33. Transactions follow business commands

Transaction boundaries should align with business use cases rather than arbitrary technical layers.

Avoid thinking of a transaction as:

```text
HTTP request = database transaction
```

or:

```text
repository method = database transaction
```

Instead:

> What business invariants must succeed or fail together?

The application layer is expected to coordinate these boundaries.

---

# 34. Domain ownership survives transactions

A transaction spanning several domains does not transfer ownership.

For example:

```text
Sales + Inventory + Finance
```

may participate in one consistent operation.

Still:

```text
Sales owns Sale rules
Inventory owns inventory rules
Finance owns settlement rules
```

Atomicity must not become justification for cross-domain persistence coupling.

---

# 35. External I/O and transactions

Long-running or unreliable external network calls should not unnecessarily hold database transactions open.

Examples include future:

- email delivery;
- payment-provider calls;
- third-party APIs;
- webhooks.

Where atomic database state and external side effects must coordinate, a deliberate reliability pattern should be chosen later.

M0 does not mandate an outbox or message broker.

---

# 36. Idempotency

A command is **idempotent** when safely retrying the same logical request does not unintentionally duplicate its business effect.

Idempotency matters particularly for state-changing operations that may be retried because of:

- network interruption;
- client timeout;
- browser retry;
- webhook redelivery;
- background-job retry;
- future integration retries.

---

# 37. Idempotency is risk-based

Not every mutation requires a persisted idempotency key.

It is especially important where duplicate execution could produce:

- duplicate Sale;
- duplicate Purchase;
- duplicate Payment;
- duplicate Inventory Movement;
- duplicate external side effect.

The owning application capability must state whether retry safety is required.

---

# 38. External command idempotency

Where retryable external commands can create consequential duplicate state, the system should support a caller-provided or system-generated idempotency identity.

Conceptually, deduplication should include enough scope to distinguish:

```text
Organization
Operation
Idempotency key
```

and, where appropriate, Actor/client context.

Exact persistence and retention strategy belongs to later implementation.

---

# 39. Internal retries

Application services must not assume that a command is executed exactly once merely because the initial V1 deployment is a monolith.

Retry-safe design becomes especially important for:

- background jobs;
- integrations;
- webhooks;
- external payment flows.

These capabilities may appear later without requiring domain redesign.

---

# 40. Invariant enforcement philosophy

Manasiness uses multiple layers of protection.

No single layer is responsible for every invariant.

The intended responsibility split is:

```text
Domain
→ business truth

Application
→ orchestration and use-case policy

Database
→ structural and critical persistence integrity

Presentation
→ user guidance, not authoritative enforcement
```

---

# 41. Domain invariants

The owning domain should express business rules in the place where the business meaning is clearest.

Examples:

- a Sale total must match its valid line calculations;
- Inventory cannot accept an invalid quantity transition according to its policy;
- a Worker Relationship cannot refer to a Company Party;
- a Payment cannot exceed or violate the applicable settlement policy where such a rule exists.

The exact rules are defined by domain-specific M0 issues.

---

# 42. Application policies

The application layer should coordinate concerns such as:

- authorization;
- use-case orchestration;
- transaction scope;
- idempotency;
- calls across domain capabilities;
- loading required state;
- sequencing work.

Application orchestration must not become a second location containing duplicate domain rules.

---

# 43. Database integrity

Persistence should enforce constraints that remain true regardless of which application path performs the write.

Typical examples include:

- referential integrity;
- tenant-qualified references;
- required uniqueness where genuinely invariant;
- impossible structural states;
- critical consistency guards.

Database constraints are defense in depth.

They do not replace explicit domain meaning.

---

# 44. Presentation validation

The UI may validate early to provide fast feedback.

Example:

```text
quantity must be greater than zero
```

But frontend validation is never the authoritative business boundary.

The server/application/domain must still reject invalid commands.

---

# 45. Domain data ownership

Each canonical concept has one owning domain.

The owning domain controls:

- mutation rules;
- lifecycle;
- invariants;
- persistence semantics;
- authoritative write capabilities.

Other domains may consume approved representations or capabilities.

---

# 46. No arbitrary cross-module persistence writes

A module must not directly mutate persistence owned by another domain simply because both currently use the same PostgreSQL database.

Incorrect:

```text
SalesRepository
→ UPDATE inventory tables
```

Preferred conceptual direction:

```text
Sales application use case
→ Inventory capability
→ Inventory-owned mutation
```

Similarly:

```text
Assistant
→ Finance repository
```

is prohibited.

The Assistant invokes an application capability.

---

# 47. Cross-module reads

Read access may be more permissive than write access where doing so improves product performance or reporting.

However, canonical ownership remains explicit.

When another domain requires authoritative business interpretation rather than raw data, it should consume an owned capability/read model instead of rebuilding the rule.

---

# 48. Shared database does not mean shared ownership

The V1 modular monolith may use one PostgreSQL database.

That does not mean every module owns every table.

Conceptually:

```text
one database
≠
one undifferentiated data model
```

Logical ownership remains part of architecture even without physical database separation.

---

# 49. Shared code policy

Generic `shared`, `common`, or `utils` areas must not become dumping grounds for domain logic.

Business behavior belongs to the domain that owns it.

Shared packages may contain genuinely reusable technical primitives such as:

- configuration helpers;
- generic validation infrastructure;
- logging primitives;
- testing utilities.

Moving business logic to `shared` because two modules need it is usually evidence that ownership needs clarification.

---

# 50. Contract evolution

Contracts exposed between modules or to clients should evolve deliberately.

The expected default is:

> Prefer additive compatible evolution where practical.

Breaking changes should be intentional and coordinated.

The exact public API versioning scheme is deferred until an external API requires it.

---

# 51. Persistence evolution

Database evolution must use versioned migrations once persistence is introduced.

Applied production migrations should be treated as historical artifacts.

Do not rewrite old production migration history merely to make the migration directory look cleaner.

Corrections should normally happen through new migrations.

M1 will define tooling and workflow.

---

# 52. Migration safety

Changes affecting existing data should explicitly consider:

- backward compatibility during deployment;
- data transformation;
- default/backfill strategy;
- constraints introduced after backfill where necessary;
- rollback/recovery strategy where relevant.

V1 does not need zero-downtime migration complexity before the deployment model requires it.

It does need disciplined migration history from the beginning.

---

# 53. Historical schema compatibility

Historical business facts must remain interpretable after schema evolution.

A refactor must not make old:

- Sales;
- Purchases;
- Inventory Movements;
- Payments;
- Receivables;
- Payables;

semantically meaningless.

Data migration is part of domain evolution, not only schema mechanics.

---

# 54. Error policy

Expected business rejection and unexpected system failure are different categories.

Examples of expected business rejection:

```text
insufficient stock
unauthorized action
invalid lifecycle transition
ambiguous Party selection
```

Unexpected failures include infrastructure/programming faults.

The exact error contract belongs to M1, but domains should not communicate expected business rejection through arbitrary uncategorized exceptions.

---

# 55. Concurrency

Any invariant that can be broken by concurrent requests must be designed with concurrency in mind.

Examples may include:

- stock mutation;
- document numbering;
- Payment application;
- Membership ownership transfer;
- duplicate command execution.

A check performed before a write is not sufficient if another transaction may change the relevant state concurrently.

The exact locking or concurrency-control strategy belongs to the implementing milestone.

---

# 56. Security-sensitive behavior

Security and tenant isolation are product correctness concerns.

Sensitive operations require:

- authorization;
- tenant context;
- safe defaults;
- appropriate auditability;
- server-side validation.

The absence of frontend access to an action is not authorization.

---

# 57. Observability versus auditability

Observability answers engineering questions such as:

> Why did this request fail?

Auditability answers business/security questions such as:

> Who cancelled this Sale?

They may share correlation information, but neither should be treated as a replacement for the other.

M1 will define logging/observability infrastructure.

---

# 58. Correlation

Operations that span several modules should eventually support correlation across logs and audit records.

The exact correlation/request identifier implementation belongs to M1.

The architectural objective is:

> One business operation should be traceable through its major technical execution path.

---

# 59. Secrets and sensitive information

Secrets must not be persisted casually in:

- logs;
- audit payloads;
- error messages;
- analytics events.

Examples include:

- passwords;
- reset tokens;
- session secrets;
- API keys.

Domain data may itself be sensitive and should be exposed only according to authorization requirements.

---

# 60. Intentionally unresolved decisions

The following decisions are deliberately deferred.

## M1 — Engineering Platform

Resolve:

- concrete identifier representation;
- timestamp/database types;
- migration tooling;
- transaction implementation;
- logging/correlation infrastructure;
- validation/error primitives;
- module packaging conventions;
- testing infrastructure.

## M3 — Identity, Organizations & Access Control

Resolve:

- authentication/session mechanism;
- Membership states;
- authorization model;
- permission representation;
- tenant-context resolution;
- security audit requirements in detail.

## M5 — Catalog & Inventory

Resolve:

- stock concurrency model;
- negative-stock policy;
- inventory balance materialization;
- exact Inventory Movement correction semantics.

## M6 — Finance

Resolve:

- Payment idempotency scope;
- Money precision/rounding;
- Financial Account semantics;
- settlement correction/reversal mechanics.

## M7/M8 — Sales and Purchasing

Resolve:

- exact lifecycle states;
- document numbering;
- historical snapshot fields;
- command-level retry semantics.

## M10 — Operational Assistant

Resolve:

- conversational confirmation policy by risk;
- conversation/session context persistence;
- Assistant command idempotency where required.

---

# 61. Non-goals

This policy does not choose:

- PostgreSQL RLS;
- UUID version;
- NestJS transaction library;
- event sourcing;
- CQRS framework;
- message broker;
- distributed transactions;
- Kafka;
- Redis;
- microservices;
- API versioning strategy;
- observability vendor.

Those choices should be made when their implementation milestone has enough information to justify them.

---

# 62. Decision summary

Manasiness V1 adopts the following cross-cutting principles:

```text
Organization
→ primary tenant boundary

Identifiers
→ stable, opaque, globally unique
→ tenant ownership explicit

Time
→ absolute instants with explicit timezone semantics
→ technical timestamps separate from business timestamps

History
→ consequential facts remain understandable
→ later actions do not rewrite earlier occurrence times

Lifecycle
→ deactivate/archive/end/cancel/delete are different concepts

Deletion
→ hard deletion is exceptional for consequential records

Audit
→ sensitive mutations are attributable to explicit Actors

Transactions
→ align with business invariants that must succeed together

Idempotency
→ required where retries could duplicate consequential effects

Invariants
→ domain owns meaning
→ application orchestrates
→ database protects structural/critical integrity
→ UI improves feedback but is not authoritative

Domain ownership
→ one owner for canonical write rules
→ no arbitrary cross-module persistence writes

Evolution
→ versioned migrations and deliberate contract change
```

These policies are mandatory constraints for later Manasiness design unless superseded by an explicit architectural decision.