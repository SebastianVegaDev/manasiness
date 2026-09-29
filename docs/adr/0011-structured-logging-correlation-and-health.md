# ADR 0011 — Structured logging, request correlation, and operational health

> **Status:** Accepted  
> **Date:** 2026-09-28

## Context

As Manasiness gains application and domain behavior, technical failures must be diagnosable without scattering `console.log()` calls throughout the modular monolith.

A request may eventually pass through:

```text
HTTP adapter
application use case
domain capability
persistence adapter
PostgreSQL
external integration
```

Operational diagnosis needs a stable way to correlate those technical events.

At the same time, logging must not become an accidental secret store or substitute for the permanent business audit trail.

The platform also needs distinct liveness and readiness semantics.

## Decision

Manasiness uses Pino as the API structured-log engine through `nestjs-pino`.

Application code continues to use the standard NestJS `Logger` abstraction.

Product/domain code does not directly depend on the Pino API.

## Structured output

Normal non-development output is structured JSON.

Stable baseline fields include:

```text
service
environment
level
time
context
requestId when inside HTTP execution
```

Additional operational fields should be added as structured values rather than encoded into human-readable message strings.

## Local pretty printing

Development may use `pino-pretty`.

Pretty output is a presentation mode over structured events.

Production and test environments do not enable pretty mode.

## Log level

Log verbosity is controlled by typed runtime configuration.

Current values are:

```text
debug
info
warn
error
```

Application/domain behavior does not dynamically redefine the process-wide threshold.

## Request correlation

The canonical HTTP correlation header is:

```text
X-Request-ID
```

A safe caller-provided value may be preserved.

Otherwise the API generates a UUID.

The same identifier is:

```text
bound to request logs
available through request execution
returned to the caller
```

The browser may read the header through the configured CORS exposed-header policy.

## Correlation context

Correlation uses asynchronous request context.

The request-context abstraction contains only diagnostic identity:

```text
requestId
```

It must not become implicit storage for:

```text
Identity
Organization
Membership
permissions
authorization decisions
```

Those values remain governed by their owning application/security boundaries.

## Request ID security semantics

A request ID is not trusted identity.

It does not prove:

```text
who sent the request
which Organization owns the request
whether the request is authorized
whether an operation is idempotent
```

The value exists exclusively for technical correlation/support.

## HTTP logging

Automatic HTTP logs record a deliberately small operational representation.

They may include:

```text
method
path
status
duration
requestId
```

They do not include full:

```text
headers
query strings
request bodies
response bodies
```

by default.

The logged URL omits query parameters.

## Secret redaction

Known structured secret-bearing fields are configured for Pino redaction.

Examples include:

```text
password
tokens
API keys
authorization
cookies
database URLs
connection strings
```

Error strings also receive best-effort sanitization for common embedded credential forms.

Redaction is not permission to log arbitrary sensitive objects.

Developers must still avoid logging:

```text
process.env
complete runtime config
authentication/session objects
raw credentials
full request bodies
```

## Error logging

Unexpected request failures are logged once with:

```text
request correlation
safe structured error representation
technical event name
```

The raw exception is never copied into the API response.

Expected business/application rejection remains distinct from unexpected technical failure according to ADR 0010.

## Logging reliability

Logging is diagnostic infrastructure.

A logging/redaction callback failure must not normally cause a business/database operation to fail.

Database pool error callbacks are therefore guarded against throwing.

## Technical logs versus business audit

Technical logs and business audit are separate systems.

Technical logs are optimized for:

```text
diagnosis
operations
performance investigation
error investigation
```

Business audit is optimized for durable questions such as:

```text
who changed authoritative state
what changed
when business state changed
which actor/Organization performed the action
```

Technical logs are not the permanent audit record.

Domain Audit Events remain outside M1 Issue #33.

## Liveness

`GET /health/live` answers whether the API process is alive enough to respond.

Liveness does not depend on PostgreSQL or optional external systems.

External dependency failure must not automatically imply that the process itself should be restarted.

## Readiness

`GET /health/ready` answers whether the instance should currently receive normal application traffic.

Required serving dependencies participate in readiness.

PostgreSQL is the first required readiness dependency.

## PostgreSQL readiness

The PostgreSQL probe performs only:

```sql
SELECT 1
```

It does not mutate product state.

The probe is bounded by typed runtime timeout configuration.

Both pool wait and query execution are bounded from the HTTP caller's perspective.

## Readiness failure

A failed dependency produces:

```text
HTTP 503
```

with a safe dependency status.

The health response does not include:

```text
database hostname details
credentials
raw exception message
stack trace
SQL driver diagnostics
```

Technical error detail remains in sanitized server-side logs.

## Health extension

Health uses an explicit probe abstraction.

Future dependencies may participate when they are truly required to serve application traffic.

Optional integrations should not make the whole API unready merely because they are temporarily unavailable.

## Automatic health logging

Successful health endpoints are excluded from normal automatic HTTP completion logs to reduce probe noise.

Failures produce explicit structured operational events.

## Database background errors

The PostgreSQL pool has an error listener.

This prevents asynchronous idle-client errors from becoming unhandled EventEmitter errors.

The event is logged safely through the API technical logging boundary.

## Metrics and tracing

This ADR does not select:

```text
Prometheus
Grafana
OpenTelemetry backend
APM vendor
log shipping provider
alerting provider
```

Structured events, explicit request correlation, and health probes provide extension points for those systems later.

## Consequences

### Positive

- requests can be traced across application logs;
- clients receive a support/debug correlation identifier;
- production logs are machine-readable;
- local logs remain developer-friendly;
- common secrets receive explicit redaction;
- raw bodies/headers are not logged by default;
- unexpected failures retain technical correlation;
- process health and dependency health are distinct;
- readiness remains bounded and non-mutating;
- domain code remains independent from logging vendors.

### Negative / trade-offs

- request logging now has explicit infrastructure/configuration;
- correlation uses asynchronous context;
- redaction rules require maintenance as new secret shapes appear;
- readiness adds a small database query;
- technical events still require deliberate event naming to remain useful.

These costs are accepted because operational diagnosability is a platform requirement.

## Alternatives considered

### NestJS default console logger only

Rejected as the production baseline.

It does not provide the desired request-context and structured logging foundation as directly as the selected integration.

### Direct Pino usage throughout modules

Rejected.

This would couple application/domain code to one logging implementation.

### Log full request/response payloads

Rejected.

The security/privacy cost outweighs the default diagnostic value.

Specific payload logging would require an explicitly reviewed use case.

### Use correlation context as tenant context

Rejected.

Diagnostic identity and authorization identity have different trust and lifecycle semantics.

### Liveness checks PostgreSQL

Rejected.

A database outage should make the instance unready, not necessarily dead.

### Readiness runs domain queries

Rejected.

Operational health should not depend on mutable business data or alter state.

### Introduce OpenTelemetry now

Deferred.

Issue #33 establishes a clean baseline without prematurely selecting a metrics/tracing platform.

## References

- `apps/api/README.md`
- `docs/adr/0010-transport-contracts-and-api-errors.md`
- Issue #33