# Manasiness

Manasiness is a multi-tenant business operations platform being rebuilt from its domain model outward.

The repository contains the executable product and engineering platform.

The canonical product definition lives in:

[`docs/product/product-vision.md`](docs/product/product-vision.md)

Implementation must conform to the product/domain model rather than redefine business semantics for implementation convenience.

## Engineering direction

Manasiness V1 is a modular monolith.

The repository optimizes for:

```text
clear domain ownership
explicit architectural boundaries
safe evolution
maintainability
testability
operational simplicity
```

rather than unnecessary distribution.

The governing source-of-truth hierarchy is:

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

Implementation convenience must never silently weaken a product requirement or domain invariant.

The canonical cross-cutting policies live in:

[`docs/architecture/cross-cutting-policies.md`](docs/architecture/cross-cutting-policies.md)

## Repository map

```text
apps/
    api/
        NestJS modular-monolith API runtime.

    web/
        Next.js App Router web runtime.

packages/
    contracts/
        Shared transport-contract schemas and wire-level types.

    database/
        PostgreSQL, Drizzle, migration, transaction, tenant-scope,
        and database-testing infrastructure.

    platform-primitives/
        Canonical technical identifier and time representations.

    eslint-config/
        Shared repository ESLint policy.

    typescript-config/
        Shared TypeScript compiler policy.

docs/
    product/
        Product vision and legacy-product knowledge.

    domain/
        Ubiquitous language, domain ownership, boundaries,
        invariants, and domain-specific rules.

    architecture/
        Cross-cutting technical/domain policies.

    adr/
        Architecture Decision Records.

infra/
    postgres/
        Reproducible local PostgreSQL initialization.

tests/
    e2e/
        Cross-application Playwright browser journeys.

.github/
    workflows/
        CI and repository automation.
```

A new top-level directory or broadly shared package requires a clear responsibility and owner.

Do not introduce generic buckets such as:

```text
shared/
common/
utils/
helpers/
```

merely because code is used in more than one place.

## Application ownership

### `apps/api`

`apps/api` is the server-side application runtime.

It uses NestJS as a modular monolith.

Product capabilities belong to explicit domain modules.

Controllers are transport adapters.

They must not become owners of:

```text
business invariants
transaction policy
cross-domain orchestration
persistence ownership
```

A module must not arbitrarily modify another module's persistence.

Cross-domain work happens through explicit application capabilities.

### `apps/web`

`apps/web` is the browser-facing application built with Next.js App Router.

The Web consumes explicit application/transport boundaries.

It must not:

```text
import backend implementation modules
import @manasiness/database
connect directly to PostgreSQL
duplicate backend business rules
treat cached server state as canonical business state
```

Web-to-API transport conventions live under:

```text
apps/web/src/platform/api/
```

Browser server state uses TanStack Query.

Server-side API access and browser API access remain separate because their network and secret boundaries are different.

### `packages/contracts`

`@manasiness/contracts` owns shared transport-facing schemas.

Examples:

```text
request schemas
response schemas
API error contracts
transport IDs
operational health responses
```

It does not own:

```text
domain entities
repositories
business invariants
authorization
database infrastructure
NestJS implementation
```

Shared transport contracts are not shared domain models.

### `packages/database`

`@manasiness/database` owns PostgreSQL/Drizzle infrastructure.

Responsibilities include:

```text
database connectivity
transaction execution
migration infrastructure
physical schema mappings
tenant database scope
RLS support
database testing infrastructure
```

A shared physical database does not imply shared business ownership.

### `packages/platform-primitives`

`@manasiness/platform-primitives` owns narrowly standardized technical representations such as:

```text
EntityId
absolute instants
LocalDate
IANA time zones
```

It must not become a generic shared-code package.

### `packages/eslint-config`

Owns repository-wide ESLint policy.

Workspace-specific configuration may extend it without recreating repository policy.

### `packages/typescript-config`

Owns shared TypeScript compiler policy.

Applications/packages extend the configuration appropriate for their runtime.

## Documentation map

Start with the smallest relevant documentation set instead of reading every file.

### Product

```text
docs/product/product-vision.md
docs/product/legacy-audit.md
```

