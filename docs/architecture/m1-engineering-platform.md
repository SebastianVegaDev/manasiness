# M1 Engineering Platform Readiness

> **Status:** Validated locally on 2026-09-29 for [issue #38](https://github.com/SebastianVegaDev/manasiness/issues/38). Pull request CI remains the integration gate.

## Platform map

| Owner | M1 responsibility |
| --- | --- |
| `apps/api` | NestJS HTTP runtime, typed configuration, transport validation/errors, correlation and health; product modules have no implementation yet. |
| `apps/web` | Next.js runtime, separate server and browser API clients, shared response contracts, TanStack Query, and an operational readiness view. |
| `packages/contracts` | Zod transport schemas and wire types; no domain entities or persistence. |
| `packages/database` | PostgreSQL/Drizzle connection, committed migrations, transaction runner, tenant scope/RLS support, and guarded test tooling. |
| `packages/platform-primitives` | Canonical entity IDs and time representations. |
| `infra/postgres` | Local PostgreSQL initialization and non-privileged runtime role. |
| `tests`, `.github/workflows` | Unit, PostgreSQL integration, API, browser smoke, migration replay, and stable CI quality gates. |

The dependency direction remains Web → transport contracts → API capabilities → owned persistence. The database package is server infrastructure. Controllers contain transport behavior, and transaction and tenant scope live outside controllers. No product domain, generic shared-code bucket, queue, Redis, or distributed service was introduced in M1.

## Exit checks

Validation used a detached clean worktree, the pinned Node 24.21.0/pnpm 12.6.0 toolchain, and copies of all three `.env.example` files. Docker Compose initialized PostgreSQL from an empty volume. `pnpm install --frozen-lockfile`, `pnpm db:up`, and `pnpm db:migrate` succeeded. `pnpm dev` started Web and API; Web, API liveness, and PostgreSQL readiness returned HTTP 200. Readiness returned the configured CORS origin and request ID, and Helmet security headers were present. The browser smoke exercised Web → API → PostgreSQL.

The complete local gate is `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm db:check`, `pnpm db:validate`, and `pnpm test:e2e`. The migration validator replays committed history into an empty validation database. Unit, integration, and API tests cover configuration, errors, redaction, transactions, and tenant isolation; the RLS test checks missing context, cross-tenant reads and writes, tenant-qualified foreign keys, and context cleanup. Spot checks also confirmed invalid API configuration fails startup and a test reset aimed at the development database is refused.

The readiness pass corrected repository-wide formatting drift so the root formatting command can be a full CI gate. It also made browser E2E start isolated development processes with test origins, independent of the public API origin embedded in a previous production build. Production artifacts remain covered by the separate Build gate.

## Intentional deferrals

M2 owns product visual design and information architecture. M3 owns Identity, Organization, Membership, authentication, authorization, and tenant-context resolution. Later owning domain milestones define business persistence, permissions, history, and business audit behavior. M12 owns production deployment and hardening. The M1 tenant tables are test probes only; they are not Organization domain tables.

The authoritative details remain in [cross-cutting policies](cross-cutting-policies.md), [runtime configuration](runtime-configuration.md), [CI quality gates](ci-quality-gates.md), the package READMEs, and accepted ADRs. This record is a map and exit summary, not a replacement for those decisions.
