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

The development database listens on:

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

See logs with:

```bash
pnpm db:logs
```

Database workflow and migration policy are documented in [`packages/database/README.md`](packages/database/README.md).

## Workspace map

```text
apps/
  api/                # NestJS modular-monolith API runtime.
  web/                # Next.js App Router web runtime.

packages/
  contracts/          # Shared transport-contract boundary.
  database/           # PostgreSQL/Drizzle infrastructure.
  eslint-config/      # Shared lint policy.
  typescript-config/  # Shared TypeScript policy.

infra/
  postgres/           # Reproducible local PostgreSQL initialization.

docs/
  product/            # Product vision and legacy migration knowledge.
  domain/             # Ubiquitous language and domain ownership.
  architecture/       # Cross-cutting architecture policies.
  adr/                # Durable architecture decisions.
```

## Root quality commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm format
pnpm format:check
```

## Database commands

```bash
pnpm db:up
pnpm db:stop
pnpm db:logs

pnpm db:generate
pnpm db:check
pnpm db:migrate

pnpm db:reset:dev
pnpm db:reset:test
pnpm db:validate
```

Destructive database commands contain additional target checks but should still be treated deliberately.

## Engineering direction

Manasiness V1 is a modular monolith.

Applications may consume explicitly owned packages, but reusable packages must not depend on application internals.

A shared database does not imply shared business ownership.

Before changing a domain, start from the product vision and then read the relevant material under:

```text
docs/domain/
docs/architecture/
docs/adr/
```