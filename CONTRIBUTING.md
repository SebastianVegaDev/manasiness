# Contributing to Manasiness

Manasiness uses an issue-driven engineering workflow.

Repository changes should remain reviewable, attributable to an explicit responsibility, and consistent with the product/domain model.

Read [`AGENTS.md`](AGENTS.md) before substantial implementation work.

## Workflow

Use:

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

Do not pre-implement later issues.

## Before starting

Update your base:

```bash
git checkout main
git pull --ff-only origin main
git status
```

Inspect the issue and relevant documentation.

For domain work, read the owning documentation under:

```text
docs/domain/
```

For cross-cutting work, inspect:

```text
docs/architecture/
docs/adr/
```

For product intent:

```text
docs/product/product-vision.md
```

Do not modify unrelated working-tree changes.

## Branch names

Branches should describe both the change category and issue.

Preferred format:

```text
<type>/<issue>-<short-description>
```

Examples:

```text
feat/45-party-api
fix/72-inventory-allocation-race
docs/37-repository-operating-model
test/66-m2-security-suite
refactor/42-organization-service-boundary
chore/35-ci-quality-gates
```

Common branch types:

```text
feat
fix
docs
test
refactor
chore
```

Keep names lowercase and use hyphens.

## Implementation scope

The pull request should primarily solve one GitHub issue.

Necessary supporting work is acceptable when required for correctness.

Do not expand scope merely because nearby code could also be cleaned up.

If unrelated technical debt is discovered:

```text
leave it unchanged
or
create/follow a separate issue
```

## Commits

Use concise Conventional Commit-style subjects.

Examples:

```text
feat: establish web API client boundary
fix: preserve inventory allocation atomicity
docs: document repository operating model
test: establish tenant security coverage
refactor: isolate organization management boundary
chore: establish CI quality gates
```

Use the category that describes the responsibility of the commit, not simply the files changed.

Prefer focused commits.

Do not include generated noise or unrelated formatting changes.

## Before committing

Inspect:

```bash
git status
git diff --stat
git diff
git diff --check
```

Confirm that the diff belongs to the issue.

## Validation

Use the repository commands rather than inventing CI-only/local-only alternatives.

Common quality validation:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

Database/schema work additionally requires:

```bash
pnpm db:check
pnpm db:validate
```

Browser-integrated behavior additionally requires:

```bash
pnpm test:e2e
```

During development, workspace-specific commands are encouraged for faster feedback.

The pull request must state which commands were actually executed.

Do not mark unexecuted validation as successful.

## Database changes

Database changes require deliberate review.

A pull request affecting physical schema should state:

```text
whether a migration was added
which tables/constraints/policies changed
whether Organization tenancy is involved
whether RLS was added/changed
whether data backfill/compatibility is required
how migration replay was validated
```

Do not rewrite applied migration history.

## Tenant/security-sensitive changes

Call out explicitly when a change affects:

```text
Organization context
RLS
authentication
authorization
sessions/cookies
permissions
request boundaries
secrets/configuration
logging/redaction
dependency trust
```

A reviewer should not need to discover security impact accidentally from the diff.

## Transport contracts

When changing a shared transport contract, describe:

```text
request changes
response changes
error-code changes
compatibility implications
Web/API consumers affected
```

Transport contracts belong in `@manasiness/contracts` when genuinely shared.

Do not duplicate backend implementation models in clients.

## Architecture changes

Create an ADR when a decision:

```text
affects several domains
is expensive to reverse
constrains future architecture
resolves meaningful alternatives
requires durable rationale
```

Routine code changes do not need ADRs.

If an existing accepted decision changes materially:

```text
create a new ADR
mark the old ADR superseded
```

Do not rewrite architectural history.

## Dependencies

New dependencies require a concrete responsibility.

A PR introducing one should explain:

```text
why it is needed
what responsibility it owns
why existing dependencies/platform capabilities are insufficient
whether it affects runtime or development only
```

Avoid adding packages merely for convenience.

## Pull-request title

Use the same concise semantic style as commits.

Examples:

```text
feat: establish web API client and server-state boundary
docs: document repository operating model and agent guardrails
fix: enforce tenant-qualified inventory references
```

## Pull-request description

Use the repository PR template.

At minimum explain:

```text
Summary
Why
Scope
Validation
Issue linkage
```

Do not paste a list of modified filenames as the explanation.

Explain the engineering behavior changed by the PR.

## Issue closure

When the PR fully resolves an issue, include:

```text
Closes #<number>
```

If it intentionally resolves only part of an issue, do not falsely close it.

## Merge expectations

A PR is ready to merge when:

```text
scope matches the issue
architecture/domain constraints are preserved
required documentation exists
validation is truthful
required CI checks are green
review concerns are resolved
```

A green CI run is necessary but does not replace design review for consequential changes.
