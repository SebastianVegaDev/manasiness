# ADR 0012 — Layered automated testing strategy

> **Status:** Accepted  
> **Date:** 2026-09-28

## Context

Manasiness will contain consequential behavior around:

```text
tenancy
authorization
inventory
financial state
transactions
traceability
business workflows
```

The legacy system did not have a dependable automated testing foundation.

Testing must become an ordinary engineering capability before those rules accumulate.

A single test style is not appropriate for every kind of behavior.

Pure calculations do not require PostgreSQL.

PostgreSQL constraints cannot be faithfully proven with mocks.

HTTP contracts should be tested through HTTP.

Critical browser journeys should eventually be tested through a real browser.

## Decision

Manasiness uses a layered test strategy:

```text
unit
integration
API
browser E2E
```

Vitest is the canonical TypeScript test runner for unit, infrastructure integration, and API tests.

Playwright is the canonical browser E2E runner.

## Vitest

The repository uses one root Vitest configuration with separate projects for:

```text
unit
integration
api
```

Projects can be executed independently while sharing one testing toolchain.

NestJS API tests use decorator metadata support compatible with the application's Nest dependency injection model.

## Unit tests

Unit tests prove deterministic logic without external infrastructure.

Naming:

```text
*.unit.test.ts
```

Unit tests should be the default for pure:

```text
business rules
value objects
parsing
mapping
configuration
state transitions
```

They should remain fast enough for frequent local execution.

## Integration tests

Infrastructure integration tests use:

```text
*.integration.test.ts
```

Persistence behavior that relies on PostgreSQL semantics is tested against real PostgreSQL.

This includes:

```text
transactions
RLS
constraints
foreign keys
driver behavior
migration-produced schema
```

An in-memory substitute is not considered equivalent for these properties.

## API tests

HTTP integration tests use:

```text
*.api.test.ts
```

API tests exercise the real NestJS HTTP boundary where appropriate:

```text
middleware
interceptors
pipes
filters
transport validation
error mapping
response behavior
health endpoints
OpenAPI
```

A reusable API application factory is shared by production bootstrap and full application tests.

Tests should not maintain a second manually duplicated bootstrap path.

## Browser E2E

Browser tests use Playwright.

Naming:

```text
*.e2e.spec.ts
```

Browser tests are intended for important user-observable journeys.

They are not a replacement for unit or API tests.

The initial M1 smoke test proves only the existing platform surface:

```text
PostgreSQL ready
API ready
Web loads
development landing is rendered
```

No fake product workflow is introduced merely to create an E2E test.

## Test database

Database-backed tests use the dedicated:

```text
manasiness_test
```

boundary.

Before integration runs, the test database is reset and the real committed migration history is applied.

Tests do not construct an independent shadow schema.

## Database safety

Testing configuration must fail rather than silently fall back to ordinary runtime database configuration.

A missing test database URL must never mean:

```text
use DATABASE_URL instead
```

Destructive test reset tooling validates the destination before operating.

E2E startup separately validates that its runtime database URL identifies a dedicated Manasiness test database.

## Test isolation

The initial database integration project runs test files sequentially because they share one PostgreSQL test database.

Browser E2E uses one worker for the same reason.

Suites remain responsible for cleaning their local fixture state.

The complete test run begins from a reset migrated database.

If test volume later requires parallel database execution, Manasiness will allocate isolated database/schema state per worker instead of allowing race-prone shared fixtures.

## Application testing

A reusable application factory constructs the NestJS API.

Production `main.ts` and API integration tests use the same factory.

The factory owns:

```text
Nest application creation
logger integration
HTTP hardening
transport pipeline
OpenAPI setup
shutdown-hook configuration
```

Production remains responsible for listening on the configured process port.

Tests may listen on an operating-system-assigned ephemeral port.

## Browser stack

Playwright starts its own isolated test processes:

```text
Web :3100
API :3101
```

The processes do not reuse ordinary local development servers.

The API process uses the dedicated runtime test database credential.

This prevents E2E execution from silently operating against development data.

## Deterministic time and identity

Global monkey-patching of business time or identifier generation is not the default strategy.

When a capability's behavior materially depends on current time or generated identity, the capability should receive an explicit seam that tests can control.

Such abstractions are introduced when required by actual behavior rather than as ceremony in every module.

## Assertions

Tests prioritize observable behavior and invariants over internal implementation choreography.

Examples of strong assertions include:

```text
transaction fully rolled back
tenant boundary denied the operation
HTTP contract returned stable machine code
browser displayed the expected product state
```

Tests should not over-specify private method-call ordering unless that ordering itself is the required behavior.

## Coverage

No arbitrary coverage percentage is introduced by M1.

Coverage may later be collected as a diagnostic signal.

Security and business correctness remain invariant-oriented rather than percentage-oriented.

## CI

Local and CI testing use the same root commands.

Issue #35 will provision CI infrastructure around these commands rather than create a separate CI-only test harness.

## Consequences

### Positive

- one TypeScript testing runner;
- clear test-layer responsibilities;
- PostgreSQL semantics are tested against PostgreSQL;
- API tests exercise real Nest behavior;
- browser tests have a real integrated stack;
- migration history participates in integration testing;
- test database usage fails safely;
- later domain milestones inherit stable conventions;
- local and CI workflows can remain aligned.

### Negative / trade-offs

- full `pnpm test` requires local PostgreSQL/Docker;
- database integration tests are slower than unit tests;
- browser tests require a Playwright browser installation;
- database-backed tests initially run sequentially;
- explicit test seams may require small amounts of dependency injection in future application capabilities.

These costs are accepted because each expensive layer is reserved for behavior that actually requires it.

## Alternatives considered

### Keep Node's built-in test runner

Rejected as the long-term monorepo baseline.

The existing runner was useful during early M1 bootstrap, but Vitest provides a stronger project/workspace model for the mixed package, API, and future frontend testing needs.

### Jest

Rejected.

The repository does not need an additional legacy transform/configuration ecosystem when Vitest satisfies the TypeScript/ESM monorepo direction.

### Mock PostgreSQL for persistence tests

Rejected.

Transactions, RLS, constraints, and PostgreSQL behavior are precisely what these tests need to prove.

### Run every test through the browser

Rejected.

This would make simple behavior slow, fragile, and difficult to diagnose.

### Add high coverage thresholds immediately

Rejected.

Coverage percentage is not equivalent to proving business or security invariants.

### Reuse local development servers for E2E

Rejected.

Those processes may use different environment configuration or development data.

The E2E harness owns its dedicated stack.

## References

- `tests/README.md`
- `vitest.config.ts`
- `playwright.config.ts`
- Issue #34