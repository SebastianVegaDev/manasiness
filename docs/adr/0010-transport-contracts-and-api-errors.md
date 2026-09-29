# ADR 0010 — Shared transport contracts and stable API error semantics

> **Status:** Accepted  
> **Date:** 2026-09-28

## Context

The Manasiness web application, API, future Assistant capabilities, and external integrations will exchange structured data.

Without a canonical transport boundary, individual endpoints could independently create:

```text
request interfaces
validation rules
response DTOs
error formats
Swagger schemas
client assumptions
```

Those representations would drift as the number of endpoints grows.

At the same time, sharing domain entities directly with transport consumers would couple internal business modeling to HTTP and browser concerns.

M0 also requires expected business rejection to remain distinguishable from unexpected infrastructure or programming failure.

## Decision

Manasiness uses:

```text
@manasiness/contracts
```

as the canonical transport-schema package.

The package uses Zod schemas as the runtime and TypeScript source of truth for public wire structures.

NestJS Standard Schema integration consumes those schemas directly.

## Contract ownership

`@manasiness/contracts` may own:

```text
request schemas
query schemas
path-parameter schemas
response schemas
transport primitive schemas
API error schemas
types inferred from those schemas
```

It does not own:

```text
domain entities
aggregates
repositories
business rules
authorization
persistence models
application services
controllers
```

## Transport versus domain

Transport and domain representations are separate models even when they contain similar fields.

Transport validates what crossed the system boundary.

Application/domain code decides business meaning.

For example:

```text
transport
→ UUIDv7 string

application/domain
→ EntityId
```

Mapping between them is intentional.

## Runtime validation

External params, query values, and request bodies are untrusted.

NestJS uses `StandardSchemaValidationPipe` globally.

Schemas are attached directly to route parameter decorators:

```text
@Param({ schema })
@Query({ schema })
@Body({ schema })
```

A controller receives the validated schema output rather than raw transport input.

## Request strictness

Request objects should normally reject undeclared fields.

This makes contract evolution deliberate and prevents callers from assuming unsupported input is meaningful.

Exceptions require a concrete compatibility reason.

## Business validation

Runtime transport validation does not replace domain/application validation.

A schema may determine:

```text
this value is a valid UUID
```

but it must not determine:

```text
this actor may modify that entity
```

or:

```text
this Sale may transition into that state
```

Those remain business/application concerns.

## Response schemas

Responses use Standard Schema serialization.

The response schema is an allowlist of properties allowed to cross the HTTP boundary.

This reduces the risk of exposing internal persistence fields or secrets when internal objects contain more data than the public response.

## OpenAPI

The real transport schemas are also used to generate OpenAPI.

Request schemas are consumed through NestJS Standard Schema metadata.

Response documentation is generated from the same response Zod schema used by runtime serialization.

Manasiness does not maintain:

```text
Zod request/response definition
+
independent handwritten Swagger definition
```

for the same payload.

The generated OpenAPI document is transport documentation.

It is not the source of domain truth.

## API error envelope

API failures use:

```json
{
    "error": {
        "type": "...",
        "code": "...",
        "message": "..."
    }
}
```

Validation failures may additionally expose field-level issues.

## Error type

`error.type` is the broad stable category.

The initial categories are:

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

## Error code

`error.code` is the stable machine-readable reason.

Codes use lowercase dot-separated namespaces.

Generic examples:

```text
transport.invalid_input
auth.unauthenticated
resource.not_found
internal.unexpected
```

Future domain-specific examples may include:

```text
sales.sale_already_cancelled
inventory.insufficient_stock
```

The owning domain defines its stable reason.

## Error message

`error.message` is human-readable.

Clients must not parse or branch on messages.

Messages may change without representing a contract-breaking change when the stable type/code remain equivalent.

## HTTP status

HTTP status belongs to the transport mapping.

The generic mapping is:

```text
invalid_input       → 400
unauthenticated     → 401
unauthorized        → 403
not_found           → 404
conflict            → 409
business_rejection  → 422
rate_limited        → 429
internal_error      → 500
```

Domain entities and value objects do not contain HTTP status codes.

## Expected application failures

Expected business/application rejection remains distinct from unexpected system failure.

An expected application failure may carry:

```text
semantic category
stable code
explicitly safe public message
```

The HTTP adapter maps that semantic failure into its transport status/error envelope.

## Unexpected failures

Unexpected exceptions always map to:

```text
500
internal_error
internal.unexpected
```

Client responses do not contain:

```text
stack traces
raw exception objects
SQL
database-driver diagnostics
filesystem paths
environment values
secret values
unexpected internal messages
```

Server-side diagnostics remain separate from the public error contract.

Issue #33 owns the structured logging and request-correlation strategy.

## Validation issue detail

Invalid-input errors may expose:

```json
{
    "issues": [
        {
            "path": [
                "field"
            ],
            "message": "Validation explanation"
        }
    ]
}
```

Issue messages exist for human/developer feedback.

Clients should not treat validation message strings as stable codes.

## Authentication and authorization

This ADR defines generic transport categories only.

It does not implement authentication or Membership authorization.

Future authentication work may use:

```text
unauthenticated
unauthorized
```

without changing their generic transport meaning.

## Generated SDKs

No generated SDK is introduced by this decision.

If a later integration needs one, generation may derive from the OpenAPI document.

Generated clients remain derived artifacts rather than the source of business semantics.

## Consequences

### Positive

- runtime validation and documentation derive from one schema;
- web/API/integration DTO shapes can remain synchronized;
- controllers receive validated transport values;
- domain models remain independent from HTTP;
- clients receive one predictable error envelope;
- clients branch on stable machine codes rather than text;
- server internals are not exposed by unexpected failures;
- future OpenAPI/client generation has a canonical transport source.

### Negative / trade-offs

- explicit mapping exists between transport and domain models;
- endpoint authors must define response schemas deliberately;
- compatibility must be considered when public contracts evolve;
- schema declarations do not remove the need for application/domain validation.

These costs are accepted because the boundary prevents transport concerns from spreading into business code.

## Alternatives considered

### Share domain entities directly

Rejected.

Internal business models need freedom to evolve independently from HTTP/browser representations.

### TypeScript interfaces without runtime schemas

Rejected.

Interfaces disappear at runtime and cannot validate untrusted data.

### Class-validator DTOs plus Zod schemas

Rejected.

This would create two validation/schema systems without a concrete benefit.

NestJS 12 supports Standard Schema directly.

### Hand-written OpenAPI schemas

Rejected as the normal workflow.

Maintaining transport validation and documentation separately creates drift.

### Generated OpenAPI types as domain models

Rejected.

Generated transport representations are not business-domain truth.

### Different error shape per domain

Rejected.

Domain-specific machine codes are allowed, but the outer error envelope and broad categories remain stable.

## References

- `packages/contracts/README.md`
- `apps/api/README.md`
- Issue #32