Use these to understand what Manasiness is and which legacy concepts should or should not survive.

### Domain

```text
docs/domain/
```

Read the relevant domain document before changing business semantics.

Domain documentation owns vocabulary, conceptual boundaries, and invariants.

### Cross-cutting architecture

```text
docs/architecture/
```

Read relevant policies when a change affects several modules/domains or platform-wide behavior.

### ADRs

```text
docs/adr/
```

ADRs preserve consequential architecture decisions and their rationale.

Do not rewrite accepted ADR history to make current architecture appear cleaner.

If a decision changes materially:

```text
create a new ADR
        ↓
supersede the previous ADR
```

## Prerequisites

Required local tooling:

```text
Node.js 24.21.0
pnpm 12.6.0
Git
Docker
Docker Compose v2
```

The supported Node version is pinned by:

```text
.nvmrc
package.json#engines
```

pnpm is pinned by:

```text
package.json#packageManager
```

Enable Corepack when necessary:

```powershell
corepack enable
```

Verify:

```powershell
node --version
pnpm --version
docker --version
docker compose version
```

## First-time setup

Install dependencies:

```powershell
pnpm install
```

Do not hand-edit:

```text
pnpm-lock.yaml
```

Create local environment files:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
Copy-Item packages/database/.env.example packages/database/.env
```

Local environment files must not be committed.

Start PostgreSQL:

```powershell
pnpm db:up
```

Apply the committed migration history:

```powershell
pnpm db:migrate
```

The local PostgreSQL server listens on:

```text
127.0.0.1:5432
```

The repository provisions dedicated databases for:

```text
manasiness_dev
manasiness_test
manasiness_migration_validation
```

## Development

Start the repository development graph:

```powershell
pnpm dev
```

Individual applications may also be started separately.

API:

```powershell
pnpm --filter @manasiness/api dev
```

Web:

```powershell
pnpm --filter @manasiness/web dev
```

Normal local addresses are:

```text
Web    http://localhost:3000
API    http://127.0.0.1:3001
```

API liveness:

```text
GET /health/live
```

API readiness:

```text
GET /health/ready
```

## Database commands

Start PostgreSQL:

```powershell
pnpm db:up
```

Stop it:

```powershell
pnpm db:stop
```

Inspect logs:

```powershell
pnpm db:logs
```

Generate migration files after an intentional physical schema change:

```powershell
pnpm db:generate
```

Check Drizzle migration metadata:

```powershell
pnpm db:check
```

Apply committed migrations:

```powershell
pnpm db:migrate
```

Reset the local development database:

```powershell
pnpm db:reset:dev
```

Reset the dedicated test database:

```powershell
pnpm db:reset:test
```

Validate the complete migration history against a clean validation database:

```powershell
pnpm db:validate
```

Destructive commands include destination safety checks but must still be used deliberately.

Never run destructive database commands against a database whose purpose is unclear.

## Migration policy

Committed migrations are historical artifacts.

Do not rewrite an already-applied migration because a newer schema design looks cleaner.

Normal evolution is:

```text
schema change
    ↓
new migration
    ↓
validation from clean database
```

Migration generation is appropriate only when the physical schema changes.

Refactoring application code or reusable Drizzle helpers does not automatically require a migration.

## Testing

The repository uses four testing layers:

```text
unit
integration
API
browser E2E
```

### Unit

```powershell
pnpm test:unit
```

No external infrastructure should normally be required.

### PostgreSQL integration

```powershell
pnpm test:database
```

Uses real PostgreSQL and the dedicated test database.

### API

```powershell
pnpm test:api
```

Exercises the NestJS HTTP/application boundary.

### Integration suite

```powershell
pnpm test:integration
```

Runs database and API integration projects after deterministic test-database preparation.

### Default test gate

```powershell
pnpm test
```

Runs:

```text
unit
+
database integration
+
API integration
```

### Browser E2E

Install Chromium once when necessary:

```powershell
pnpm test:e2e:install
```

Run:

```powershell
pnpm test:e2e
```

The E2E environment uses isolated Web/API ports and the dedicated test database.

### Everything

```powershell
pnpm test:all
```

## Quality commands

Formatting:

```powershell
pnpm format
```

Formatting verification:

```powershell
pnpm format:check
```

Lint:

```powershell
pnpm lint
```

Typecheck:

```powershell
pnpm typecheck
```

Production build:

```powershell
pnpm build
```

## Complete local validation

The normal full validation sequence is:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm db:check
pnpm db:validate
pnpm test:e2e
```

