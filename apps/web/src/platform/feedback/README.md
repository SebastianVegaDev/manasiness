# Web Feedback and State Foundation

`platform/feedback/` owns reusable, domain-neutral feedback composition for Manasiness Web.

It composes `platform/ui` primitives and structured API-client errors. It does not own business rules, feature error wording, or application commands.

Read:

```text
docs/product/feedback-and-state-patterns.md
docs/product/ui-primitives.md
apps/web/src/platform/api/README.md
```

before changing this boundary.

## Ownership

```text
platform/ui
    low-level visual and interaction primitives

platform/feedback
    product-wide feedback channels
    generic page/section states
    transient notification orchestration
    broad API/client failure classification
    consequential confirmation composition

platform/forms
    field validation and form-specific submission feedback

platform/collections
    collection-specific loading/empty/zero-result/error states

feature/application code
    business meaning
    machine-code-to-localized-copy mapping
    recovery commands
    success consequences
    whether an operation is reversible or irreversible
```

Do not move domain status vocabulary or domain error catalogs into this boundary.

## Alerts and banners

`FeedbackAlert` supports product-wide inline alerts and persistent banners.

Tone and announcement behavior are separate decisions:

```text
tone
    info | success | warning | critical

announcement
    none | polite | assertive
```

A critical-looking static message does not automatically become an assertive live region. Use live announcements only when dynamically inserted feedback needs to be announced.

## Generic states

`FeedbackState` covers page/section-level states that are not collection-specific:

```text
empty
zero-results
not-configured
no-history
unavailable
error
```

The caller supplies all user-facing copy and only supplies an action when a legitimate recovery or next step exists.

`FeedbackLoadingState` pairs visible skeleton structure with meaningful status semantics. Skeletons themselves remain presentation-only.

`FeedbackRefreshStatus` is for background refresh while useful existing content remains visible.

## Failure classification

`classifyApiClientFailure()` maps the existing API client error classes into stable machine-readable facts:

```text
kind
source
status
code
requestId
retryable
```

It never parses `Error.message` and never creates operator-facing copy.

Feature/application code maps known machine codes to localized business explanations. Product-wide fallback copy may key from broad failure kinds such as `network`, `rate_limited`, or `internal_error` without learning feature-specific codes.

## Transient notifications

`FeedbackToastProvider` owns transient notification lifetime and dismissal only.

Use it for concise non-essential confirmation that would otherwise be easy to miss.

Do not use a toast as the only representation of:

- validation that must be corrected;
- a business rejection the operator must revisit;
- a persistent outage or configuration problem;
- destructive consequences;
- information required to continue the workflow.

Non-critical notifications auto-dismiss by default and pause while hovered or focused. Critical notifications are persistent by default. Every notification has an explicit dismiss action.

The provider requires localized viewport and dismiss labels from its consumer; it does not own product copy.

## Consequential confirmation

`DestructiveConfirmationDialog` composes `AlertDialog` and requires the caller to provide:

- the exact action title;
- the consequence;
- a visible `reversible` or `irreversible` consequence label;
- explicit confirm/cancel wording.

The component does not infer business semantics from HTTP verbs or button labels.

A feature must decide whether its operation represents deactivation, deletion, cancellation, reversal, correction, or another domain command.

## Accessibility

- Do not make every warning/error a live region.
- Critical meaning must include text, not color alone.
- Toasts must remain dismissible and pause while the user interacts with them.
- Do not move focus for passive success notifications.
- Move focus when it materially improves recovery or orientation.
- Reuse the native `AlertDialog` focus/keyboard behavior for consequential confirmation.
- Surface a retry action only when retry is genuinely safe/useful for that read or workflow.
- Request IDs are secondary support context, not primary error copy.

## Testing

Use the cheapest layer capable of proving behavior:

- unit tests for broad failure classification and retryability;
- browser E2E for live semantics, toast dismissal/pause behavior, state distinctions, recovery presentation, and confirmation focus behavior;
- existing form/collection E2E remain responsible for their more specific interaction contracts.
