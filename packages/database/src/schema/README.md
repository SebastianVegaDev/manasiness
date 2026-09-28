# Database Schema Conventions

This directory is the entry point for future Drizzle PostgreSQL schema declarations.

Database infrastructure owns canonical physical mapping and persistence-safety conventions.

Business domains remain responsible for deciding which business concepts, invariants, relationships, and lifecycle rules require persistence.

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

Application creation normally generates identifiers before persistence.

UUID identity is globally unique but carries no tenant-access meaning.

Knowing an entity ID never grants access to that entity.

## Tenant ownership

Organization-owned records contain an explicit:

```text
organization_id
```

column.

Declare it through:

```typescript
import {
    tenantOrganizationIdColumn,
} from '@manasiness/database/schema';

const organizationId =
    tenantOrganizationIdColumn();
```

Tenant ownership must not be inferred from:

```text
authenticated session state
entity ID
request hostname
browser state
server-global variables
```

The owning Organization is persisted explicitly.

## Platform-global records

Not every table is tenant-owned.

Platform-level concepts such as global Identity may legitimately exist outside an Organization boundary.

A table is unscoped only because its owning domain explicitly defines it as platform-global.

Do not omit `organization_id` merely because adding tenant context is inconvenient.

## Tenant-qualified relationships

References between two Organization-owned tables should normally carry Organization context through the relationship itself.

Parent example:

```text
UNIQUE (
    organization_id,
    id
)
```

Child example:

```text
FOREIGN KEY (
    organization_id,
    parent_id
)
REFERENCES parent (
    organization_id,
    id
)
```

This ensures a child owned by Organization A cannot reference a parent owned by Organization B even when the parent ID is known.

A globally unique ID does not make this constraint redundant.

Global uniqueness answers:

```text
Which entity is this?
```

Tenant qualification answers:

```text
Does this relationship stay inside the owning Organization?
```

Those are different invariants.

## Row Level Security

Organization-owned tables use PostgreSQL Row Level Security.

The baseline policy compares the persisted `organization_id` against the transaction-local Manasiness setting:

```text
manasiness.organization_id
```

The canonical expression is exported as:

```typescript
import {
    currentTenantOrganizationIdSql,
} from '@manasiness/database/schema';
```

Conceptual policy:

```sql
CREATE POLICY example_tenant_isolation
    ON example
    FOR ALL
    TO PUBLIC
    USING (
        organization_id =
        nullif(
            current_setting(
                'manasiness.organization_id',
                true
            ),
            ''
        )::uuid
    )
    WITH CHECK (
        organization_id =
        nullif(
            current_setting(
                'manasiness.organization_id',
                true
            ),
            ''
        )::uuid
    );
```

`USING` protects visibility and mutations of existing rows.

`WITH CHECK` protects newly inserted or updated row values.

## Enable and force RLS

Every Organization-owned table must have both:

```sql
ALTER TABLE example
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE example
    FORCE ROW LEVEL SECURITY;
```

`ENABLE` activates row policies.

`FORCE` also subjects table owners to RLS in ordinary table-owner access.

Runtime connections must additionally use a non-superuser, `NOBYPASSRLS` role.

RLS is not considered correctly installed merely because a policy exists.

## Default deny

If no Organization context is installed, tenant policy evaluation must not grant access.

The canonical setting lookup uses:

```sql
current_setting(
    'manasiness.organization_id',
    true
)
```

Missing context therefore produces no matching tenant value.

Organization-owned persistence should fail closed rather than silently becoming global.

## Runtime role

Application runtime and migration/schema-owner credentials are different concerns.

The application runtime role must not be:

```text
SUPERUSER
BYPASSRLS
database owner
table owner
schema creator
```

Production role names are infrastructure configuration and are not hardcoded into product migrations.

Policies therefore apply to `PUBLIC`; ordinary PostgreSQL privileges still determine whether the runtime role may access the table at all.

RLS further restricts which rows that already-authorized role may access.

## Migration review

When a migration introduces an Organization-owned table, review all of the following before commit:

```text
organization_id NOT NULL
tenant-qualified unique/reference constraints
RLS policy
ENABLE ROW LEVEL SECURITY
FORCE ROW LEVEL SECURITY
runtime DML privilege provisioning
tenant-isolation integration coverage
```

Drizzle supports PostgreSQL RLS policy declarations, but generated migration SQL remains subject to normal migration review.

If the current Drizzle schema DSL does not emit `FORCE ROW LEVEL SECURITY`, add the required statement deliberately to the generated migration before commit.

Do not assume generated SQL provides the complete Manasiness tenant-isolation contract.

## Absolute instant columns

Persist absolute instants with:

```typescript
instantColumn('occurred_at')
```

which maps to:

```text
timestamp(3) with time zone
```

and JavaScript `Date`.

Technical and business timestamps remain separate.

## Technical timestamps

A future schema may declare:

```typescript
createdAt: instantColumn('created_at')
    .notNull()
    .defaultNow(),

updatedAt: instantColumn('updated_at')
    .notNull()
    .defaultNow(),
```

`updatedAt` does not update itself merely because it has an initial default.

Update behavior must remain explicit.

## Date-only columns

Calendar dates without time-of-day use:

```typescript
localDateColumn('business_date')
```

which maps to PostgreSQL:

```text
date
```

Do not represent date-only meaning as midnight `timestamptz`.

## IANA timezone columns

Explicit timezone identifiers use:

```typescript
ianaTimeZoneColumn('time_zone')
```

Organization timezone is business configuration.

It must not be inferred from the database server or process timezone.

## Naming

PostgreSQL uses snake_case:

```text
organization_id
created_at
updated_at
occurred_at
business_date
time_zone
```

TypeScript properties use camelCase.

## Testing requirement

Future Organization-owned tables should include integration coverage that demonstrates at minimum:

```text
tenant A can read tenant A
tenant A cannot read tenant B
tenant A cannot write tenant B
cross-tenant references fail
missing tenant context fails closed
RLS is enabled
RLS is forced
```

`@manasiness/database/testing` provides:

```text
assertTenantTableRlsProtected()
```

for the structural RLS assertions.

The owning domain remains responsible for proving its actual read/write behavior.

## Migration expectations

Identifier, timestamp, tenancy, and relationship conventions should be present from the first migration that introduces a domain table.

Do not plan to retrofit tenant isolation after production data exists.

If these conventions ever change:

```text
new migration
+
explicit data transformation
+
security review
+
compatibility analysis
```

Historical applied migrations are not rewritten.