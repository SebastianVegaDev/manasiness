# Web Form Interaction Foundation

`platform/forms/` owns reusable, domain-neutral form orchestration for Manasiness Web.

It composes the lower-level primitives in `platform/ui/`; it does not replace them and it does not own business rules.

Read:

```text
docs/product/form-and-mutation-patterns.md
docs/product/ui-primitives.md
apps/web/src/platform/api/README.md
```

before changing this boundary.

## Strategy

The M2 baseline uses native HTML controls, React 19 `useActionState`, Zod where schema validation is appropriate, and the existing M1 API error contract.

React Hook Form is deliberately not adopted yet.

The current requirements do not justify another form-state dependency because:

- native controls remain the canonical field state boundary;
- `useActionState` covers async result and pending state;
- Zod already exists for transport-oriented validation;
- the shared API client already exposes structured response, transport, and protocol errors;
- no current real form requires large dynamic field arrays or complex subscription-based field-state orchestration.

Re-evaluate a focused form-state dependency when real product forms demonstrate concrete complexity that native React would otherwise solve poorly. Do not leak such a dependency into `platform/ui` primitive APIs.

## Ownership

```text
platform/ui
    control semantics and visual primitives

platform/forms
    reusable form composition and submission conventions

feature/application code
    field names
    form schemas
    business rules
    API calls
    machine-code-to-copy mapping
    post-success navigation/reset
```

Generic form infrastructure must not know concepts such as Customer, Product, Sale, Organization, or Identity.

## Validation layers

Keep these layers distinct:

```text
client presentation validation
    fast local feedback and field orientation

shared transport validation
    request/response shape validation, normally through shared Zod contracts

API/application rejection
    business invariants, conflicts, authorization, concurrency, and other authoritative decisions
```

Client validation improves feedback but never replaces backend validation.

## Field composition

`FormField` wires a field's visible label, optional description, validation error, required state, and ARIA relationships.

It uses a render function so the owning feature still chooses the concrete control:

```tsx
<FormField
    id="display-name"
    label={copy.displayName}
    description={copy.displayNameHelp}
    error={displayNameError}
    required
    requirementLabel={copy.required}
>
    {(controlProps) => <Input {...controlProps} name="displayName" />}
</FormField>
```

The same pattern can wrap `Select`, `Checkbox`, `Radio`, or another compatible control without making the form layer own their visual APIs.

Do not infer field IDs or names from labels. Use stable explicit identifiers.

## Submission

For mutation forms with recoverable validation or business rejection, do not make direct `<form action={...}>` submission the universal default because React resets uncontrolled fields after a successful form Action.

The canonical M2 pattern is:

```text
onSubmit
→ preventDefault
→ capture FormData
→ startTransition
→ dispatch the useActionState Action
```

This preserves entered values while a known failure is returned as Action state. Reset or navigate only after confirmed success when the owning feature requires it.

While pending:

- use the shared `Button` `pending` contract;
- ignore duplicate submit events;
- expose `aria-busy` on the form where useful;
- do not automatically retry mutations.

The M1 TanStack Query default remains `retry: false` for mutations.

## Error mapping

`mapFormSubmissionError()` classifies the existing M1 API client errors without parsing human message strings.

It preserves machine-readable facts such as:

```text
error type
error code
HTTP status
validation issue paths
request ID
transport reason
protocol failure
```

Generic form infrastructure does not convert every future business code into user-facing copy.

Feature/application code owns machine-code-to-localized-copy mapping near the capability that understands the business meaning.

Unexpected technical messages, stack traces, and raw backend internals must not be rendered directly to users.

## Invalid submission focus

After a client-side invalid submission, `focusFirstInvalidControl()` moves focus to the first enabled element marked with `aria-invalid="true"` inside the form.

Do not force focus movement after every server rejection. Form-level API rejection should move focus only when it improves recovery/orientation.

## Destructive confirmation

`DestructiveConfirmationDialog` composes the existing `AlertDialog` primitive and requires explicit copy for:

- the action title;
- the consequence;
- confirm and cancel controls.

Do not use vague confirmation text such as "Are you sure?".

The caller owns the actual command, pending state, success/failure handling, and whether the dialog closes before or after that command completes.

## Unsaved changes

Do not install a global navigation blocker for every form.

Use unsaved-change protection only when losing edits would be meaningfully costly, such as a long multi-section form or substantial drafted transaction. Small search/filter forms and short disposable forms should not create constant interruption.

When a feature needs protection, it owns the definition of meaningful dirty state and composes the product confirmation pattern. Browser-level unload protection may be added only where justified and should not be the sole protection mechanism.

## Testing

Use the cheapest layer that proves the concern:

- unit tests for pure API-error classification;
- Browser E2E for field associations, invalid focus, pending/duplicate-submit behavior, recoverable rejection, success, and destructive confirmation;
- no fake business forms solely for testing shared infrastructure.
