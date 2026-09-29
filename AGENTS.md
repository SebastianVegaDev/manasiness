# Manasiness Agent and Engineering Guardrails

This file defines repository-specific operating rules for coding agents and contributors.

It is not a generic prompting guide.

These constraints apply when implementing, reviewing, refactoring, or documenting Manasiness.

## 1. Source of truth

Treat the following as authoritative:

```text
current repository state
current main
the scoped GitHub issue
product/domain/architecture documentation
accepted ADRs
```

Do not reconstruct intended architecture from assumptions, memory, or generic framework conventions when the repository already contains an explicit decision.

Before implementing an issue:

1. read the issue completely;
2. inspect the current implementation on the working base;
3. identify the relevant domain and architecture documents;
4. inspect existing conventions in neighboring code;
5. implement only after understanding those constraints.

The issue defines scope.

It does not silently override product/domain invariants.

If requirements conflict, do not resolve the conflict by choosing whichever implementation is easiest.

## 2. Decision hierarchy

When implementation choices conflict, preserve this hierarchy:

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

Implementation convenience must not weaken a higher-level constraint.

The canonical cross-cutting policies are in:

```text
docs/architecture/cross-cutting-policies.md
```

## 3. Work one issue at a time

The expected workflow is:

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
```

Implement only the current issue and its strictly necessary prerequisites.

Do not pre-implement future issues merely because their likely requirements are visible.

If a future concern becomes relevant but is not required now:

```text
leave the appropriate seam
document the boundary if necessary
do not implement the future capability
```

## 4. Preserve existing work

Do not discard unrelated work.

Before making changes, inspect:

```powershell
git status
git diff
```

Do not:

```text
git reset --hard
git clean -fd
overwrite unrelated modified files
delete unexplained local changes
```

unless the user/contributor explicitly requested that operation and its consequences are understood.

A dirty working tree is something to preserve and reason about, not automatically erase.

## 5. Architecture

Manasiness V1 is a modular monolith.

Do not introduce:

```text
microservices
distributed messaging
service decomposition
event infrastructure
network boundaries
```

unless an owning issue and architecture decision require them.

The modular monolith must still preserve strong ownership boundaries.

Physical colocation is not shared ownership.

## 6. Domain ownership

A domain/module owns:

```text
its lifecycle
its invariants
authoritative mutations
persistence semantics
application capabilities
```

One module must not arbitrarily modify another module's persistence.

Do not solve cross-domain behavior through direct writes to another module's tables.

Prefer explicit application capabilities owned by the responsible module.

A shared PostgreSQL database does not grant cross-domain write ownership.

## 7. Domain-first design

Do not begin product implementation from:

```text
screen
→ endpoint
→ table
```

Start from:

```text
business capability
→ domain concepts
→ invariants
→ ownership
→ persistence
→ application use case
→ transport
→ UI
```

Controllers, React components, database tables, and framework primitives are implementation mechanisms.

They do not define business semantics.

## 8. API controllers

Controllers are transport adapters.

They may:

```text
receive validated transport input
invoke application capabilities
map transport concerns
return transport responses
```

They must not become the canonical home for:

```text
business rules
business transactions
cross-domain orchestration
persistence mutations
authorization semantics
```

## 9. Web/UI boundaries

The Web application must not bypass application/API capabilities.

UI and Assistant-like interaction surfaces must not directly write persistence because doing so is faster.

The Web must not import:

```text
@manasiness/database
NestJS application internals
API controllers
backend repositories
```

The Web may consume transport contracts through:

```text
@manasiness/contracts
```

and approved API/application boundaries.

## 10. Web API access

Do not scatter raw backend `fetch()` conventions throughout features/components.

Use the established Web API client boundary.

Browser server state belongs to TanStack Query when browser-managed remote-state lifecycle is needed.

Do not introduce a second global store merely to hold the same remote data.

Next.js Route Handlers are not a mandatory proxy in front of NestJS.

Use one only when it creates a real security/runtime boundary.

## 11. Transport contracts

Transport-facing runtime schemas belong in:

```text
@manasiness/contracts
```

when they are legitimately shared.

Do not place domain implementation entities there.

Client logic must reason about stable machine-readable error:

```text
status
type
code
```

rather than parsing human-readable error messages.

Do not duplicate a contract as an independent TypeScript interface when the runtime schema already owns that wire shape.

## 12. Database ownership

Database infrastructure belongs in:

```text
@manasiness/database
```

Product modules should not create arbitrary database infrastructure conventions independently.

Transaction boundaries follow business commands/use cases.

They do not exist merely because a controller method happened to execute several SQL statements.

## 13. Tenant isolation

`Organization` is the business tenant boundary.

Preserve:

```text
explicit Organization context
tenant-qualified relationships where required
Row Level Security
non-privileged application runtime role
fail-closed persistence behavior
```

Never remove tenant predicates/RLS/security checks merely to make a test pass.

Do not use the migration/admin role as the normal application runtime role.

Unscoped database access is exceptional.

Its presence in the platform does not make it appropriate for Organization-owned domain persistence.

## 14. Authentication and authorization

Authentication, Membership authorization, tenant persistence isolation, and business permissions are separate responsibilities.

Do not assume one automatically proves another.

A request ID is diagnostic context.

It is not:

```text
Identity
Organization
authorization
session
idempotency proof
```

Do not turn request correlation context into hidden authentication/tenant state.

## 15. Historical facts

Preserve historical facts and correction semantics defined by the owning domain.

Do not silently overwrite authoritative history when the product semantics require:

```text
revision
correction
supersession
cancellation
reversal
historical preservation
```

A simpler CRUD update is not automatically the correct business model.

Read the relevant domain documentation before modifying historical-state behavior.

## 16. Identifiers

Durable entity IDs use the repository's canonical identifier primitive.

Do not independently invent:

```text
UUID generation
ID validation
ID parsing
ID serialization
```

when `@manasiness/platform-primitives` already owns those semantics.

UUIDv7 is opaque business identity.

Do not derive:

```text
authorization
tenant
entity type
business chronology
createdAt
```

from UUID bits.

Human-readable business numbers are separate from durable entity IDs.

## 17. Time

Use the repository's canonical time semantics.

Do not silently mix:

```text
absolute instant
local calendar date
business timezone
```

Absolute instants, date-only values, and IANA timezones are different concepts.

Do not infer business timezone from the server timezone.

## 18. Migrations

Committed migrations are history.

Do not rewrite an already-applied migration to make current state cleaner.

Physical schema changes normally receive a new migration.

Do not generate a migration when no physical schema changed.

After migration-related work, validate the migration history from a clean database.

## 19. ADRs

Use ADRs for consequential decisions that:

```text
affect several domains
are expensive to reverse
constrain future architecture
resolve meaningful alternatives
need durable rationale
```

Do not create ADRs for ordinary implementation details.

Do not rewrite an accepted ADR to hide an old decision.

When architecture materially changes:

```text
new ADR
→ supersedes previous ADR
```

## 20. Dependencies

Do not add a package without a concrete responsibility.

Before adding a dependency, establish:

```text
what responsibility it owns
why existing platform capabilities are insufficient
runtime/build/security impact
whether the dependency leaks into domain code
maintenance implications
```

Avoid adding abstractions or libraries solely because they are common in other projects.

Repository architecture outranks framework fashion.

## 21. Shared code

Do not create generic dumping grounds such as:

```text
shared/
common/
utils/
helpers/
```

without explicit ownership.

Reuse should follow responsibility.

A shared technical package is appropriate only when its responsibility is narrow and clear.

Do not erase domain boundaries in the name of DRY.

Some duplication across ownership boundaries may be safer than inappropriate coupling.

## 22. Environment and secrets

Use established typed configuration boundaries.

Do not scatter:

```typescript
process.env.*
```

through product features.

Browser code must never receive server secrets.

Do not log:

```text
credentials
tokens
passwords
cookies
authorization headers
database URLs
complete environment/config objects
```

Structured redaction is defense in depth, not permission to log sensitive objects.

## 23. Logging

Application code should use the established Nest logger abstraction.

Do not couple domain/application code directly to a hosted logging vendor.

Technical logging is not business audit history.

Do not use operational logs as the durable source of truth for business changes.

## 24. Testing

Choose the cheapest layer capable of proving the requirement.

Use:

```text
*.unit.test.ts
```

for pure deterministic behavior.

Use:

```text
*.integration.test.ts
```

for real infrastructure semantics such as PostgreSQL transactions, constraints, and RLS.

Use:

```text
*.api.test.ts
```

for the real HTTP/Nest boundary.

Use:

```text
*.e2e.spec.ts
```

for user-observable browser journeys.

Do not prove PostgreSQL-specific behavior with mocks.

Do not move every rule into browser E2E simply because E2E can technically test it.

## 25. Test database safety

Tests must use dedicated test configuration.

Never silently fall back from a missing test database configuration to development or production `DATABASE_URL`.

Destructive tests/reset commands must remain protected by destination validation.

## 26. Repository commands

Use the existing repository commands.

Do not invent parallel tooling when the repository already has an authoritative command.

Important root commands include:

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

During implementation, narrower workspace commands are acceptable for fast feedback.

## 27. CI

Do not weaken repository rules to make CI pass.

Do not:

```text
disable a lint rule globally for one inconvenient case
remove a meaningful test
skip migration validation
loosen TypeScript strictness
disable tenant isolation
turn failures into warnings
```

without a legitimate architecture decision.

Fix the underlying defect.

CI quality-gate names are repository policy and should not be casually renamed.

## 28. Formatting and code style

Follow repository configuration.

TypeScript indentation is:

```text
4 spaces
```

Do not use literal tabs.

Do not manually reformat unrelated files.

Use:

```powershell
pnpm format
```

when appropriate.

## 29. Validation before PR

Before proposing a PR, inspect:

```powershell
git status
git diff --stat
git diff
git diff --check
```

Run validation appropriate to the change.

For broad application/platform work, normally run:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

For database work additionally run:

```powershell
pnpm db:check
pnpm db:validate
```

For browser-integrated work additionally run:

```powershell
pnpm test:e2e
```

Record actual validation in the PR.

Do not claim unexecuted checks passed.

## 30. Pull requests

A PR must explain:

```text
Summary
Why
Scope
Validation
Issue linkage
```

When applicable, also call out:

```text
database migrations
ADRs
security-sensitive changes
tenant-isolation implications
contract changes
backwards-compatibility implications
```

Use:

```text
Closes #<issue>
```

when the PR fully resolves the issue.

## 31. Scope discipline

Before finishing, compare the diff with the issue.

Remove unrelated opportunistic work.

Do not combine:

```text
feature
+
cleanup
+
future architecture
+
dependency upgrades
```

unless all are required to solve the same issue safely.

If unrelated debt is discovered, record it separately instead of silently expanding scope.

## 32. Final agent behavior

A coding agent should leave the repository in a state where a human reviewer can answer:

```text
What issue does this solve?
Why is this design consistent with the domain?
Which boundary owns the behavior?
What changed?
What was deliberately not changed?
How was it validated?
Are migrations/security/contracts affected?
```

If those questions cannot be answered from the issue, diff, documentation, and PR description, the work is not ready for integration.
