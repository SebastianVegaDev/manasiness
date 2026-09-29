## Summary

<!-- What changed? Describe behavior/responsibility rather than only listing files. -->

## Why

<!-- Why is this change necessary? Link the problem back to the issue, domain requirement, platform requirement, bug, invariant, or architectural need. -->

## Scope

<!-- What is included? Also state important things deliberately NOT implemented when that helps keep the issue boundary clear. -->

## Validation

<!-- List commands actually executed. Delete commands that were not run. Never claim unexecuted validation passed. -->

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

### Additional validation

<!-- Examples when applicable: pnpm db:check, pnpm db:validate, pnpm test:e2e. Manual scenarios may also be documented here. -->

## Database / migrations

- No physical database schema change.
- Migration added and validated.

<!-- If a migration exists, describe the schema/constraint/RLS/backfill impact. Delete the option that does not apply. -->

## Architecture

- No architecture decision changed.
- ADR added/updated/superseded.

<!-- If architecture changed, link the ADR and summarize the decision. Delete the option that does not apply. -->

## Security / tenancy

- No security/tenant boundary changed.
- Security/tenant implications are described below.

<!-- Call out authentication, authorization, Organization context, RLS, credentials, sessions/cookies, secret handling, logging/redaction, or other security-sensitive boundary changes. -->

## Contracts / compatibility

- No externally consumed transport contract changed.
- Contract/compatibility impact is described below.

<!-- Describe request/response/error-code compatibility when applicable. -->

## Issue

Closes #

<!-- Replace with the issue number when this PR fully resolves it. -->
