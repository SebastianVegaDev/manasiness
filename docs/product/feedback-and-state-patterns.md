# Feedback, Status, Loading, Empty, and Error-State Patterns

> **Status:** Active  
> **Milestone:** M2 — Product Experience Foundation  
> **Issue:** [#62](https://github.com/SebastianVegaDev/manasiness/issues/62)  
> **Scope:** Product-wide feedback channels, generic states, transient notifications, structured failure treatment, and consequential confirmation.

## 1. Purpose

Operators need to understand whether work is pending, complete, unavailable, empty, rejected, or recoverable without learning a different feedback language in every feature.

This document establishes a shared feedback vocabulary while preserving feature ownership of business meaning.

It does not create a global catalog of domain errors and it does not make every asynchronous event a toast.

## 2. Ownership

Responsibilities remain deliberately split:

```text
platform/ui
    Button / Badge / Skeleton / Dialog / AlertDialog primitives

platform/feedback
    product-wide feedback channel composition
    generic page/section states
    transient notification orchestration
    broad API/client failure classification
    consequential confirmation composition

platform/forms
    field-level validation and form submission composition

platform/collections
    collection-specific loading / empty / zero-result / error states

feature/application code
    business meaning
    feature-specific machine-code mapping
    localized operator copy
    legitimate recovery commands
    success consequences
    reversible/irreversible truth
```

Generic infrastructure must not learn domain concepts merely to centralize copy.

## 3. Feedback-channel vocabulary

Use the narrowest channel that keeps the information understandable and available for as long as it matters.

| Channel | Use when | Do not use as |
| --- | --- | --- |
| Field/form feedback | Input or submission needs correction near the form | A product-wide outage banner |
| Inline page/section alert | A local condition needs durable context or recovery | A temporary confirmation that is already obvious |
| Transient toast/notification | A short non-essential confirmation could otherwise be missed | The only representation of essential error or validation information |
| Persistent banner | A condition spans a meaningful surface and must remain visible while active | Routine success feedback |
| Consequential confirmation | An action requires the operator to understand a meaningful consequence before execution | Generic confirmation for harmless actions |
| Full-page/section state | Content cannot yet be shown, does not exist, is unavailable, or failed to load | A replacement for normal content during background refresh |
| Status badge/indicator | Compact visible status helps scanning | Color-only business meaning |

Channel choice is about persistence and recovery, not visual severity alone.

## 4. Announcement semantics

Visual tone and assistive-technology announcement are separate decisions.

A static critical alert does not automatically require `role="alert"`.

Use:

```text
announcement=none
    static or already-present information

announcement=polite
    dynamically inserted non-urgent confirmation/status

announcement=assertive
    dynamically inserted urgent information requiring immediate awareness
```

Live regions should be sparse. Multiple competing announcements make the product harder to operate.

## 5. Loading and asynchronous work

### Initial loading

Use a meaningful loading region when the requested content does not yet exist in the UI.

Skeletons may preserve expected layout, but skeleton markup is presentation-only. The surrounding region owns the accessible loading label and `aria-busy` semantics.

Do not show a spinner or skeleton merely because a trivial operation took a few milliseconds. Avoid loader flashes that make a fast interface feel unstable.

### Mutation pending

The existing M2 form/button contract remains authoritative:

- pending mutation actions expose a pending label;
- duplicate submission is prevented;
- related conflicting actions may be disabled;
- mutations are not retried automatically by generic infrastructure.

### Background refresh

If usable data already exists, preserve it.

Correct:

```text
existing content stays visible
+
small refresh status
```

Incorrect:

```text
replace useful content with full skeleton
whenever a background refetch begins
```

### Long-running or failed loading

Do not leave the operator in an indefinite loading state after a known failure.

Transition to an error/unavailable state with a real recovery action when recovery is legitimate.

## 6. Empty-state taxonomy

Absence has different meanings and must not collapse into one generic “Nothing here” component.

### Truly empty

The underlying collection/content has no records yet.

Explain the absence. Offer a creation/next action only if the current product capability genuinely supports it.

### Filtered/search zero result

Underlying content exists, but the current view matches nothing.

Prefer recovery such as clearing or adjusting search/filter state.

This is not a true empty collection.

### Not configured yet

A prerequisite or configuration has not been completed.

Only expose setup when the operator actually has a valid setup path. Do not promise future M3 authorization behavior in M2.

### No history yet

The entity/surface exists but no relevant historical event has occurred.

Treat this as a normal lifecycle state, not an error.

### Unavailable / no permission later

Unavailable content is distinct from empty, not found, and failed loading.

M2 provides presentation semantics only. M3 owns real authentication, Membership, and permission-aware decisions.

## 7. Success feedback

Success does not always need a notification.

Prefer no toast when the resulting UI makes the success obvious, for example:

- navigation to the newly created detail page;
- a visible status change;
- an updated list row;
- a dialog closing into an unmistakably updated surface.

Use a transient confirmation when the successful mutation has little or no visible consequence and the operator would otherwise be uncertain.

Use persistent state/history when the success itself is a durable business fact that must remain inspectable. Generic toast infrastructure never substitutes for business history/audit semantics.

Do not toast routine navigation or successful reads.

## 8. Error and rejection model

The M1 transport contract already exposes stable machine-readable categories:

```text
invalid_input
unauthenticated
unauthorized
not_found
conflict
business_rejection
rate_limited
internal_error
```

The Web API client additionally distinguishes:

```text
network
 timeout
protocol failure
unexpected exception
```

`classifyApiClientFailure()` turns those existing client errors into presentation-neutral facts:

```text
kind
source
status
code
requestId
retryable
```

It does not expose the raw technical message as presentation copy.

## 9. Broad treatment by failure kind

These are product-level defaults, not a domain-code dictionary.

| Kind | Typical treatment |
| --- | --- |
| `invalid_input` | Field/form feedback when structural issue paths exist; otherwise concise local rejection |
| `unauthenticated` | M3 owns session/login recovery; M2 only reserves the category |
| `unauthorized` | Persistent unavailable/restricted state; navigation visibility never replaces authorization |
| `not_found` | Not-found page/section state when resource identity truly does not resolve |
| `conflict` | Persistent local explanation; often requires refresh/review rather than blind retry |
| `business_rejection` | Feature-owned localized explanation based on machine code |
| `rate_limited` | Explain temporary limit; retry only according to real transport/application guidance |
| `internal_error` | Safe fallback copy, optional request ID, retry for safe reads when appropriate |
| network/timeout | Recoverable connection/read state when retry is legitimate |
| protocol | Safe unexpected-response treatment; do not retry blindly by default |
| unexpected | Opaque safe fallback; never render exception internals |

A feature may refine treatment because it understands the operation, but it must not parse human error strings to do so.

## 10. Feature-specific machine codes

Broad categories do not replace feature ownership.

Correct:

```text
business_rejection
code: sale.revision_conflict
        ↓
Sales feature understands the code
        ↓
localized operator explanation + legitimate action
```

Incorrect:

```text
platform/feedback switch
    every sales code
    every inventory code
    every finance code
    ...
```

The platform owns transport/presentation vocabulary, not the business language of future domains.

## 11. Technical information and request IDs

Never render directly:

- exception stacks;
- raw API error messages intended for diagnostics;
- protocol parser details;
- request/response bodies;
- service addresses;
- credentials/tokens;
- arbitrary internal exceptions.

A request ID may be shown as secondary support information for unexpected failures.

It must not dominate the page and it is never Identity, Organization, authorization, or business audit history.

## 12. Retry policy

A visible Retry action means the current operation is actually safe/useful to repeat.

The shared classifier can identify broadly retryable transport cases, but the feature still owns operation semantics.

For example:

- retrying a failed read after network loss is usually reasonable;
- automatically retrying a non-idempotent payment mutation is not justified by a generic 500 response.

The existing M1 mutation retry default remains `false`.

## 13. Transient notifications

`FeedbackToastProvider` owns only transient notification orchestration.

### Default behavior

- non-critical notifications may auto-dismiss;
- critical notifications remain persistent by default;
- every notification has an explicit dismiss control;
- auto-dismiss pauses while the notification is hovered or contains focus;
- product copy is supplied by the caller;
- the viewport uses the shared toast layer token.

### Essential information rule

A toast must never be the only place where information required for recovery or later reference appears.

If the operator must reread it, correct something, copy a request ID, or decide what to do next, keep the durable representation inline/page-level.

## 14. Alerts and banners

`FeedbackAlert` supports semantic tones:

```text
info
success
warning
critical
```

Every tone includes visible text/structure; hue is supplementary.

Use `presentation="banner"` for a persistent cross-section condition without creating a separate business-specific component merely to style it.

Do not make a banner sticky/global unless the actual product condition warrants that reach.

## 15. Status indicators

`Badge` remains the low-level status primitive.

The owning feature supplies status vocabulary such as:

```text
Paid
Overdue
Draft
Cancelled
```

The feedback layer does not define those business states.

Status meaning must remain understandable without hue alone.

## 16. Consequential and destructive confirmation

`DestructiveConfirmationDialog` is owned by `platform/feedback`, not `platform/forms`.

The component composes the existing native `AlertDialog` primitive and requires explicit:

```text
action title
description
consequence
reversible | irreversible classification + visible label
confirm wording
cancel wording
```

Avoid:

```text
Are you sure?
Yes / No
```

Prefer consequence-oriented language.

The caller remains authoritative for whether the operation is:

- deactivation;
- irreversible deletion;
- cancellation;
- reversal;
- correction;
- another domain command.

Generic UI must never infer those semantics from a button variant.

## 17. Form integration

`platform/forms` continues to own:

- field/error relationships;
- form-level validation summary;
- submission/focus conventions;
- selection of field issues from structural API paths.

Forms may compose product-wide feedback and consequential confirmation from `platform/feedback`.

This removes confirmation ownership from the form layer without moving field validation into the feedback layer.

## 18. Collection integration

`platform/collections` continues to own its specific empty/zero-result/loading/refresh composition established in #61.

Do not replace those components simply because generic feedback states now exist.

The two boundaries express different responsibilities:

```text
feedback
    generic page/section vocabulary

collections
    collection interaction contract
```

They should remain visually coherent through shared semantic tokens and primitives.

## 19. M3 handoff

M2 does not implement authentication redirects, Membership checks, or permission decisions.

M3 should reuse this feedback vocabulary when it introduces:

- unauthenticated session recovery;
- unauthorized/restricted surfaces;
- Organization availability;
- permission-aware actions.

The backend/application remains authoritative for authorization. Hiding a UI action is not authorization enforcement.

## 20. Accessibility

Representative feedback must preserve:

- non-color-only meaning;
- restrained live-region use;
- dismissible/pausable transient notifications;
- keyboard-reachable notification dismissal;
- focus movement only when recovery/orientation benefits;
- retry actions with understandable labels;
- modal focus and focus return from the shared `AlertDialog` foundation;
- visible consequence wording for destructive actions;
- status text that remains understandable to screen-reader users.

Do not replace native semantics with unnecessary ARIA.

## 21. Testing strategy

### Unit

Pure tests cover broad client failure classification:

- every API error type remains distinguishable;
- machine code/status/request ID are preserved;
- retryability follows the existing API-client contract;
- network and timeout remain distinct;
- protocol failure remains distinct;
- arbitrary exceptions become opaque unexpected failures.

### Browser E2E

The `/foundation` engineering fixture verifies:

- durable banner versus transient notification behavior;
- manual toast dismissal and pause while focused;
- loading/background-refresh semantics;
- true empty versus zero-result state;
- not-configured, no-history, and unavailable states;
- internal/network/protocol failure treatment;
- technical API message suppression;
- request-ID support context;
- retry availability only where classified as recoverable;
- consequential confirmation wording and focus return.

Existing form E2E continues to cover mutation pending, validation failure, recoverable business rejection, success, and destructive confirmation composition.

Existing collection E2E continues to cover collection-specific loading, refresh, empty, zero-result, error, unavailable, and responsive behavior.

## 22. Deliberate deferrals

M2/#62 does not implement:

- notification inbox/history;
- push notifications;
- offline sync;
- domain-specific error catalogs;
- business audit events;
- M3 authentication redirects;
- automatic mutation retries;
- a third-party toast/headless UI dependency.

## 23. Durable contract

Later features should be able to answer four questions for every meaningful state:

1. What happened?
2. Does the operator need to act?
3. How long must the information remain available?
4. Which layer owns the truth and recovery action?

If generic feedback infrastructure must learn feature business rules to answer those questions, the responsibility has crossed the wrong boundary.
