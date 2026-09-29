# Web UI Primitives

`platform/ui/` owns Manasiness's reusable, domain-neutral Web UI primitives.

Read:

```text
docs/product/ui-primitives.md
docs/adr/0015-native-first-web-ui-primitives.md
```

before adding or materially changing a primitive.

## What belongs here

A primitive belongs here when it is:

- cross-cutting;
- domain-neutral;
- semantically stable;
- reusable by multiple product areas;
- accessibility-sensitive enough that central ownership reduces repeated work.

Examples:

```text
Button
Input
Checkbox
Menu
Dialog
Badge
Skeleton
```

## What does not belong here

Do not place feature/business components here.

Examples:

```text
SaleCard
CustomerTable
InventoryStatus
WorkerSummary
```

Those components belong with the feature that owns their business meaning.

Do not create generic sibling dumping grounds such as:

```text
components/
common/
utils/
```

to avoid deciding ownership.

Small helpers that exist only to support this primitive layer may live under:

```text
platform/ui/internal/
```

and must not become a second general-purpose utility layer.

## Styling

Primitive styles use CSS Modules and consume:

```text
platform/styling/tokens.css
```

Do not introduce literal feature palettes or a second theme source.

`className` is available for composition/layout escape hatches. Repeated visual overrides indicate that the primitive or token contract should be improved instead.

## Product copy

Primitives own interaction semantics, not product wording.

Accessible labels/help text whose wording is visible or announced to users should be supplied by the composing shell/feature when the wording is not structurally intrinsic.

For example, Dialog requires an explicit `closeLabel` rather than silently injecting an English accessible name.

Do not add new English default copy to a reusable primitive merely to make a prop optional.

See:

```text
docs/product/localization-and-copy.md
```

for the localization/copy ownership contract.

## Client boundaries

Keep Client Components narrow.

The initial interactive client primitives are:

```text
Menu
Dialog
```

Other primitives remain server-compatible unless browser state or browser APIs are genuinely required.

## Dependency strategy

The current primitive foundation is native-first.

Do not add a headless UI dependency just to wrap native controls.

Re-evaluate Base UI, Radix, or another maintained accessible primitive when a real product requirement needs complex widget behavior that would otherwise create substantial custom interaction infrastructure.
