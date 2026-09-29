# ADR 0013 — Stable CI quality gates for main integration

> **Status:** Accepted  
> **Date:** 2026-09-29

## Context

Manasiness now has:

```text
workspace tooling
API
Web
PostgreSQL migrations
tenant persistence guardrails
transport contracts
observability
unit tests
integration tests
API tests
browser smoke tests
```

Those capabilities are only useful as repository guardrails if pull requests execute the same validation consistently.

Without a stable CI contract, later milestones could introduce:

```text
unvalidated builds
migration drift
tests that work only locally
renamed status checks
branch-protection churn
unnecessarily privileged workflows
dependency automation noise
```

CI should protect `main` as a trustworthy integration branch without prematurely becoming a production deployment system.

## Decision

GitHub Actions is the repository CI platform.

The primary quality workflow runs for:

```text
pull requests targeting main
pushes to main
```

The following job names are treated as stable repository contracts:

```text
Build
Lint
Typecheck
Tests
Database / Migrations
Browser E2E
```

These names are intended to become required branch/ruleset checks.

## Repository-owned toolchain

Node.js and pnpm versions remain owned by repository files:

```text
.nvmrc
package.json#packageManager
```

Workflow YAML does not repeat those versions.

CI uses a setup action capable of reading those files directly.

Dependency installation uses:

```text
pnpm install --frozen-lockfile
```

CI must fail rather than modifying the lockfile to satisfy installation.

## Production build validation

`Build` compiles the workspace production artifacts.

The Web receives valid non-secret synthetic production configuration.

A CI build does not require or receive production deployment credentials.

Build validation and deployment remain separate responsibilities.

## Static analysis

`Lint` owns:

```text
format verification
ESLint
```

`Typecheck` owns compile-time TypeScript correctness.

They remain distinct checks because their failures require different remediation.

## Automated tests

`Tests` executes the repository's canonical:

```text
pnpm test
```

contract.

That currently includes:

```text
unit
PostgreSQL integration
API integration
```

CI does not create a second testing convention.

## Migration validation

Database migration replay remains an independent quality gate.

`Database / Migrations` applies the committed migration history against the dedicated clean validation database.

Passing application tests does not substitute for proving that an empty database can reach the current schema through committed migrations.

## Browser validation

`Browser E2E` is a separate gate.

It runs only after the core quality checks succeed.

This avoids paying the browser-startup cost for commits that already fail build, lint, typecheck, application tests, or migration validation.

The browser stack uses isolated test ports and the dedicated test database.

## PostgreSQL topology

CI reuses the repository Compose PostgreSQL definition and initialization scripts.

The repository therefore has one source of truth for:

```text
PostgreSQL version
test databases
runtime role
local/test role privileges
```

CI does not maintain an independent PostgreSQL initialization recipe.

## Permissions

The quality workflow uses:

```yaml
permissions:
    contents: read
```

Quality checks do not require repository write access.

The workflow does not execute pull-request code through:

```text
pull_request_target
```

No production/environment secrets are exposed to pull-request jobs.

Future privileged automation must use a distinct trust boundary.

## Action supply-chain policy

External workflow actions are pinned to immutable full commit SHAs.

Release-version comments remain beside the SHA for human readability.

Action upgrades happen through reviewed dependency-update pull requests.

## Caching

Caching exists only as an optimization.

pnpm package data and task-specific Turbo outputs may be cached.

A cache must never contain:

```text
secrets
credentials
authorization state
deployment identity
```

Turbo cache namespaces are separated between:

```text
build
lint
typecheck
```

Restored caches remain subject to Turbo task-input hashing and ordinary quality validation.

## Concurrency

Superseded runs for the same pull request are cancelled.

This prevents old PR commits from consuming unnecessary CI resources.

Main-branch integration runs are not intentionally treated as interchangeable with newer pushes.

## Security monitoring

Dependency advisory monitoring is not a required pull-request gate.

A scheduled workflow executes the repository-native package-manager audit at HIGH severity and above.

This surfaces actionable security signals without making registry/advisory availability part of every merge decision.

## Dependency updates

Dependabot manages ecosystems that are currently compatible with repository tooling:

```text
GitHub Actions
Docker Compose
```

JavaScript Dependabot updates are deferred while GitHub's supported pnpm version lags behind the repository's pnpm 12 toolchain.

The repository will not downgrade its package manager solely for automation compatibility.

The decision should be revisited when upstream support catches up.

## Branch protection

The intended required checks for `main` are:

```text
Build
Lint
Typecheck
Tests
Database / Migrations
Browser E2E
```

The names are intentionally stable.

Changing one is a repository-policy migration, not a cosmetic rename.

## Non-goals

This decision does not establish:

```text
production deployment
continuous delivery
environment promotion
cloud infrastructure provisioning
production migrations
production secret management
load testing
DAST
production synthetic monitoring
```

Those capabilities require separate decisions.

## Consequences

### Positive

- every PR receives reproducible quality validation;
- local and CI commands remain aligned;
- broken migrations fail independently from application tests;
- production builds for both apps are exercised;
- browser integration is continuously proven;
- check names can be used safely by branch rulesets;
- stale PR runs are cancelled;
- CI has minimal repository permissions;
- workflow actions have immutable trust references;
- dependency/security monitoring exists without becoming a noisy PR gate;
- CI does not require production credentials.

### Trade-offs

- several jobs install workspace dependencies independently;
- database tests and migration validation each create isolated PostgreSQL containers;
- browser validation adds a second stage after core jobs;
- full CI costs more than running only unit tests;
- full-SHA action pinning requires deliberate upgrades.

These costs are accepted because they improve diagnostic isolation, security boundaries, and confidence in `main`.

## Alternatives considered

### One generic CI job

Rejected.

A single job would make build, lint, typing, testing, and migration failures harder to diagnose and would provide poor branch-protection semantics.

### Duplicate Node and pnpm versions in workflow YAML

Rejected.

The repository already owns canonical versions.

Duplicating them creates drift.

### Give workflows write permissions for convenience

Rejected.

Quality validation does not require write access.

### `pull_request_target` for PR validation

Rejected.

It is the wrong trust boundary for executing candidate pull-request code.

### Skip clean migration replay because integration tests pass

Rejected.

A database that already contains the current schema does not prove committed migration history can construct it from scratch.

### Run browser tests before cheaper gates

Rejected.

Browser setup is relatively expensive and should only run after cheaper failures have been eliminated.

### Make dependency advisory scanning a required PR gate

Rejected.

External advisory availability and advisory churn should not create an unreliable merge gate.

### Configure unsupported pnpm dependency automation

Rejected.

Automation that cannot reliably understand the repository's package-manager format provides false confidence.

## References

- `.github/workflows/quality-gates.yml`
- `.github/workflows/security-monitoring.yml`
- `.github/dependabot.yml`
- `docs/architecture/ci-quality-gates.md`
- `docs/adr/0012-layered-testing-strategy.md`
- Issue #35