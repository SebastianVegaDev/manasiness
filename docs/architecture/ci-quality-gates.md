# Continuous Integration and Quality Gates

Manasiness treats continuous integration as a reproducible verification boundary for the repository.

CI exists to determine whether a candidate commit is safe to integrate into `main`.

It is not the production deployment pipeline.

## Workflow

The primary workflow is:

```text
.github/workflows/quality-gates.yml
```

It runs for:

```text
pull requests targeting main
pushes to main
```

Pull-request runs use concurrency cancellation so a newer commit to the same pull request cancels the superseded run.

Main-branch runs are not intentionally cancelled by newer main commits.

## Stable checks

The following check names are repository contracts:

```text
Build
Lint
Typecheck
Tests
Database / Migrations
Browser E2E
```

These names are intended for branch/ruleset protection.

Internal implementation may evolve without renaming these checks.

Renaming a required check requires a coordinated branch-ruleset change.

## Build

`Build` executes:

```powershell
pnpm build
```

This validates production builds for the complete workspace, including:

```text
NestJS API
Next.js web
shared packages
```

The Web production build receives non-secret synthetic configuration using the reserved `.invalid` domain.

The build does not receive deployment credentials.

CI build success does not mean the application has been deployed.

## Lint

`Lint` checks formatting for added and modified files in the current PR or push, then executes:

```powershell
pnpm lint
```

The formatting check is incremental because the existing repository has files that do not yet match Prettier. `pnpm format:check` remains available for a full repository audit.

Warnings must not be used to hide rule violations that should fail CI.

## Typecheck

`Typecheck` executes:

```powershell
pnpm typecheck
```

This includes the root tool configuration plus all workspaces participating in the Turbo typecheck graph.

## Tests

`Tests` executes:

```powershell
pnpm test
```

The repository testing strategy defines that command as:

```text
unit tests
+
PostgreSQL integration tests
+
API integration tests
```

Database-backed tests use the dedicated:

```text
manasiness_test
```

database.

They exercise the real non-privileged application role where tenant isolation requires it.

## Database / Migrations

`Database / Migrations` independently validates migration integrity.

The job starts the repository PostgreSQL environment and executes:

```powershell
pnpm db:validate
```

Migration validation targets:

```text
manasiness_migration_validation
```

The validation script resets that database and applies the complete committed migration history from an empty schema.

A successful application test suite therefore cannot hide a broken migration history.

## Browser E2E

`Browser E2E` executes only after the core quality gates succeed.

It installs the Playwright Chromium runtime, builds fresh Web and API artifacts, and executes:

```powershell
pnpm test:e2e
```

The E2E stack remains:

```text
Web        127.0.0.1:3100
API        127.0.0.1:3101
PostgreSQL manasiness_test
```

The browser harness starts the built Web and API servers as direct Node processes and does not reuse manually running development servers.

Failure traces, screenshots, videos, and the HTML report are uploaded as short-lived GitHub Actions artifacts.

Successful runs do not upload browser artifacts.

## Repository toolchain

CI does not duplicate hard-coded Node.js or pnpm versions.

The repository is authoritative:

```text
.nvmrc
package.json#packageManager
```

`pnpm/setup` reads those repository declarations.

Dependencies are installed with:

```powershell
pnpm install --frozen-lockfile
```

The committed lockfile is therefore mandatory.

A CI run must not rewrite the lockfile to make dependency installation succeed.

## Action pinning

Third-party and GitHub-maintained workflow actions are referenced by full commit SHA.

A nearby comment records the human-readable release version.

Conceptually:

```yaml
uses: actions/checkout@<full-commit-sha> # vX.Y.Z
```

A mutable major-version tag is not the trust anchor.

Dependabot monitors GitHub Actions references so action upgrades remain explicit pull requests.

## Permissions

The quality workflow declares:

```yaml
permissions:
    contents: read
```

No quality job needs repository write access.

No PR quality job receives deployment credentials.

No CI quality workflow uses:

```text
pull_request_target
```

to execute pull-request code.

If a future workflow requires elevated permissions or secrets, it must be separated from ordinary untrusted PR execution.

## Caching

CI uses two cache layers.

### pnpm

`pnpm/setup` caches package-manager data required to avoid unnecessary dependency downloads.

The lockfile remains authoritative.

Cached data never replaces frozen-lockfile verification.

### Turbo

Build, lint, and typecheck receive separate Turbo cache namespaces.

Their keys contain:

```text
runner OS
task category
toolchain/lockfile/Turbo configuration hash
commit SHA
```

A restore prefix allows valid prior Turbo task artifacts to be reused when Turbo's own task-input hash still matches.

Build, lint, and typecheck use separate cache scopes to prevent concurrent jobs from racing to populate one partial cache entry.

Caches contain no credentials or deployment secrets.

Restored cache contents must always be treated as untrusted optimization data, never as authorization or trusted state.

## PostgreSQL in CI

CI reuses the repository's Compose-based PostgreSQL environment.

This ensures local and CI infrastructure share:

```text
PostgreSQL version
database names
runtime role
initial privileges
test database topology
```

The runner is ephemeral.

The workflow removes PostgreSQL containers and volumes after database-backed jobs.

The credentials used are local CI fixture credentials only.

They are not production secrets.

## Failure diagnostics

When a PostgreSQL-backed job fails, the workflow prints PostgreSQL container logs before cleanup.

When Playwright fails, browser diagnostic artifacts are retained for seven days.

The goal is to make a failure explainable without rerunning CI merely to obtain basic evidence.

## Concurrency

For pull requests:

```text
new commit
→ old Quality Gates run cancelled
→ newest commit remains authoritative
```

This avoids wasting CI resources on superseded pull-request commits.

A push to `main` remains an independent integration event.

## Security monitoring

Advisory scanning is intentionally separate from required pull-request checks.

The scheduled workflow:

```text
.github/workflows/security-monitoring.yml
```

runs:

```powershell
pnpm audit --audit-level high
```

using the repository-pinned pnpm version.

A HIGH or CRITICAL advisory therefore surfaces as a failed monitoring workflow without making an external advisory service a flaky required PR gate.

The workflow may also be started manually.

## Dependency updates

Dependabot currently manages:

```text
GitHub Actions
Docker Compose images
```

Updates are grouped for non-major releases to reduce noise.

Major upgrades remain explicit PRs.

JavaScript dependency version updates are not currently delegated to Dependabot because the repository uses pnpm 12 while GitHub Dependabot support currently lags behind that package-manager version.

This policy should be revisited once pnpm 12 is officially supported.

Do not downgrade the repository package manager merely to make dependency automation work.

## Required ruleset checks

After the workflow is present on `main`, the `main` branch ruleset should require exactly:

```text
Build
Lint
Typecheck
Tests
Database / Migrations
Browser E2E
```

Do not configure:

```text
Dependency Audit
```

as a merge-required check because it is a scheduled monitoring signal rather than a per-PR workflow.

## Local reproduction

Before pushing a consequential change, the complete local equivalent is:

```powershell
pnpm exec prettier --check <changed files>
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm db:validate
pnpm test:e2e
```

A developer may run narrower commands during implementation, but the full gate should remain reproducible locally.

## Deployment boundary

Quality Gates must not:

```text
deploy production
promote environments
provision cloud infrastructure
rotate production secrets
run production migrations
```

Those concerns require an explicit deployment/CD design later.

A green Quality Gates workflow means:

```text
this commit is acceptable for integration into main
```

not:

```text
this commit has been released to users
```
