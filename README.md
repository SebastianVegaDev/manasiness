# Manasiness

Manasiness is a multi-tenant business operations product being rebuilt from its domain model outward. Product scope and business semantics live under [`docs/`](docs/); implementation must conform to those documents rather than redefine them for convenience.

M1 establishes the executable engineering platform. The repository intentionally does not contain product-domain implementation yet.

## Prerequisites

- Node.js 24.21.0 (LTS baseline)
- pnpm 12.6.0
- Git

The repository pins pnpm through `packageManager` and declares the supported Node range in `package.json`. Node 24 includes Corepack, so pnpm can be activated without installing a second package-manager version manually.

```bash
corepack enable pnpm
pnpm --version
```

`pnpm --version` should print `12.6.0` from this repository.

## Install

From the repository root:

```bash
pnpm install
```

The generated `pnpm-lock.yaml` is part of the repository contract and must be committed. Do not hand-edit it.

## Workspace map

```text
apps/
  api/                # NestJS modular-monolith API runtime; see apps/api/README.missue.
  web/                # Next.js App Router web runtime; see apps/web/README.md.

packages/
  contracts/          # Shared transport-contract boundary.
  database/           # Database infrastructure boundary.
  eslint-config/      # Shared lint policy.
  typescript-config/  # Shared TypeScript policy.

docs/
  product/            # Product vision and legacy migration knowledge.
  domain/             # Ubiquitous language and domain ownership.
  architecture/       # Cross-cutting architecture policies.
  adr/                # Durable architecture decisions.
```

These workspaces are intentionally minimal in this issue. Do not add domain packages or generic `shared`, `common`, or `utils` areas to make the tree look complete.

## Root commands

All repository-level commands are orchestrated through Turborepo:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

A workspace participates in a command by defining the corresponding script in its own `package.json`. Later M1 issues will add the runtime-specific scripts as the API, web, database, lint, TypeScript, and test foundations are implemented.

## Engineering direction

Manasiness V1 is a modular monolith. Applications may consume explicitly owned packages, but reusable packages must not depend on app internals. Shared physical infrastructure does not make business ownership shared.

Before changing a domain, start from the [product vision](docs/product/product-vision.md), then read the relevant material under [`docs/domain/`](docs/domain/), [`docs/architecture/`](docs/architecture/), and [`docs/adr/`](docs/adr/).