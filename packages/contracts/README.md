# Manasiness Transport Contracts

`@manasiness/contracts` owns transport-facing schemas shared between Manasiness applications and integration boundaries.

It is deliberately not a domain-model package.

## Responsibility

This package may own:

- HTTP request schemas;
- HTTP query schemas;
- HTTP path-parameter schemas;
- HTTP response schemas;
- shared transport primitive schemas;
- machine-readable API error schemas;
- types inferred from those transport schemas.

It must not own:

- domain entities;
- aggregates;
- persistence models;
- repositories;
- application services;
- business invariants;
- authorization rules;
- database schema;
- NestJS controllers;
- Next.js components.

## Schema-first transport

Transport contracts use Zod.

A schema is the canonical source for:

```text
runtime validation
+
TypeScript inference
+
OpenAPI representation
```

Do not create an independent interface that duplicates a Zod schema.

Prefer:

```typescript
export const createThingRequestSchema = z.strictObject({
    name: z.string().min(1),
});

export type CreateThingRequest = z.output<typeof createThingRequestSchema>;
```

Avoid:

```typescript
interface CreateThingRequest {
    name: string;
}

const createThingRequestSchema = ...
```

when both describe the same transport payload independently.

## Request schemas

External input is untrusted.

Request contracts should normally use strict objects so undeclared properties are rejected rather than silently accepted.

Example:

```typescript
z.strictObject({
    name: z.string(),
});
```

Transport validation answers questions such as:

```text
Is the field present?
Is it a string?
Is this UUID syntactically valid?
Is this number in the supported transport range?
```

It must not become the owner of business questions such as:

```text
May this Organization create another warehouse?
Can this Sale be cancelled?
Does this Customer have enough credit?
Is this inventory movement allowed?
```

Those belong to application/domain code.

## Transport versus domain models

A transport DTO and a domain model may look similar while representing different responsibilities.

For example, the transport representation of a durable ID is:

```text
UUIDv7 string
```

The domain/application representation may be the branded:

```text
EntityId
```

from `@manasiness/platform-primitives`.

Transport parsing proves the wire representation is valid.

The application boundary may then convert it into the representation expected by the owning domain.

Do not import domain entities into this package merely to avoid mapping code.

Mapping is an intentional boundary.

## Shared primitives

Only genuinely transport-wide primitives belong here.

The initial shared transport primitive is:

```text
entityIdTransportSchema
```

Do not add every repeated string or number merely because it appears in two endpoints.

A shared primitive should represent one stable cross-endpoint wire convention.

## Input and output types

Zod schemas can transform values.

For example:

```typescript
z.coerce.number();
```

may receive a query-string value and produce a number.

Therefore distinguish conceptually between:

```text
wire input
```

and:

```text
validated schema output
```

Controller handler parameter types should normally use the schema output.

## Response schemas

Response schemas define what is allowed to leave the API.

Using a Zod object as a response schema creates an explicit allowlist of serialized properties.

This helps prevent persistence/internal fields from leaking merely because a service returned a wider object.

Response schemas are transport contracts.

They are not domain entities.

## API error envelope

All structured API failures use:

```json
{
    "error": {
        "type": "invalid_input",
        "code": "transport.invalid_input",
        "message": "Request validation failed."
    }
}
```

Validation errors may additionally contain:

```json
{
    "issues": [
        {
            "path": ["email"],
            "message": "Invalid email address."
        }
    ]
}
```

## Error type

`error.type` is a stable broad failure category.

Current categories are:

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

Clients may use the type for broad behavior.

Examples:

```text
unauthenticated
→ begin authentication flow

unauthorized
→ show insufficient-permission behavior

conflict
→ refresh/reconcile state

rate_limited
→ back off/retry later
```

## Error code

`error.code` is the stable machine-readable reason.

Codes use lowercase dot-separated namespaces.

Examples:

```text
transport.invalid_input
auth.unauthenticated
resource.not_found
sales.sale_already_cancelled
inventory.insufficient_stock
```

Future domain-specific error codes should use an owning-domain namespace.

Human-readable messages are not stable identifiers.

Clients must not branch on:

```text
error.message
```

## Error message

`error.message` exists for human-readable context.

It may evolve independently from `error.code`.

It may eventually be localized.

Do not parse it programmatically.

## HTTP mapping

The generic foundation maps categories as follows:

```text
invalid_input
→ 400

unauthenticated
→ 401

unauthorized
→ 403

not_found
→ 404

conflict
→ 409

business_rejection
→ 422

rate_limited
→ 429

internal_error
→ 500
```

HTTP status is transport semantics.

Domain models must not know or store HTTP status codes.

## Expected versus unexpected failures

Expected application rejection remains distinguishable from unexpected system failure.

Examples of expected failures:

```text
resource does not exist
version conflict
business rule rejects command
actor lacks permission
```

Unexpected failures include:

```text
programming errors
unhandled infrastructure failures
broken assumptions
unexpected exceptions
```

Expected failures may expose an intentionally safe public message and stable code.

Unexpected failures return only:

```text
internal_error
internal.unexpected
```

with a generic client-facing message.

Stack traces and internal exception messages must never be included in the HTTP response.

## OpenAPI

The API uses the real Zod transport schemas as the source for OpenAPI generation.

Request schemas attached to Nest route decorators are consumed directly through NestJS Standard Schema support.

Response documentation is generated from the same response Zod schema used for runtime serialization.

Do not maintain:

```text
Zod schema
+
separate handwritten Swagger schema
```

for the same payload.

Generated OpenAPI is a representation of the transport contract.

It is not the source of domain truth.

## Generated clients

This package does not currently generate an SDK.

If a concrete integration later benefits from client generation, the generated client should derive from the canonical OpenAPI/transport contract.

A generated client must not become the place where business rules are defined.

## Public package surface

Consumers import from:

```typescript
import { apiErrorResponseSchema, contractExampleRequestSchema } from '@manasiness/contracts';
```

Do not deep-import package internals such as:

```text
@manasiness/contracts/src/...
@manasiness/contracts/internal/...
```

Only explicitly exported contracts are public.

## Version evolution

Changing a transport schema can affect:

```text
web
Assistant
external integrations
automation
future generated clients
```

Transport changes therefore require compatibility consideration.

Internal domain refactoring does not automatically require a transport-contract change.

The transport boundary exists partly so both can evolve independently.
