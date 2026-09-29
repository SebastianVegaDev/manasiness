# Manasiness Testing

Automated testing is a platform capability in Manasiness.

The objective is not to maximize an arbitrary coverage percentage.

The objective is to make important behavior, invariants, persistence guarantees, and user journeys straightforward to prove at the cheapest appropriate layer.

## Test layers

Manasiness uses four principal layers:

```text
unit
integration
API
browser E2E
```

Each layer has a different responsibility.

Do not move every behavior into the most expensive layer merely because that layer can technically test it.

## Unit tests

Unit tests prove deterministic behavior without external infrastructure.

Naming:

```text
*.unit.test.ts
```

Typical locations:

```text
packages/<package>/test/unit/
apps/<app>/test/unit/
```

Examples include:

```text
value-object behavior
parsing
pure business rules
configuration parsing
mapping
calculation
state-transition rules
```

Unit tests should normally avoid:

```text
PostgreSQL
HTTP listeners
real browsers
Docker
network calls
```

Run:

```powershell
pnpm test:unit
```

## Integration tests

Integration tests prove behavior that depends on real infrastructure semantics.

Naming:

```text
*.integration.test.ts
```

Current primary use:

```text
PostgreSQL
```

Examples include:

```text
transactions
constraints
RLS
foreign keys
migration compatibility
database-driver behavior
```

Do not replace PostgreSQL with an in-memory database when the property under test depends on PostgreSQL semantics.

Run:

```powershell
pnpm test:integration
```

The command starts the local PostgreSQL service and resets:

```text
manasiness_test
```

before running integration/API projects.

The reset applies the real committed migration history.

## API tests

API tests prove the HTTP/application boundary.

Naming:

```text
*.api.test.ts
```

Location:

```text
apps/api/test/api/
```

They are appropriate for:

```text
request validation
query/parameter transformation
API error mapping
HTTP status
response contracts
correlation headers
health semantics
OpenAPI
Nest middleware/pipes/interceptors/filters
```

The main API smoke harness boots the real `AppModule` through the same application factory used by production startup.

Do not mock away the complete Nest application boundary and then call the result an API integration test.

Run:

```powershell
pnpm test:api
```

## Browser E2E tests

Browser tests use Playwright.

Naming:

```text
*.e2e.spec.ts
```

Location:

```text
tests/e2e/
```

E2E is reserved for integrated browser journeys.

It should prove user-observable flows rather than every internal branch.

Run:

```powershell
pnpm test:e2e
```

Playwright starts isolated Web and API development processes with its own test configuration. The command builds required shared packages and prepares the dedicated test database.

The test stack uses:

```text
Web        http://127.0.0.1:3100
API        http://127.0.0.1:3101
PostgreSQL manasiness_test
```

These ports are intentionally separate from normal local development.

Playwright does not reuse an already-running server.

This prevents tests from silently targeting a development process connected to the wrong database.

## Browser installation

Playwright browser binaries are not installed through repository source control.

Install Chromium locally with:

```powershell
pnpm test:e2e:install
```

The CI workflow will install the required browser explicitly.

## Root commands

Primary commands are:

```powershell
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:database
pnpm test:api
pnpm test:e2e
pnpm test:all
pnpm test:watch
```

`pnpm test` runs:

```text
unit
+
database integration
+
API integration
```

It deliberately does not automatically run browser E2E.

Browser tests are a separate explicit layer.

`pnpm test:all` includes browser E2E.

## Test database safety

Persistence tests use:

```text
DATABASE_TEST_URL
DATABASE_TEST_RUNTIME_URL
```

The database tooling rejects ordinary development/production targets for test reset operations.

Browser E2E additionally checks the database name before booting the API test process.

Valid test database names are:

```text
manasiness_test
manasiness_test_*
```

Tests must never fall back from missing test configuration to:

```text
DATABASE_URL
```

because doing so could target an ordinary development or production database.

## Migration fidelity

Database integration preparation executes:

```powershell
pnpm db:reset:test
```

That operation:

```text
validates the test target
resets the test schemas
applies the complete committed migration history
```

Integration tests therefore operate against the schema produced by actual migrations rather than an independently constructed approximation.

## Isolation

Integration test files that share PostgreSQL currently run sequentially.

Browser E2E currently uses one worker.

This is deliberate while the platform has one shared test database.

Individual suites remain responsible for cleaning their own temporary fixture state.

A complete rerun always begins from a clean migrated test database.

When future test volume justifies parallel database workers, introduce isolated databases or schemas per worker rather than allowing tests to race over shared fixtures.

## Tenancy

Tenant-security tests must use the real non-privileged runtime database role.

Testing tenant isolation through the migration/admin superuser does not prove the production security boundary.

Tenant tests should continue proving:

```text
tenant A can access A
tenant A cannot access B
missing tenant context fails closed
cross-tenant relationships fail
RLS cannot be bypassed by the runtime role
```

## Clocks and identifiers

Do not globally monkey-patch business time or identity generation merely to make tests deterministic.

When behavior depends on "now" or generated identity, the owning application capability should receive an explicit seam when needed.

Conceptually:

```typescript
interface Clock {
    now(): Date;
}

interface IdGenerator {
    generate(): EntityId;
}
```

A test can then supply a deterministic implementation.

Do not create these abstractions preemptively in every module.

Introduce them when a real business capability depends on controllable time or generated identity.

## Assertions

Tests should assert externally meaningful behavior and invariants.

Prefer:

```text
database row was rolled back
other tenant cannot read the record
HTTP response has stable error code
browser displays the expected state
```

over fragile assertions such as:

```text
method X was called exactly once before private method Y
repository implementation called internal helper Z
```

Internal choreography is usually not the contract.

## Fixtures

Avoid giant shared fixtures that every test mutates.

Prefer:

```text
small builders
explicit setup
unique canonical IDs
suite-owned data
deterministic cleanup
```

Test ordering must not be hidden state.

A test should not require another test to run first.

## Coverage

M1 does not establish an arbitrary percentage threshold.

Coverage is useful as a diagnostic signal, but:

```text
90% coverage
```

does not prove:

```text
tenant isolation
transaction atomicity
authorization correctness
business invariants
```

Later CI may collect coverage without treating percentage alone as a quality definition.

## CI

Issue #34 establishes the commands and deterministic local harness.

Issue #35 will execute these same commands in GitHub Actions.

CI must not use a separate testing strategy from local development.

The goal is:

```text
same commands
same migrations
same test database semantics
same assertions
```

with only infrastructure provisioning differing where necessary.
