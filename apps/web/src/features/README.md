# Web Features

`features/` is reserved for reusable product-facing web capabilities that appear as the product experience is implemented.

Do not create feature folders in advance merely to mirror the backend domain map.

A feature should exist when there is concrete user-facing behavior to own.

## Route composition

Files under `src/app/` define routes, layouts, loading/error boundaries, metadata, and route-level composition.

Route files should remain thin.

They should compose feature/platform capabilities rather than becoming large implementations themselves.

## Feature ownership

A future feature may own code such as:

```text
features/<feature>/
    ui/
    model/
    actions/
```

Only create those folders when they represent real responsibilities.

The exact internal shape can vary according to feature complexity.

## Avoid generic dumping grounds

Do not create repository-wide folders such as:

```text
components/
services/
utils/
helpers/
hooks/
```

merely because multiple files share a technical shape.

Reusable code should have a discoverable owner and responsibility.

## Backend ownership

Frontend features do not own backend business invariants.

The browser must not:

- access the database directly;
- reimplement authoritative domain rules;
- receive server secrets;
- mutate another backend domain by bypassing its application/API boundary.
