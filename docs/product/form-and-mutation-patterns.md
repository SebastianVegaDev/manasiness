# Form, Validation, and Mutation Interaction Patterns

> **Status:** Active  
> **Milestone:** M2 — Product Experience Foundation  
> **Issue:** [#60](https://github.com/SebastianVegaDev/manasiness/issues/60)  
> **Scope:** Reusable form composition, validation boundaries, mutation UX, structured API-error mapping, and destructive confirmation.

## 1. Purpose

Manasiness will contain many forms whose consequences range from simple settings changes to sales, payments, corrections, and account operations.

Those features should not independently invent:

- label/help/error relationships;
- required-state presentation;
- validation focus behavior;
- pending/duplicate-submit behavior;
- API error classification;
- destructive confirmation;
- unsaved-change policy.

This document defines the shared interaction contract without implementing any business-domain form.

## 2. Ownership

The form foundation lives at:

```text
apps/web/src/platform/forms/
```

Responsibilities remain intentionally split:

```text
platform/ui
    native controls and interaction primitives

platform/forms
    reusable form composition
    accessible validation wiring
    generic submission/focus conventions
    structured API-error classification
    destructive confirmation composition

feature/application code
    form field set
    feature-owned schema
    business validation meaning
    API command/mutation
    machine-code-to-localized-copy mapping
    post-success navigation/invalidation
    meaningful dirty-state definition
```

`platform/forms` must never become a universal schema-driven CRUD framework.

## 3. Form-state strategy

M2 uses React 19's built-in async Action state together with native form controls and Zod where schema validation is appropriate.

React Hook Form is not adopted in M2.

### Why no additional form-state dependency yet

The current requirements can be expressed cleanly with:

- native HTML form controls;
- `useActionState` for async result/pending state;
- a normal `onSubmit` boundary when recoverable errors must preserve uncontrolled values;
- `startTransition` when manually dispatching an Action;
- the existing `Button` pending contract;
- Zod for transport/presentation schemas where useful;
- the existing structured M1 API client errors.

Adding React Hook Form now would introduce another runtime/upgrade abstraction before a real product form demonstrates the need for complex field arrays, deeply dynamic registration, or subscription-oriented field state.

This is a reversible decision. Re-evaluate when real M3+ forms provide concrete evidence.

### Important React Action reset behavior

A function supplied directly to `<form action={...}>` resets uncontrolled fields after a successful Action.

That is useful for forms whose successful submission should clear immediately, but it is not a safe universal default for forms that return recoverable validation/business rejection state.

The canonical M2 pattern for recoverable mutation forms is therefore:

```text
submit event
→ prevent native navigation
→ capture FormData
→ startTransition
→ dispatch useActionState Action
→ preserve DOM field values on recoverable failure
→ explicitly reset or navigate only after confirmed success when the feature requires it
```

Do not clear user input merely because an HTTP request completed.

## 4. Field composition

`FormField` composes the lower-level field primitives and provides the ARIA wiring for:

```text
visible label
required/optional indicator supplied as localized copy
help/description text
field error
aria-describedby
aria-invalid
aria-errormessage
native required state
```

The concrete control remains caller-owned through a render function.

This supports text-like controls and the existing selection/boolean primitives without leaking a form library through `platform/ui`.

### Required state

Required state must be semantic, not merely visual.

If a field is required:

- the actual control receives `required` where the native control supports it;
- visible required/optional wording is localized by the composing feature/surface;
- the error state does not rely on red color alone.

### Stable identifiers

Use explicit stable control IDs.

Do not derive identity from translated labels because labels can change by locale or copy revision.

## 5. Validation layers

Keep three validation responsibilities distinct.

### Client presentation validation

Purpose:

- fast feedback;
- obvious shape/range checks;
- focusing the relevant field;
- reducing avoidable round trips.

It is advisory UX, not authoritative business validation.

### Shared transport validation

Purpose:

- validate request/response structure;
- preserve typed contracts between Web and API;
- reject malformed payloads/protocol mismatches.

Shared Zod schemas may be reused where that genuinely represents the transport contract.

Do not turn the form's entire UI state into a transport/domain model merely because Zod is available.

### API/application rejection

The API/application layer remains authoritative for:

- business invariants;
- authorization;
- conflicts/concurrency;
- current server state;
- cross-record constraints;
- rules that cannot be trusted to the browser.

Client validation must never be treated as a security or business-rule boundary.

## 6. Structured API errors

The M1 Web/API boundary already exposes:

```text
ApiResponseError
ApiTransportError
ApiProtocolError
```

and response errors contain machine-readable:

```text
type
code
issues[]
request ID
HTTP status
```

`mapFormSubmissionError()` classifies those facts into form-consumable state.

It does **not** parse human message strings.

### Field issues

When `ApiError.issues` includes paths, form code may associate those issues with matching fields.

The path is the structural signal. Do not infer a field by searching error-message text.

If an issue cannot be associated with a known field, treat it as form-level/unscoped feedback rather than silently dropping it.

### Business error copy

Feature-specific machine codes remain mapped near the owning feature.

Correct direction:

```text
API code: sale.revision_conflict
        ↓
Sales feature copy mapping
        ↓
localized operator-facing explanation
```

Incorrect direction:

```text
giant platform/forms switch containing every future business code
```

### Technical failures

Protocol failures, transport failures, internal errors, stack traces, and arbitrary exception messages must not be rendered directly to users.

A request ID may be shown as secondary support/debug information when useful.

Issue #62 owns the broader product-wide feedback vocabulary and notification treatment.

## 7. Submission and pending state

A mutation form must make submission state obvious and prevent accidental duplicates.

While a submission is pending:

- its submit action is disabled through the shared `Button` pending contract;
- the button retains an understandable accessible name/pending label;
- the form exposes `aria-busy` where appropriate;
- duplicate submit handlers ignore additional submission attempts;
- destructive or conflicting controls may be disabled when interacting with them would invalidate the pending operation.

Do not disable every readable part of the page merely because one mutation is pending.

### Retry policy

The M1 QueryClient default is:

```text
mutations.retry = false
```

Keep that default.

A mutation may opt into retry only when the operation is explicitly safe/idempotent and the owning feature understands the consequences.

## 8. Validation failure and focus

After client-side validation failure:

1. render field errors;
2. connect them programmatically to their controls;
3. focus the first enabled invalid control;
4. preserve the entered values.

`focusFirstInvalidControl()` implements the reusable focus step.

Do not move focus after every API rejection automatically. A form-level conflict or business rejection may be understandable without stealing focus from the operator. Move focus when it materially improves recovery/orientation.

## 9. Recoverable server failure

On recoverable API/application rejection:

- preserve user-entered values;
- render field issues at fields when structural paths are available;
- render the broader rejection at form level when appropriate;
- keep machine code/type available to feature logic;
- keep request ID available for support/debug use;
- do not automatically retry a mutation;
- allow correction and resubmission.

Conflict/concurrency errors should not be misrepresented as generic field validation if the resolution requires refreshing/reviewing server state.

## 10. Success behavior

Success feedback should match the consequence of the action.

A feature may choose to:

- remain on the form and show the resulting saved state;
- reset the form when a repeated-entry workflow genuinely benefits from it;
- navigate to a created/detail surface;
- invalidate/refetch server state;
- show a concise transient confirmation when the resulting UI does not make success obvious.

Do not hard-code navigation or reset behavior in generic form infrastructure.

Issue #62 owns the broader success/toast conventions.

## 11. Destructive confirmation

`DestructiveConfirmationDialog` builds on the shared `AlertDialog` primitive.

Every consequential confirmation must explicitly name:

```text
the action
the consequence
the confirm action
the cancel action
```

Avoid vague copy such as:

```text
Are you sure?
Yes / No
```

Prefer consequence-oriented language such as:

```text
Deactivate product
The product will no longer be available for new sales. Existing history is preserved.
Cancel / Deactivate product
```

The generic dialog does not decide whether a domain operation is reversible, irreversible, a deactivation, correction, cancellation, or deletion. The feature owns that semantic truth.

## 12. Unsaved changes

Unsaved-change protection must be proportionate.

Do not globally block navigation as soon as any input changes.

Use protection when losing edits would be materially costly, for example:

- long multi-section forms;
- substantial transaction drafts;
- carefully entered corrections;
- workflows with expensive reconstruction.

Usually do not block for:

- search/filter inputs;
- short disposable forms;
- toggles whose changes are applied immediately;
- data that can be trivially re-entered.

The feature owns the definition of meaningful dirty state.

If browser `beforeunload` protection is later justified, use it only as a last-resort complement to in-app navigation protection and do not install it globally.

## 13. Accessibility baseline

Representative form experiences must preserve:

- visible labels;
- semantic required state;
- programmatic description/error relationships;
- non-color-only invalid state;
- keyboard-reachable controls;
- focus on the first invalid field after local invalid submission;
- understandable pending button state;
- form-level rejection semantics;
- explicit destructive action/consequence copy;
- accessible modal focus/return behavior inherited from `AlertDialog`.

Do not replace semantic HTML with ARIA when native semantics already exist.

## 14. Testing strategy

The shared form foundation uses layered testing.

### Unit

Pure error mapping is tested without a browser:

- response errors preserve type/code/status/request ID;
- field issues are selected by structural path;
- unscoped issues remain visible to form-level handling;
- transport/protocol/unexpected failures remain distinct.

### Browser E2E

The product-neutral `/foundation` form fixture proves representative behavior:

- invalid field feedback;
- `aria-invalid`/error association;
- focus after invalid submission;
- pending submit state;
- duplicate-submit protection;
- preservation of entered values on recoverable rejection;
- machine-code-driven form-level API rejection copy;
- successful mutation flow;
- destructive confirmation wording/focus behavior.

The fixture is engineering evidence, not a fake product feature.

## 15. Re-evaluation triggers

Revisit the form-state strategy when real product work demonstrates one or more of:

- large dynamic field arrays;
- deeply nested repeatable sections;
- significant performance problems from controlled state;
- complex cross-field subscriptions;
- repeated boilerplate that cannot be removed without obscuring ownership;
- accessibility behavior that a maintained form library demonstrably improves.

If a library is adopted later, keep `platform/ui` primitive APIs independent from it and document the migration boundary.