During implementation, narrower workspace commands are encouraged for fast feedback.

Before proposing integration, run the checks relevant to the change and record them truthfully in the pull request.

Do not claim a command was executed when it was not.

## Continuous integration

Pull requests to `main` are validated by stable quality gates:

```text
Build
Lint
Typecheck
Tests
Database / Migrations
Browser E2E
```

Do not weaken:

```text
lint rules
type safety
tests
migration validation
security boundaries
```

merely to make CI green.

Fix the underlying issue.

CI and local development should use the same repository commands rather than separate CI-only implementations.

## Source-of-truth hierarchy

When implementing an issue, use:

```text
current repository/main
+
GitHub issue scope
+
relevant product/domain/architecture documentation
```

The GitHub issue defines the requested unit of work.

It does not silently override existing product/domain invariants.

If an issue appears to conflict with an accepted invariant or ADR, surface and resolve the conflict rather than silently choosing implementation convenience.

## Workflow

Normal repository work follows:

```text
Issue
    ↓
Branch
    ↓
Implementation
    ↓
Validation
    ↓
Commit
    ↓
Push
    ↓
Pull Request
    ↓
CI / Review
    ↓
Merge
```

Work one issue at a time.

Do not pre-implement later issues merely because their direction is known.

See:

[`CONTRIBUTING.md`](CONTRIBUTING.md)

for branch, commit, pull-request, migration, ADR, and review conventions.

Coding agents must also follow:

[`AGENTS.md`](AGENTS.md)

## Domain-first implementation

Do not design capabilities primarily as:

```text
screen
→ endpoint
→ table
```

Prefer:

```text
business capability
        ↓
domain concepts and invariants
        ↓
ownership boundary
        ↓
persistence needs
        ↓
application use cases
        ↓
transport contract
        ↓
UI
```

Infrastructure exists to implement product semantics.

Product semantics do not exist to fit infrastructure convenience.

## Tenant boundary

`Organization` is the primary business tenant boundary.

Organization-owned operations require explicit Organization context.

Tenant isolation is defense in depth and currently includes PostgreSQL RLS conventions and a non-privileged runtime database role.

Do not bypass tenant-scoped persistence with unscoped database access merely for convenience.

Authorization and persistence isolation are separate concerns; both must remain correct.

## Historical facts and corrections

Business records that represent historical facts must not be silently rewritten when a correction should preserve history.

When a domain distinguishes:

```text
original fact
correction
revision
supersession
cancellation
```

preserve that semantic distinction.

Do not implement destructive overwrite behavior simply because it is easier to model.

The owning domain documentation defines the applicable correction/history semantics.

## Architecture-changing work

Create or update architecture documentation when a change modifies repository-wide conventions.

Create an ADR when the decision:

```text
affects several domains
is expensive to reverse
constrains future implementation
resolves meaningful alternatives
requires durable rationale
```

Routine implementation details do not need ADRs.

## Dependency policy

Do not add a dependency merely because it is popular or convenient.

A new dependency should have:

```text
a concrete responsibility
a clear owner
a justified advantage over existing capabilities
acceptable maintenance/security implications
```

Prefer the platform already selected by the repository unless the issue genuinely requires a different capability.

## Repository discipline

Before committing:

```powershell
git status
git diff --stat
git diff
git diff --check
```

Do not commit generated/local artifacts accidentally, including:

```text
node_modules/
dist/
.next/
.turbo/
playwright-report/
test-results/
.env
local database state
editor temporary files
```

Preserve unrelated local changes.

Do not reset, overwrite, or delete another contributor's work merely to simplify your issue.

## Current milestone direction

M1 establishes the executable engineering platform.

Its purpose is to resolve foundational conventions before substantial product-domain implementation.

Later milestones should be able to focus increasingly on:

```text
business behavior
domain invariants
application use cases
product UX
```

instead of repeatedly reopening repository-wide platform decisions.
