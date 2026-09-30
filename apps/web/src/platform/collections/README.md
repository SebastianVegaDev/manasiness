# Web Collection Patterns

`platform/collections/` owns reusable, domain-neutral composition for operational collection surfaces.

Read:

```text
docs/product/product-experience.md
docs/product/collection-and-data-display-patterns.md
docs/product/ui-primitives.md
```

before changing collection interaction behavior.

## Ownership

The boundary is intentionally split:

```text
platform/ui
    native controls and visual primitives

platform/collections
    collection composition
    URL-state helpers
    collection toolbar layout
    pagination presentation
    collection-specific state presentation
    semantic table/compact composition

feature code
    query definitions
    columns and fields
    search semantics
    filter vocabulary
    row/item actions
    status business meaning
    pagination backend contract
    server-state invalidation
```

`platform/collections` must not become a repository-backed CRUD framework or a universal data-grid model.

## Search and filters

The default for server-backed operational search is explicit submission.

This keeps URL changes intentional and avoids issuing a remote request for every keystroke by default. A feature may use debounced search when it has concrete evidence that the search is cheap, reversible, and improves the workflow.

Simple filters may update immediately when the selection itself is the complete intent.

Meaningful collection state belongs in the URL when it changes which records are being viewed. The conventional free-text key is:

```text
q
```

Defaults should be omitted when the URL remains unambiguous.

Changing search/filter state normally resets the feature-owned pagination key.

## Pagination

`CollectionPagination` receives opaque previous/next hrefs.

It does not know whether a feature uses:

```text
page numbers
offsets
cursors
continuation tokens
```

The feature/API boundary owns those semantics.

Infinite scroll is not the default operational-list pattern because it weakens stable location, browser history, and deliberate navigation for many business lists.

## Data display

Use `CollectionTable` when relationships are genuinely tabular.

Use the compact list composition when narrow layouts need a different reading order. `CollectionResponsiveDataView` switches presentation with CSS rather than viewport JavaScript.

The feature owns the actual cells, labels, fields, and actions.

Do not hide essential information only to force a desktop table onto a narrow viewport.

## Selection

M2 does not provide reusable bulk selection.

Selection/bulk actions should be introduced only when a real V1 workflow demonstrates the need and can define the consequences safely.

## TanStack Table

M2 does not add `@tanstack/react-table`.

The current shared requirements do not need a general coordinator for sorting, filtering, pagination, selection, column state, and row models. Native semantic tables plus narrow collection composition are sufficient and keep feature ownership explicit.

Re-evaluate a headless table engine when real domain screens demonstrate repeated complex table behavior that cannot be expressed cleanly without it.

## Accessibility

Collection surfaces must preserve:

- accessible search/filter names;
- semantic table markup for tabular relationships;
- keyboard-operable controls and pagination;
- text or icon meaning in addition to status color;
- understandable focus after navigation/filtering;
- compact/mobile presentation that retains essential information;
- proportionate loading/status announcements.

Issue #63 will add broader automated accessibility gates. Collection components should remain semantic before those tests exist.
