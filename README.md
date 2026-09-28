# Manasiness

Manasiness is a multi-tenant business operations product being rebuilt from its domain model outward.

Product scope and business semantics live under [`docs/`](docs/); implementation must conform to those documents rather than redefine them for convenience.

M1 establishes the executable engineering platform before substantial product-domain implementation begins.

## Prerequisites

- Node.js 24.21.0;
- pnpm 12.6.0;
- Git;
- Docker with Docker Compose v2.

The repository pins pnpm through `packageManager` and declares the supported Node range in `package.json`.

```bash
corepack enable pnpm
pnpm --version
```

`pnpm --version` should print:

```text
12.6.0
```

## Install

Install workspace dependencies from the repository root:

```bash
pnpm install
```

The generated `pnpm-lock.yaml` is part of the repository contract and must be committed.

Do not hand-edit it.

## Local PostgreSQL

Start the local PostgreSQL instance:

```bash
pnpm db:up
```

The development PostgreSQL server listens on:

```text
127.0.0.1:5432
```

Local databases are:

```text
manasiness_dev
manasiness_test
manasiness_migration_validation
```

Stop PostgreSQL with:

```bash
pnpm db:stop
```

See PostgreSQL logs with:

```bash
pnpm db:logs
```

Database workflow and migration policy are documented in:

[`packages/database/README.md`](packages/database/README.md)

## Workspace map

```text
apps/
    api/                    # NestJS modular-monolith API runtime.
    web/                    # Next.js App Router web runtime.

packages/
    contracts/              # Shared transport-contract boundary.
    database/               # PostgreSQL/Drizzle infrastructure.
    platform-primitives/    # Canonical technical ID/time primitives.
    eslint-config/          # Shared lint policy.
    typescript-config/      # Shared TypeScript policy.

infra/
    postgres/               # Reproducible local PostgreSQL initialization.

docs/
    product/                # Product vision and legacy migration knowledge.
    domain/                 # Ubiquitous language and domain ownership.
    architecture/           # Cross-cutting architecture policies.
    adr/                    # Durable architecture decisions.
```

## Applications

### `apps/api`

The API is the server-side application runtime.

It is built as a NestJS modular monolith.

Product capabilities should eventually be organized around domain ownership rather than technical-controller groupings or one API module per screen.

The API may depend on explicitly owned workspace packages.

Reusable workspace packages must not depend on application internals.

### `apps/web`

The web application is the browser-facing Manasiness runtime built with Next.js App Router.

UI implementation must consume explicit product and transport boundaries rather than redefine business semantics inside components.

Browser code must never receive server-only secrets.

Runtime and environment boundaries are established separately from product-domain behavior.

## Workspace packages

### `@manasiness/contracts`

Owns shared transport-contract concerns.

It must not become the owner of domain implementation or database infrastructure.

Domain concepts should not be moved into contracts merely because both applications need to reference them.

### `@manasiness/database`

Owns PostgreSQL and Drizzle infrastructure, including:

```text
database connectivity
migration infrastructure
schema physical mappings
database testing infrastructure
```

A shared database does not imply shared business ownership.

Future schemas must continue to respect domain boundaries.

### `@manasiness/platform-primitives`

Owns a deliberately narrow set of technical representations standardized across the system.

Its current ownership is:

```text
EntityId
absolute-instant parsing/serialization
LocalDate
IanaTimeZone
```

It must not become a replacement for a generic:

```text
shared/
common/
utils/
helpers/
```

package.

Business concepts remain with their owning domains.

Transport DTOs remain with `@manasiness/contracts`.

Database infrastructure remains with `@manasiness/database`.

### `@manasiness/eslint-config`

Owns shared ESLint policy.

Application and package-specific configuration may extend that policy without duplicating the entire repository lint setup.

### `@manasiness/typescript-config`

Owns shared TypeScript compiler policy for the repository.

Individual applications and packages extend the appropriate base configuration for their runtime.

## Canonical technical primitives

M1 Issue #29 standardizes identifier and time representations before product-domain tables begin depending on them.

Durable entity identifiers use:

```text
UUIDv7
```

PostgreSQL stores them as:

```text
uuid
```

Application-level textual IDs use canonical lowercase UUID representation.

UUIDv7 identifiers remain opaque to business logic.

Do not derive:

```text
createdAt
business chronology
Organization ownership
entity type
authorization
```

from UUID bits.

Human-readable business references are separate concepts.

For example:

```text
SALE-000142
PUR-000091
```

must never replace canonical durable entity identity.

Absolute application instants use JavaScript:

```text
Date
```

and PostgreSQL:

```text
timestamptz(3)
```

Boundary serialization is normalized to UTC RFC 3339 with exact millisecond precision:

```text
2026-09-28T21:14:10.123Z
```

