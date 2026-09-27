# Static Analysis and Module Boundaries

> **Status:** Active  
> **Milestone:** M1 — Engineering Platform  
> **Scope:** Repository-wide engineering policy

## Purpose

Manasiness uses shared static-analysis tooling to prevent individual workspaces from developing incompatible engineering conventions.

The repository uses three distinct tools with separate responsibilities:

```text
TypeScript
→ type correctness and compiler-level safety

ESLint
→ semantic code-quality and architectural rules

Prettier
→ deterministic formatting
```

These responsibilities should remain separate.

Formatting concerns should not be reimplemented as ESLint rules when Prettier already owns them.

## Formatting

Repository source and configuration files use four spaces per indentation level.

Prettier is authoritative for formatting.

The baseline is:

```text
tabWidth = 4
useTabs = false
```

A Tab key press may be configured by the editor to insert the corresponding four spaces, but committed source files use spaces rather than literal tab characters.

The root commands are:

```bash
pnpm format
pnpm format:check
```

`format` modifies supported files.

`format:check` performs a read-only verification suitable for CI.

Historical M0 documentation under `docs/` is initially excluded from automatic repository-wide formatting to avoid unrelated mass rewrites.

## TypeScript strictness

All TypeScript workspaces derive their compiler policy from `@manasiness/typescript-config`.

The shared baseline intentionally enables strict options that make uncertain states visible rather than silently assuming correctness.

Examples include:

- unchecked array/index access remains potentially undefined;
- optional properties preserve exact optional semantics;
- unused variables and parameters fail validation unless deliberately identified;
- unreachable code is rejected;
- implicit fallthrough is rejected;
- casing must remain consistent;
- imports preserve explicit module semantics.

A workspace must not weaken a shared compiler rule merely to make a local implementation compile.

If a shared rule is genuinely inappropriate, the exception must have an explicit technical reason.

## Runtime-specific configuration

The shared TypeScript package exposes separate configurations for:

```text
base
library
node
react
```

`base` contains runtime-independent correctness policy.

`library` is suitable for reusable runtime-neutral packages.

`node` adds Node-oriented module and runtime semantics.

`react` adds browser and JSX-oriented semantics suitable for the future Next.js application.

Framework-specific requirements may extend these configurations later without replacing the shared strictness baseline.

## Workspace imports

Workspace package names use:

```text
@manasiness/<workspace>
```

Cross-workspace imports must use a package's public entry point.

Preferred:

```typescript
import { Example } from '@manasiness/contracts';
```

Forbidden:

```typescript
import { Example } from '@manasiness/contracts/src/internal/example';
```

A package's internal directory structure is not a public contract.

## Application and package direction

The dependency direction is:

```text
apps
  ↓
packages
```

Reusable packages must not depend on application internals.

Therefore this is invalid:

```text
packages/database
    ↓
apps/api
```

An application is a composition root and executable boundary.

It must not become a dependency of reusable infrastructure.

## Domain ownership

Workspace reuse must not erase domain ownership.

Do not introduce generic locations such as:

```text
shared/
common/
utils/
```

simply because code is used more than once.

Reusable code needs an explicit responsibility and owner.

Future domain modules remain responsible for their own:

- business invariants;
- lifecycle;
- authoritative mutations;
- persistence semantics.

Shared tooling must not become shared business ownership.

## Path aliases

TypeScript path aliases must not be used to disguise architecture.

Cross-workspace imports should use real workspace packages and their declared package names.

Local aliases may later be introduced inside an application when they improve discoverability and remain compatible with:

- TypeScript;
- builds;
- tests;
- ESLint;
- runtime resolution.

An alias must not allow consumers to bypass another workspace's public API.

## Circular dependencies

Circular workspace dependencies are prohibited.

A dependency such as:

```text
package-a
→ package-b
→ package-a
```

is evidence that ownership or package responsibility is unclear.

Do not resolve a cycle by creating a generic shared dumping ground.

Instead determine which concept owns the behavior or whether the collaboration belongs at a higher application orchestration layer.

## Exceptions

Static-analysis rules are repository policy.

Do not disable them globally to make one implementation pass.

A local suppression is acceptable only when:

1. the rule does not correctly model the specific situation;
2. the reason is documented next to the suppression;
3. the suppression is as narrow as possible.

Architecture-level exceptions should be documented through the appropriate architecture document or ADR when consequential.