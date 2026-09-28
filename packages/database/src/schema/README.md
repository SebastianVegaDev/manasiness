# Database Schema Conventions

This directory is the entry point for future Drizzle PostgreSQL schema declarations.

Database infrastructure owns physical mapping conventions.

Business domains remain responsible for deciding which business concepts and relationships need persistence.

The conventions in this directory standardize physical representations that should not be reinvented independently by every future domain schema.

## Canonical identifiers

Durable entity identifiers use PostgreSQL's native:

```text
uuid
```

type.

Declare them through:

```typescript
import {
    entityIdColumn,
} from '@manasiness/database/schema';

const id = entityIdColumn('id')
    .primaryKey()
    .notNull();
```

Application creation normally generates identifiers before persistence:

```typescript
import {
    generateEntityId,
} from '@manasiness/platform-primitives';

const id = generateEntityId();
```

This allows identity to exist before an `INSERT` succeeds.

It also keeps normal application identity generation independent from a database sequence or successful persistence operation.

PostgreSQL 18 supports `uuidv7()` for deliberate database-side operations or migrations that need to generate the same canonical UUID version.

Database-side UUID generation should not become an implicit alternative convention for normal application flows.

## Identifier opacity

UUIDv7 includes temporal information structurally.

That information is not business state.

Do not infer:

```text
createdAt
business chronology
tenant ownership
Organization
entity type
authorization
```

from the identifier.

If one of those facts matters, represent it explicitly.

For example:

```text
id
organization_id
created_at
occurred_at
```

remain separate pieces of data.

Likewise, this is not an acceptable substitute for business chronology:

```sql
ORDER BY id
```

when the actual question is chronological.

Use the timestamp representing the concept being queried:

```sql
ORDER BY occurred_at
```

or:

```sql
ORDER BY created_at
```

as appropriate.

## Human-readable references

Canonical durable identity is separate from human-facing numbering.

Values such as:

```text
SALE-000142
PUR-000091
INV-000731
```

may eventually exist when an owning domain requires them.

They do not replace UUID entity identifiers.

Business numbering has different concerns, including:

```text
display
sequence scope
Organization scope
legal requirements
reset rules
concurrency
human communication
```

Those rules belong to the relevant business domain rather than the canonical entity ID primitive.

## Absolute instant columns

Persist authoritative absolute instants with:

```typescript
instantColumn('occurred_at')
```

which maps to:

```text
timestamp(3) with time zone
```

and a JavaScript `Date`.

PostgreSQL's common shorthand for the same type is:

```text
timestamptz(3)
```

The precision is deliberately fixed at milliseconds.

JavaScript `Date` represents epoch milliseconds, while PostgreSQL supports finer timestamp precision.

Using `timestamptz(3)` prevents the database from retaining precision that the standard application runtime cannot round-trip exactly.

## Why timezone-aware timestamps

Authoritative instants represent one point on the global timeline.

Examples include:

```text
record creation
payment occurrence
confirmation
receipt
cancellation
inventory movement occurrence
authentication event
```

These must not depend on whichever timezone happens to be configured on:

```text
the PostgreSQL server
the PostgreSQL session
the Node.js process
the operating system
a developer workstation
```

For authoritative instants, do not introduce:

```text
timestamp without time zone
```

unless a later accepted architecture decision identifies a genuinely different semantic requirement.

## Technical timestamps

A future schema may declare technical timestamps as:

```typescript
createdAt: instantColumn('created_at')
    .notNull()
    .defaultNow(),

updatedAt: instantColumn('updated_at')
    .notNull()
    .defaultNow(),
```

`defaultNow()` on `updatedAt` supplies only its initial value.

It does not automatically update the column on later modifications.

Any update behavior must be explicit.

Do not assume Drizzle or PostgreSQL will automatically maintain `updated_at` simply because an initial default exists.

## Technical versus business timestamps

Technical record metadata and domain event time are separate concepts.

For example:

```text
created_at
→ when Manasiness persisted the Sale record

occurred_at
→ when the Sale happened

confirmed_at
→ when confirmation happened

paid_at
→ when payment happened

cancelled_at
→ when cancellation happened
```

These values may sometimes be equal.

That does not make them semantically interchangeable.

Do not substitute:

```text
created_at
updated_at
```

for an actual domain event merely because those columns already exist.

A later modification must also not rewrite the timestamp of an earlier business event.

