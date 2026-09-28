# Manasiness Platform Primitives

`@manasiness/platform-primitives` owns a deliberately small set of technical value representations that must remain consistent across multiple Manasiness domains and infrastructure boundaries.

It is not a generic shared-code package.

## Current ownership

This package currently owns:

```text
EntityId
absolute-instant parsing/serialization
LocalDate
IanaTimeZone
```

These representations were standardized by M1 Issue #29 because allowing every future domain to invent them independently would create incompatible persistence and contract semantics.

## What does not belong here

Do not add arbitrary reusable code.

In particular, this package does not own:

```text
Money
currency rules
Organization settings
authorization
pagination
business status enums
DTOs
domain entities
domain validation
Sales helpers
Inventory helpers
Finance helpers
generic utilities
```

Business concepts remain with their owning domains.

Transport contracts remain with `@manasiness/contracts`.

Database infrastructure remains with `@manasiness/database`.

## Canonical durable IDs

Durable Manasiness entities use RFC 9562 UUIDv7.

Create an identifier with:

```typescript
import {
    generateEntityId,
    type EntityId,
} from '@manasiness/platform-primitives';

const id: EntityId = generateEntityId();
```

Parse untrusted textual input with:

```typescript
import {
    parseEntityId,
} from '@manasiness/platform-primitives';

const id = parseEntityId(value);
```

Application-level textual representation is canonical lowercase UUID form:

```text
0199f421-55a4-7c8d-9cab-12d9e50ce741
```

The identifier is opaque to business logic.

Do not derive:

```text
createdAt
business chronology
Organization
entity type
authorization
```

from UUID bits.

UUIDv7's temporal layout exists to provide generation and indexing properties, not domain semantics.

Human-readable references such as:

```text
SALE-000142
PUR-000091
```

are separate business concepts and never replace `EntityId`.

## Absolute instants

JavaScript `Date` is the canonical runtime representation for an absolute instant.

Parse boundary text with:

```typescript
import {
    parseInstant,
} from '@manasiness/platform-primitives';

const occurredAt = parseInstant(
    '2026-09-28T16:14:10.123-05:00',
);
```

Serialize with:

```typescript
import {
    serializeInstant,
} from '@manasiness/platform-primitives';

serializeInstant(occurredAt);
```

which produces canonical UTC RFC 3339 text:

```text
2026-09-28T21:14:10.123Z
```

Serialized instants always have:

```text
explicit timezone
seconds
exactly three fractional digits
```

This matches the repository PostgreSQL `timestamptz(3)` convention and JavaScript millisecond precision.

An explicit non-UTC offset may be accepted at the boundary:

```text
2026-09-28T16:14:10.123-05:00
```

but canonical serialization normalizes the same absolute instant to UTC:

```text
2026-09-28T21:14:10.123Z
```

The original timezone or offset is not retained as part of the instant.

If a business concept needs a timezone, that timezone must be represented separately and explicitly.

## Date-only values

A calendar date without a time-of-day is represented by `LocalDate`.

Example:

```typescript
import {
    parseLocalDate,
} from '@manasiness/platform-primitives';

const businessDate =
    parseLocalDate('2026-09-28');
```

Its canonical textual representation is:

```text
YYYY-MM-DD
```

A date-only value must not be converted into an arbitrary midnight instant.

This is incorrect:

```text
2026-09-28
→ 2026-09-28T00:00:00.000Z
```

because it invents timezone and instant semantics that were not present in the original value.

The distinction is intentional:

```text
LocalDate
→ calendar date

Date
→ absolute instant
```

They are not interchangeable concepts.

## Organization timezone

Business timezone is represented explicitly with an IANA timezone identifier.

Example:

```typescript
import {
    parseIanaTimeZone,
} from '@manasiness/platform-primitives';

const timeZone =
    parseIanaTimeZone('America/Lima');
```

Other examples include:

```text
America/New_York
Europe/Madrid
Asia/Tokyo
```

Business concepts such as:

```text
today
current business day
daily sales
closing date
reporting day
```

must eventually be interpreted using the relevant Organization timezone.

They must not depend on:

```text
operating-system timezone
Node.js server timezone
PostgreSQL session timezone
developer-machine timezone
```

Organization timezone is business configuration.

It is not an infrastructure default.

## Boundary rules

Values entering the trusted application model from an external boundary must be parsed before use.

Examples of external boundaries include:

```text
HTTP request
message payload
CSV import
environment-derived input
external integration
database text where applicable
```

Prefer:

```typescript
const id = parseEntityId(rawId);
const date = parseLocalDate(rawDate);
const instant = parseInstant(rawInstant);
const timeZone = parseIanaTimeZone(rawTimeZone);
```

over unchecked casting such as:

```typescript
const id = rawId as EntityId;
```

A TypeScript brand protects trusted application code from accidentally mixing representations.

It does not validate runtime input by itself.

## Serialization rules

Canonical serialization functions expose stable textual representations at boundaries.

Use:

```text
serializeEntityId()
serializeInstant()
serializeLocalDate()
serializeIanaTimeZone()
```

instead of independently inventing formatting rules in each application or domain.

The canonical forms are:

```text
EntityId
→ lowercase UUIDv7

instant
→ YYYY-MM-DDTHH:mm:ss.sssZ

LocalDate
→ YYYY-MM-DD

IanaTimeZone
→ canonical IANA identifier
```

## Clock behavior

This package deliberately does not introduce a custom global clock or date/time framework.

Application code continues to use standard JavaScript `Date` for absolute instants.

Where deterministic current time is required for a business use case or test, that use case should receive the current time through an appropriate application seam rather than hiding global clock behavior inside this package.

For example, a future application service may receive:

```typescript
now: () => Date
```

or an equivalent application-owned abstraction if the use case requires deterministic time.

That concern does not belong to `platform-primitives` unless future architecture requirements justify a broader decision.

## Package boundary

This package should remain intentionally boring and stable.

Before adding a new primitive here, ask:

1. Is this representation genuinely cross-domain?
2. Is it technical rather than business-specific?
3. Would independent implementations create incompatible system-wide semantics?
4. Is there an accepted architectural reason for centralizing it?

If the answer is no, the concept probably belongs somewhere else.

Do not turn this package into:

```text
shared/
common/
utils/
helpers/
```

under another name.