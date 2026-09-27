# API Domain Modules

This directory is the physical home for future Manasiness business modules.

Do not create empty domain modules merely to mirror the conceptual domain map. A module should appear here when an implementation issue gives it a concrete responsibility.

## Ownership

A business module owns the behavior associated with its canonical domain concepts.

Depending on its complexity, a module may contain responsibilities such as:

```text
modules/<domain>/
    domain/
    application/
    infrastructure/
    presentation/
```

These folders are not mandatory ceremony.

Create a layer only when the domain actually has behavior that belongs there.

## Domain

Domain code owns business meaning and invariants.

It must not depend on:

- NestJS controllers;
- HTTP request objects;
- database-driver details;
- browser concepts.

## Application

Application code coordinates business use cases.

It is the appropriate place for responsibilities such as:

- use-case orchestration;
- authorization coordination;
- transaction boundaries;
- collaboration between module-owned capabilities.

Cross-domain orchestration must remain explicit.

## Presentation

Controllers and other transport adapters translate an external interaction into an application capability.

Controllers must not become owners of business rules.

A controller should not directly coordinate several repositories or mutate another module's persistence.

## Infrastructure

Infrastructure contains replaceable technical adapters required by the owning module.

Examples may eventually include:

- persistence adapters;
- external integrations;
- framework adapters.

Infrastructure does not own domain semantics merely because it performs I/O.

## Cross-module collaboration

One module must not write another module's persistence directly.

If Module A needs behavior owned by Module B, it should collaborate through an explicit capability owned by Module B.

A shared PostgreSQL database does not make persistence ownership shared.

## Platform boundary

Cross-cutting process and HTTP infrastructure belongs under `src/platform/`.

`platform/` must not become a generic location for business behavior.

Likewise, do not create generic repository areas such as:

```text
shared/
common/
utils/
```

to bypass explicit ownership.