## UTC and PostgreSQL

`timestamptz` represents an absolute instant.

PostgreSQL may display that instant according to the current session timezone, but session rendering does not change the stored instant.

Application serialization remains responsible for producing the canonical wire representation:

```text
YYYY-MM-DDTHH:mm:ss.sssZ
```

through the platform primitive boundary.

Database session timezone must therefore never become the source of business timezone semantics.

## Date-only columns

Calendar dates without a time-of-day use:

```typescript
localDateColumn('business_date')
```

which maps to PostgreSQL:

```text
date
```

and application `LocalDate`:

```text
YYYY-MM-DD
```

Examples of concepts that may eventually be date-only include:

```text
business date
due date
document date
birth date
scheduled calendar day
```

depending on the owning domain's semantics.

Do not persist date-only meaning as midnight `timestamptz`.

For example, this transformation is conceptually unsafe:

```text
2026-09-28
→ 2026-09-28T00:00:00.000Z
```

because the original date did not specify either an instant or timezone.

## IANA timezone columns

Explicit timezone identifiers use:

```typescript
ianaTimeZoneColumn('time_zone')
```

which maps to PostgreSQL text and application `IanaTimeZone`.

Examples include:

```text
America/Lima
America/New_York
Europe/Madrid
```

The application validates timezone identifiers before persistence.

A timezone identifier is configuration or domain data.

It is not inferred from:

```text
PostgreSQL server timezone
PostgreSQL session timezone
Node.js process timezone
operating-system timezone
developer-machine timezone
```

Persistence of Organization timezone settings remains the responsibility of the milestone that owns Organization configuration.

## Column helper responsibility

The helpers in this directory standardize physical representation.

They do not decide whether a domain needs a particular field.

For example:

```text
instantColumn()
```

defines how an absolute instant should map to PostgreSQL.

It does not mean every entity needs:

```text
occurred_at
confirmed_at
paid_at
cancelled_at
```

Those decisions belong to domain modeling.

Likewise:

```text
entityIdColumn()
```

standardizes durable identifier storage.

It does not create domain-specific identities such as:

```text
OrganizationId
CustomerId
SaleId
PurchaseId
```

Those remain future domain concerns.

## Naming

Column names follow snake_case in PostgreSQL:

```text
created_at
updated_at
occurred_at
business_date
time_zone
organization_id
```

TypeScript properties use normal camelCase:

```text
createdAt
updatedAt
occurredAt
businessDate
timeZone
organizationId
```

Do not leak PostgreSQL naming conventions into TypeScript merely to avoid mapping.

## Nullability

Column helpers do not universally decide nullability.

Whether a value is:

```text
required
optional
conditionally present
immutable after creation
```

is a domain decision.

Apply `.notNull()` only when the owning schema's semantics require it.

For example:

```typescript
id: entityIdColumn('id')
    .primaryKey()
    .notNull(),
```

may be appropriate for durable entity identity.

A domain event such as:

```text
paid_at
```

could legitimately remain nullable until payment occurs.

The primitive mapping should not encode that business lifecycle.

## Defaults

Defaults are also semantic decisions.

The presence of:

```text
instantColumn()
entityIdColumn()
localDateColumn()
```

does not mean every field should have a database default.

Prefer explicit application-generated entity IDs for normal application creation.

Use database defaults only when their behavior is deliberate and consistent with the owning use case.

Similarly, `defaultNow()` is appropriate only when database insertion time truly represents the intended value.

Never use `defaultNow()` as a shortcut for a business event whose actual occurrence time should be provided explicitly.

## Migration expectations

Changing an identifier or timestamp representation after domain tables exist is a schema migration.

Do not rewrite already-applied migrations if these conventions ever evolve.

Any future change requires:

```text
new migration
+
data migration/backfill where necessary
+
contract compatibility analysis
+
explicit architecture review
```

Issue #29 introduces these conventions before product-domain tables depend on them.

Therefore this issue does not require a new migration.

The existing migration baseline remains unchanged.

## Schema ownership

A shared PostgreSQL database does not imply shared domain ownership.

Future schema files should remain aligned with the owning business modules.

Cross-domain technical primitives may be centralized here only when an accepted architecture decision establishes one system-wide representation.

Keep the distinction clear:

```text
domain decides meaning
database package decides physical mapping
platform-primitives defines canonical technical runtime representation
```

That boundary should remain stable as the product grows.