Date-only concepts use:

```text
YYYY-MM-DD
```

and PostgreSQL:

```text
date
```

They are not represented as arbitrary midnight timestamps.

Business timezone is explicit IANA data such as:

```text
America/Lima
```

and is never inferred from the server environment.

Detailed rules live in:

[`packages/platform-primitives/README.md`](packages/platform-primitives/README.md)

and:

[`packages/database/src/schema/README.md`](packages/database/src/schema/README.md)

The architecture decision is recorded under:

[`docs/adr/`](docs/adr/)

## Root development commands

Run the repository development workflow with:

```bash
pnpm dev
```

Run the complete build with:

```bash
pnpm build
```

Run linting with:

```bash
pnpm lint
```

Run TypeScript validation with:

```bash
pnpm typecheck
```

Run tests with:

```bash
pnpm test
```

Apply repository formatting with:

```bash
pnpm format
```

Verify formatting without modifying files:

```bash
pnpm format:check
```

## Database commands

Start PostgreSQL:

```bash
pnpm db:up
```

Stop PostgreSQL:

```bash
pnpm db:stop
```

Inspect PostgreSQL logs:

```bash
pnpm db:logs
```

Generate Drizzle migrations:

```bash
pnpm db:generate
```

Check Drizzle migration metadata:

```bash
pnpm db:check
```

Apply migrations:

```bash
pnpm db:migrate
```

Reset the development database:

```bash
pnpm db:reset:dev
```

Reset the test database:

```bash
pnpm db:reset:test
```

Validate migration behavior:

```bash
pnpm db:validate
```

Destructive database commands contain additional target checks but should still be treated deliberately.

Never run a destructive database command merely because it is convenient.

## Quality gates

Before opening or merging a pull request, the repository should satisfy the applicable quality gates.

The normal complete validation sequence is:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

Database-related work should additionally validate the database workflow where applicable:

```bash
pnpm db:check
pnpm db:validate
```

A workspace package may also be checked independently while developing it.

For example:

```bash
pnpm --filter @manasiness/platform-primitives lint
pnpm --filter @manasiness/platform-primitives typecheck
pnpm --filter @manasiness/platform-primitives build
pnpm --filter @manasiness/platform-primitives test
```

The root quality gates remain authoritative before integration.

## Migration policy

Migration history is source-controlled architecture.

Do not rewrite an already-applied migration to make current schema state look cleaner.

Schema evolution happens through new migrations.

A schema change may require:

```text
new migration
data backfill
compatibility handling
contract changes
architecture review
```

depending on its impact.

Migration generation should only happen when physical database schema changes actually require it.

Adding a reusable Drizzle mapping helper does not by itself require a migration.

## Engineering direction

Manasiness V1 is a modular monolith.

The repository should optimize for:

```text
clear domain ownership
explicit architectural boundaries
safe evolution
maintainability
testability
operational simplicity
```

rather than unnecessary distribution.

Applications may consume explicitly owned packages, but reusable packages must not depend on application internals.

A shared PostgreSQL database does not imply shared business ownership.

Technical reuse must not erase domain boundaries.

## Domain-first implementation

Before implementing a product capability, start from the business model.

Do not begin with:

```text
screen
→ endpoint
→ table
```

as the primary design process.

Prefer:

```text
business capability
→ domain concepts and invariants
→ ownership boundary
→ persistence needs
→ application use cases
→ transport contract
→ UI
```

The exact implementation will vary by capability, but business semantics should remain upstream of infrastructure convenience.

## Documentation

Before changing a domain, start from the product vision and then read the relevant material under:

```text
docs/product/
docs/domain/
docs/architecture/
docs/adr/
```

Important architecture decisions should be captured as ADRs when they:

```text
affect multiple domains
are expensive to reverse
constrain future implementation
resolve meaningful alternatives
need durable rationale
```

Routine implementation choices do not require ADRs.

Accepted ADRs should preserve their historical decision.

If architecture later changes materially, create a new ADR and supersede the previous one rather than rewriting history.

## Repository discipline

Generated or local-only artifacts must not be committed accidentally.

Examples include:

```text
node_modules/
dist/
.turbo/
local environment files
temporary database files
editor-specific temporary artifacts
```

Before committing, inspect:

```bash
git status
git diff --stat
git diff
git diff --check
```

A pull request should contain only changes belonging to its issue or explicitly documented prerequisite work.

Do not pre-implement later milestones merely because their future shape is already known.

## Current direction

M1 is establishing the engineering platform required for later product work.

The objective is not to maximize the amount of infrastructure.

The objective is to resolve foundational decisions once, make them executable and testable, and then allow future domain milestones to concentrate on business behavior instead of repeatedly reopening repository-wide technical conventions.