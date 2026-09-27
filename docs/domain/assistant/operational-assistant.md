# Manasiness — Operational Assistant Foundation

> **Status:** Active  
> **Milestone:** M0 — Product & Domain Foundation  
> **Scope:** Manasiness V1  
> **Purpose:** Define the Operational Assistant product contract, intent model, interpretation boundary, entity-resolution behavior, authorization requirements, risk/confirmation policy, auditability, failure behavior, and future AI evolution path.

---

# 1. Purpose

Manasiness should allow operators to interact with their business using natural language.

Examples include:

```text
"¿Cuánto vendí hoy?"

"¿Cuánto me debe Juan?"

"¿Cuántas Coca-Colas quedan?"

"Muéstrame las compras a Gloria del último mes."

"Registra 2 Coca-Colas a Juan."
```

The value of this capability is not that Manasiness appears intelligent.

The value is that ordinary operational work becomes easier to access.

The Operational Assistant should reduce the distance between:

```text
what the operator wants
```

and:

```text
the trusted Manasiness capability that already performs it
```

The Assistant must therefore be designed as an **interface over the product**, not as another implementation of the product.

---

# 2. Core principle

The Operational Assistant interprets language.

It does not own business truth.

Conceptually:

```text
User language
      │
      ▼
Operational Assistant
      │
      ├── interpretation
      ├── Intent selection
      ├── structured input
      ├── entity resolution
      ├── clarification
      ├── authorization
      ├── risk / confirmation
      │
      ▼
Application capability
      │
      ▼
Owning domain
```

Never:

```text
User language
      │
      ▼
Assistant
      │
      ▼
Database
```

---

# 3. Product role

The Assistant is a conversational operational interface.

It helps the user:

- find information;
- understand business state;
- navigate operational data;
- initiate supported actions;
- reduce navigation overhead;
- express common workflows naturally.

It does not replace the normal Manasiness interface.

The web application and Assistant are complementary product surfaces over the same trusted application capabilities.

---

# 4. V1 value proposition

The V1 Assistant should make common small-business questions and operations faster.

Representative value includes:

### Read

```text
How much did I sell today?
```

```text
How much does Juan owe me?
```

```text
How many Coca-Colas are left?
```

```text
What did I buy from Gloria this month?
```

### Controlled write

```text
Register a Sale.
```

```text
Record a supported Payment.
```

where the intent is explicitly supported and enough information can be safely validated.

---

# 5. The Assistant is not an autonomous business operator

V1 does not authorize the Assistant to independently decide:

- what Products should be purchased;
- whether customer debt should be forgiven;
- whether Inventory should be adjusted;
- whether a Sale should be cancelled;
- whether permissions should change;
- whether a Supplier should be paid;
- whether a Worker should receive money.

The user remains the decision-maker for consequential business operations.

---

# 6. The Assistant is not a source of truth

Canonical state remains owned by domains such as:

```text
Parties
Catalog
Inventory
Finance
Sales
Purchasing
Workforce
Organizations
```

The Assistant may read or invoke those capabilities.

It does not create competing domain state.

---

# 7. Deterministic-first V1

V1 does not depend on generative AI or probabilistic machine learning to execute trusted business actions.

Initial interpretation should be deterministic and constrained.

Possible future implementation techniques may include:

- normalized command patterns;
- structured parsers;
- aliases;
- phrase dictionaries;
- deterministic classification;
- validated forms generated from conversation;
- explicitly supported phrase families.

The exact implementation is deferred to M10.

---

# 8. Why deterministic-first

Business operations can affect:

- Inventory;
- customer debt;
- supplier debt;
- money;
- historical records;
- reporting.

The execution path therefore needs predictable guarantees.

A probabilistic model may later help interpret language.

It must not become the authority that decides business validity.

---

# 9. Intent

An **Intent** represents one explicitly supported Assistant capability.

Examples:

```text
sales.summary.today
inventory.product.stock
customer.balance
purchasing.history.supplier
sales.create
finance.payment.record
```

Intent names are conceptual examples.

M10 defines the final registry.

---

# 10. Intent is not arbitrary code execution

An Intent identifies a supported application operation.

It must map to:

```text
known capability
+
known input contract
+
known authorization requirement
+
known risk policy
```

It must not represent:

```text
"execute whatever the language model decides"
```

---

# 11. Intent Registry

V1 uses a conceptual **Intent Registry**.

The Registry describes which conversational capabilities Manasiness supports.

An Intent definition conceptually contains:

```text
Intent
├── name
├── category
├── examples / recognition rules
├── mode: read | write
├── risk level
├── required permission
├── input schema
├── entity resolvers
├── confirmation policy
├── application capability
├── response behavior
└── audit policy
```

This is a conceptual contract.

It is not a final TypeScript interface.

---

# 12. Intent Registry purpose

The Registry makes Assistant capability explicit.

It answers:

- What can the Assistant do?
- Which inputs are required?
- Which permission is required?
- Is the operation read-only?
- How risky is it?
- Is confirmation required?
- Which real application capability executes it?

This prevents Assistant behavior from becoming scattered through ad-hoc prompt instructions.

---

# 13. Intent categories

The initial Intent space should be divided into broad categories.

## Query / summary

Examples:

```text
sales.summary.today
sales.summary.period
finance.receivables.total
finance.payables.total
```

## Entity lookup

Examples:

```text
inventory.product.stock
customer.balance
supplier.balance
worker.payment.history
```

## Search / history

Examples:

```text
purchasing.history.supplier
sales.history.customer
inventory.movements.product
```

## Controlled creation

Examples:

```text
sales.create
finance.payment.record
```

Only explicitly allowlisted state-changing Intents belong in V1.

---

# 14. Unsupported intent is normal

The Assistant does not need to understand every possible request.

If a capability is outside the Intent Registry, it should clearly say that the operation is not currently supported.

Unsupported behavior is safer than inventing an execution strategy.

---

# 15. Intent input

Each Intent receives structured validated input.

Example:

```text
sales.summary.period
```

might conceptually require:

```text
from
to
```

Another:

```text
inventory.product.stock
```

might require:

```text
product
```

And:

```text
sales.create
```

may require information such as:

```text
items[]
customer?
settlement
```

depending on the Sales application capability.

---

# 16. Slot

A **Slot** is a structured piece of information required to interpret or execute an Intent.

Examples:

```text
Product
Customer
Supplier
Worker
quantity
Money
date
date range
Payment Method
Financial Account
```

Slots turn natural-language fragments into application-compatible structured data.

---

# 17. Slot validation

Extracting text is not enough.

A Slot must satisfy the canonical validation rules expected by the target capability.

Example:

```text
"dos"
```

may normalize to:

```text
quantity = 2
```

but the target capability still validates whether quantity `2` is acceptable.

The Assistant does not bypass the application/domain validator.

---

# 18. Missing slots

If a required Slot is missing, the Assistant should ask for it.

Example:

```text
"Registra un pago de Juan."
```

may be missing:

```text
amount
```

The Assistant should ask:

```text
"¿De cuánto fue el pago?"
```

rather than guessing.

---

# 19. Entity Resolution

**Entity Resolution** maps user language to canonical Manasiness entities.

Example:

```text
"Coca-Cola"
```

may resolve to a Catalog Product.

```text
"Juan"
```

may resolve to a Customer Party.

```text
"Gloria"
```

may resolve to a Supplier Party.

---

# 20. Organization-scoped resolution

Entity Resolution always respects the active Organization.

The Assistant must not resolve:

```text
"Juan"
```

using Parties belonging to another Organization.

The global Identity model never weakens tenant isolation.

---

# 21. Product resolution

Product resolution may consider information such as:

- exact name;
- normalized name;
- SKU where later supported;
- barcode where later supported;
- explicit aliases where supported.

Example:

```text
"Coca Cola"
```

might resolve uniquely to:

```text
Coca-Cola 500 ml
```

within the Organization.

---

# 22. Customer resolution

Customer resolution occurs against the Organization's Customer Relationships.

Example:

```text
"Juan"
```

could produce:

```text
Juan Pérez
Juan Torres
```

If the requested operation is consequential, the Assistant must not arbitrarily choose one.

---

# 23. Supplier resolution

Supplier resolution uses Organization-scoped Supplier Relationships.

Example:

```text
"Gloria"
```

may resolve to:

```text
Distribuidora Gloria SAC
```

only if the mapping is sufficiently unambiguous according to the resolver policy.

---

# 24. Worker resolution

Worker resolution occurs against Worker Relationships within the active Organization.

It must not confuse:

```text
authenticated Actor
```

with:

```text
Worker
```

unless an explicit Worker/Identity relationship establishes that they represent the same person.

---

# 25. Date resolution

The Assistant may normalize expressions such as:

```text
hoy
ayer
esta semana
el último mes
del 1 al 15
```

into explicit date/time ranges.

Interpretation must use the Organization's business timezone.

---

# 26. Relative dates

Relative dates must be resolved at execution time.

For example:

```text
"ventas de hoy"
```

should become an explicit Organization-local range before the application capability executes.

The application should not receive an ambiguous string such as:

```text
"today"
```

as business truth.

---

# 27. Quantity resolution

Quantity normalization may convert expressions such as:

```text
dos
2
dos unidades
```

into a structured quantity.

The target domain still owns quantity validity.

---

# 28. Money resolution

Money interpretation must produce canonical Money semantics.

Example:

```text
"50 soles"
```

becomes conceptually:

```text
amount = 50
currency = PEN
```

within an Organization operating in PEN.

The Assistant must not perform independent floating-point financial logic.

---

# 29. Currency ambiguity

If the Organization or request allows ambiguity about currency, the Assistant must clarify.

V1 normally uses the Organization operating currency, according to the Finance foundation.

The Assistant must not silently convert currencies.

---

# 30. Ambiguity

Ambiguity exists when more than one interpretation remains reasonably plausible.

Examples:

```text
"Juan"
→ Juan Pérez
→ Juan Torres
```

or:

```text
"Coca-Cola"
→ Coca-Cola 500 ml
→ Coca-Cola 1 L
```

---

# 31. Consequential ambiguity must never be guessed

For a state-changing action:

```text
"Véndele dos Coca-Colas a Juan."
```

if either Product or Customer is ambiguous, execution stops.

The Assistant asks for clarification.

---

# 32. Read ambiguity

Read-only interactions may handle ambiguity less strictly when doing so cannot change state.

For example:

```text
"Busca Coca-Cola"
```

may legitimately return several candidates.

But:

```text
"¿Cuánto stock tiene Coca-Cola?"
```

should ask which Product if several materially different matches exist.

---

# 33. Clarification

A **Clarification** resolves missing or ambiguous information.

Example:

```text
User:
"Registra 2 Coca-Colas a Juan."

Assistant:
"Encontré dos clientes llamados Juan:
- Juan Pérez
- Juan Torres

¿Cuál es?"
```

Clarification does not execute business state.

---

# 34. Clarification versus Confirmation

These are distinct.

```text
Clarification
→ What does the user mean?
```

```text
Confirmation
→ Does the user approve executing this resolved action?
```

Example:

```text
Clarification:
"¿Juan Pérez o Juan Torres?"
```

Then:

```text
Confirmation:
"Registrar venta de 2 Coca-Cola 500 ml a Juan Pérez por S/ 10.00?"
```

---

# 35. Conversational context

The Assistant may retain limited conversational context so the user does not need to repeat every detail.

Example:

```text
User:
"¿Cuánto debe Juan Pérez?"

Assistant:
"S/ 80."

User:
"¿Y cuánto pagó este mes?"
```

The second request may reuse:

```text
Customer = Juan Pérez
```

within the same conversation context.

---

# 36. Context scope

Conversational context is scoped at minimum by:

```text
Identity / Actor
Organization
Conversation
```

Context from Organization A must never be reused silently in Organization B.

---

# 37. Context is not authorization

Remembering:

```text
Customer = Juan Pérez
```

does not grant permission to access or modify Juan's information.

Every Intent is authorized independently at execution time.

---

# 38. Context lifetime

V1 conversational context should be deliberately short-lived.

It may persist for the active conversation/session as required for coherent follow-up requests.

It should not become an indefinite hidden source of business facts.

Canonical facts are re-read from their owning domains when required.

---

# 39. Stale context

Context may become stale.

Example:

```text
Assistant resolved Stock = 5
```

and another user later sells two units.

A later command must not rely on the old conversational value as authoritative stock.

The target application capability loads and validates current state during execution.

---

# 40. Context references canonical identifiers

When possible, resolved context should conceptually retain canonical entity identity rather than only the original text.

Example:

```text
"Juan"
```

after clarification may become:

```text
Customer Party ID = ...
Display name = Juan Pérez
```

The exact storage implementation is deferred.

---

# 41. Organization switch

If the active Organization changes, Organization-scoped conversational references must be invalidated or deliberately re-resolved.

The Assistant must not accidentally carry:

```text
Customer Juan from Organization A
```

into Organization B.

---

# 42. Read-only Intent

A **Read Intent** obtains information without modifying canonical business state.

Examples:

```text
sales.summary.today
customer.balance
inventory.product.stock
purchasing.history.supplier
```

---

# 43. Write Intent

A **Write Intent** attempts to change canonical business state.

Examples may include:

```text
sales.create
finance.payment.record
```

Write Intents require stricter handling.

---

# 44. Intent risk model

V1 uses a conceptual risk classification.

```text
R0 — Read only
R1 — Low-risk state change
R2 — Consequential business/financial state change
R3 — Sensitive/destructive/security state change
```

The exact enum implementation is deferred.

---

# 45. R0 — Read only

Examples:

```text
read sales summary
read stock
read customer balance
read purchasing history
```

Policy:

- authorization required;
- no execution confirmation required by default;
- ambiguity still clarified where necessary;
- no state mutation.

---

# 46. R1 — Low-risk state change

R1 represents allowlisted mutations with limited consequence and clear reversibility.

Whether a particular V1 operation belongs here is decided in M10.

For natural-language execution, explicit confirmation should normally still be required unless the product deliberately defines a safe direct-execution exception.

---

# 47. R2 — Consequential operation

Examples include actions capable of affecting:

- Sale history;
- customer debt;
- supplier debt;
- Inventory;
- money.

Representative future Intents:

```text
sales.create
finance.payment.record
```

R2 requires explicit confirmation before execution.

---

# 48. R3 — Sensitive operation

Examples include:

```text
Inventory Adjustment
Payment reversal
Sale cancellation
Purchase cancellation
debt forgiveness
permission changes
Membership changes
security operations
```

The initial V1 Assistant should generally **not expose R3 actions**.

Users should perform them through dedicated product workflows until Assistant safety semantics are deliberately expanded.

---

# 49. Allowlist policy

The existence of an application use case does not automatically make it available to the Assistant.

Assistant write capability uses an explicit allowlist.

Conceptually:

```text
Application capabilities
├── Create Sale                  → Assistant allowed
├── Record Payment               → maybe allowed
├── Adjust Inventory             → not initially allowed
├── Reverse Payment              → not initially allowed
└── Change Member Permissions    → not initially allowed
```

This allows Assistant capability to expand deliberately.

---

# 50. Confirmation

Confirmation is explicit user approval for a resolved state-changing command.

Before confirmation, the Assistant should present enough information for the user to understand the operation.

---

# 51. Confirmation preview

A confirmation preview should include the consequential facts.

Example:

```text
Registrar venta:

Cliente:
Juan Pérez

Items:
2 × Coca-Cola 500 ml @ S/ 5.00

Total:
S/ 10.00

Pago:
Crédito

Deuda generada:
S/ 10.00

¿Confirmar?
```

---

# 52. Confirmation is bound to resolved input

A user's confirmation applies only to the exact action previewed.

Conceptually, confirmation is bound to:

```text
Intent
+
normalized inputs
+
resolved entities
+
Organization
+
relevant execution context
```

If those values materially change, the Assistant must request confirmation again.

---

# 53. Confirmation cannot be reused

A previous:

```text
"Sí"
```

must not authorize a later different command.

Confirmation is scoped to one pending action.

---

# 54. Confirmation expiration

Pending confirmations should have a bounded lifetime.

If too much time passes or the command becomes stale, the Assistant should revalidate and, where appropriate, request confirmation again.

The exact timeout belongs to M10.

---

# 55. Revalidation after confirmation

Confirmation does not bypass domain validation.

Execution still reloads and validates current authoritative state.

Example:

```text
Preview:
Stock = sufficient

User confirms

Another operator sells remaining stock first
```

The later Sale execution must still fail safely if Inventory no longer allows it.

---

# 56. Authorization

Every Intent requires authorization.

There is no:

```text
Assistant permission bypass
```

The Assistant executes under the authenticated Actor's Organization context.

---

# 57. Intent permission

Each Intent declares the application permission/capability required.

Conceptually:

```text
inventory.product.stock
→ inventory.read
```

```text
sales.create
→ sales.create
```

Exact permission names belong to M3/M10.

---

# 58. Authorization happens before protected execution

The Assistant should avoid exposing protected information before authorization succeeds.

For example, an Identity without Finance visibility should not receive:

```text
"Juan owes S/ 4,300"
```

simply because the natural-language classifier understood the question.

---

# 59. Authorization is checked again by the application boundary

The Assistant may pre-check authorization for UX.

The target application use case remains responsible for authoritative authorization enforcement according to the architecture established in M3.

Defense in depth remains important.

---

# 60. Assistant does not impersonate stronger roles

The Assistant must never execute with elevated permissions merely because it is a system component.

The user's command runs with the user's authorization context.

---

# 61. Assistant execution contract

Once interpretation is complete, execution conceptually becomes:

```text
Intent
+
Validated input
+
Actor
+
Organization
      │
      ▼
Application use case
```

The Assistant does not execute business rules itself.

---

# 62. Application use case is authoritative

Examples:

```text
sales.create
→ CreateSale use case
```

```text
finance.payment.record
→ RecordPayment use case
```

```text
inventory.product.stock
→ GetProductStock query
```

Names are illustrative.

The key rule is one shared execution path.

---

# 63. Web UI and Assistant share capabilities

Conceptually:

```text
Web UI
    │
    ├──────────────┐
    ▼              ▼
Application capabilities
    ▲
    │
Assistant
```

Not:

```text
Web business logic

and separately

Assistant business logic
```

---

# 64. No repository access

The Assistant layer must not directly call domain repositories or persistence adapters in order to perform business operations.

Invalid:

```text
Assistant
→ SalesRepository
→ INSERT
```

Valid:

```text
Assistant
→ CreateSale application use case
```

---

# 65. No direct SQL

The Assistant must never generate or execute arbitrary SQL against operational business data.

This applies regardless of whether future AI models are capable of producing SQL correctly.

---

# 66. No direct ORM execution

Likewise, the Assistant must not receive a generic:

```text
database client
```

or:

```text
ORM
```

with authority to mutate arbitrary tables.

---

# 67. No domain-rule duplication

Assistant code must not recreate rules such as:

```text
negative stock policy
Sale total calculation
Receivable settlement
Purchase receipt rules
Worker lifecycle
```

It supplies structured input to the owning application capabilities.

---

# 68. Auditability

Assistant-triggered state changes must remain attributable.

Audit context should distinguish:

```text
Actor:
Identity X

Interface:
Operational Assistant

Intent:
sales.create
```

from the domain operation itself.

---

# 69. Assistant is not the Actor

The human authenticated Identity remains the initiating Actor.

The Assistant is the interface/channel through which the operation was requested.

Conceptually:

```text
Actor = Sebastián
Channel = Operational Assistant
```

not:

```text
Actor = Assistant
```

for an ordinary user-driven operation.

---

# 70. System-generated Assistant actions

If future automation allows system-initiated operations without an immediate human request, those require a separate Actor/automation authorization model.

That capability is outside the initial V1 Assistant.

---

# 71. Audit content

For consequential Assistant actions, relevant audit context may include:

- Actor;
- Organization;
- Intent;
- target capability;
- resolved entities;
- execution outcome;
- time;
- channel;
- confirmation evidence where appropriate.

The audit layer should not store unnecessary sensitive conversational content indiscriminately.

---

# 72. Conversation logging versus business auditing

Full conversation history and business audit history are different concerns.

Business auditing should preserve the consequential operation.

It should not depend on replaying raw chat messages to discover what happened.

---

# 73. Failure categories

Assistant failures should be explicit.

Conceptually:

```text
Unsupported Intent
Missing Information
Ambiguous Entity
Unauthorized
Confirmation Required
Business Rule Rejected
Stale Context
Execution Conflict
System Failure
```

---

# 74. Unsupported request

Example:

```text
"Predice cuánto voy a vender en seis meses."
```

if predictive forecasting is unsupported.

The Assistant should say the capability is not available.

It must not fabricate a forecast.

---

# 75. Missing information

Example:

```text
"Registra un pago de Juan."
```

Missing:

```text
amount
```

The Assistant asks for the missing value.

---

# 76. Ambiguous entity

Example:

```text
"Registra una venta a Juan."
```

with two matching Customers.

Execution does not continue until clarified.

---

# 77. Unauthorized action

If interpretation succeeds but the Actor lacks permission:

```text
Intent recognized
↓
authorization denied
```

The Assistant returns an authorization failure.

It must not attempt an alternate execution path.

---

# 78. Business-rule rejection

Example:

```text
"Vende 10 unidades"
```

but Inventory only has:

```text
3
```

The Assistant reports the Inventory/business rejection.

It must not automatically create an Inventory Adjustment or bypass negative-stock policy.

---

# 79. Conflict

The state may change between interpretation and execution.

Example:

```text
Customer Receivable = S/ 50
```

when previewed, but another Payment settles it before execution.

Finance may reject the operation.

The Assistant should explain that the current business state changed and the operation needs to be reconsidered.

---

# 80. System failure

Unexpected infrastructure failure must not be described as a successful business action.

If execution outcome is unknown, the Assistant must not blindly retry a consequential command without idempotency guarantees.

---

# 81. Idempotency

Assistant-generated write commands inherit the target application's idempotency policy.

Network or conversation retry must not accidentally create duplicate:

- Sales;
- Payments;
- Receipts;
- other consequential operations.

The Assistant does not implement separate competing idempotency semantics.

---

# 82. Example — sales summary

User:

```text
"¿Cuánto vendí hoy?"
```

Conceptual flow:

```text
normalize language
      ↓
Intent = sales.summary.today
      ↓
resolve Organization-local "today"
      ↓
authorize Sales reporting access
      ↓
execute reporting/Sales query capability
      ↓
format result
```

No confirmation is needed because this is read-only.

---

# 83. Example — customer balance

User:

```text
"¿Cuánto me debe Juan?"
```

Flow:

```text
Intent = customer.balance
      ↓
resolve Customer "Juan"
      ↓
if ambiguous → clarify
      ↓
authorize Finance/customer balance read
      ↓
Finance query
      ↓
return outstanding Receivables
```

The Assistant does not calculate debt from pending Sales itself.

---

# 84. Example — product stock

User:

```text
"¿Cuántas Coca-Colas quedan?"
```

Flow:

```text
Intent = inventory.product.stock
      ↓
resolve Product
      ↓
if ambiguous → clarify
      ↓
authorize Inventory read
      ↓
Inventory capability
      ↓
Stock Balance response
```

---

# 85. Example — supplier purchasing history

User:

```text
"Muéstrame las compras a Gloria del último mes."
```

Flow:

```text
Intent = purchasing.history.supplier
      ↓
resolve Supplier
      ↓
resolve Organization-local date range
      ↓
authorize
      ↓
Purchasing query
      ↓
return Purchase history
```

---

# 86. Example — create Sale

User:

```text
"Registra 2 Coca-Colas a Juan."
```

Possible interpretation:

```text
Intent = sales.create

quantity = 2
Product = unresolved/resolved Coca-Cola
Customer = unresolved/resolved Juan
```

But settlement information is missing.

The Assistant must not guess whether the Sale is:

```text
cash
credit
partially paid
```

It asks for the missing settlement information.

---

# 87. Sale clarification example

Assistant may ask:

```text
"¿La venta fue pagada ahora o quedará a crédito?"
```

If paid:

```text
"¿Con qué método/cuenta se registró el pago?"
```

according to the Finance workflow required by the target use case.

---

# 88. Sale confirmation example

After all information is resolved:

```text
Venta a registrar

Cliente:
Juan Pérez

2 × Coca-Cola 500 ml
S/ 5.00 c/u

Total:
S/ 10.00

Pago:
Crédito

Receivable:
S/ 10.00
```

The Assistant asks for explicit confirmation.

Only after confirmation does it call the canonical Sale application capability.

---

# 89. Anonymous Sale example

User:

```text
"Registra 2 aguas en efectivo."
```

If Product, quantity, price, settlement, account, and authorization can all be resolved safely:

```text
Customer = absent
```

is valid.

The Assistant must not create an `Unknown Customer`.

Confirmation still applies according to the write-risk policy.

---

# 90. Ambiguous Product write example

User:

```text
"Vende 2 Coca-Colas."
```

Catalog contains:

```text
Coca-Cola 500 ml
Coca-Cola 1 L
```

The Assistant asks which Product.

It does not choose based on arbitrary probability.

---

# 91. Ambiguous Customer write example

User:

```text
"Registra 2 aguas a Juan."
```

Parties contains:

```text
Juan Pérez
Juan Torres
```

The Assistant asks which Customer.

---

# 92. Finance example

User:

```text
"Registra un pago de 50 soles de Juan."
```

Possible issues include:

- several Customers named Juan;
- several outstanding Receivables;
- Payment may cover one or several obligations;
- Financial Account may be missing.

The Assistant gathers/clarifies the required information according to the canonical Finance capability.

It does not simply subtract S/50 from a customer debt number.

---

# 93. High-risk example

User:

```text
"Corrige el stock de Coca-Cola a 100."
```

Inventory Adjustment is a sensitive operation.

Initial V1 Assistant policy may respond:

> Inventory adjustments must currently be completed through the dedicated Inventory workflow.

The capability being available in the product does not require Assistant exposure.

---

# 94. Permission example

User:

```text
"Muéstrame cuánto se pagó a Pedro."
```

The Intent may be correctly understood.

If the Actor lacks the relevant Finance/Workforce permission, access is denied.

Language understanding never overrides authorization.

---

# 95. Future NLU

Future versions may replace or augment deterministic recognition with a natural-language classifier.

Conceptually:

```text
Natural language
      │
      ▼
NLU / LLM classifier
      │
      ▼
Intent + candidate structured input
```

The output still enters the same validation pipeline.

---

# 96. Future LLM boundary

A future LLM may help with:

- Intent classification;
- Slot extraction;
- synonym understanding;
- date phrase parsing;
- entity candidate ranking;
- response wording.

It must not become owner of:

- domain rules;
- authorization;
- transaction validity;
- stock policy;
- financial settlement;
- persistence.

---

# 97. LLM output is untrusted input

Future AI output must be treated conceptually like any other external input.

It requires:

- schema validation;
- entity resolution;
- authorization;
- domain validation;
- confirmation according to risk.

The model's confidence is not business authorization.

---

# 98. AI provider independence

No domain module should depend on:

```text
OpenAI
Anthropic
Google
local model
another provider
```

to perform its business rules.

Any future provider belongs behind the Assistant interpretation boundary.

Changing interpretation provider must not require rewriting Sales, Inventory, Finance, Purchasing, Parties, or Workforce.

---

# 99. Future classifier replacement

The execution architecture should permit:

```text
Deterministic classifier
```

to later become:

```text
Deterministic rules
+
NLU classifier
```

or:

```text
LLM-assisted interpretation
```

while keeping:

```text
Intent Registry
Input schema
Authorization
Confirmation
Application capability
Domain rules
```

unchanged.

---

# 100. Hallucination policy

The Assistant must not present invented operational data as fact.

If authoritative information cannot be obtained, it should say so.

Example:

```text
"¿Cuánto stock hay?"
```

If Inventory query fails, do not estimate based on previous chat.

---

# 101. Explanations versus execution

The Assistant may provide explanatory text beyond strict Intent execution.

For example:

```text
"¿Qué significa saldo pendiente?"
```

may be answered informationally.

But explanations do not receive business-state mutation authority.

---

# 102. Natural-language response formatting

The Assistant may transform structured domain output into human-friendly language.

Example structured result:

```text
outstanding = 80 PEN
```

may become:

```text
"Juan tiene S/ 80 pendientes."
```

Formatting must not change the underlying fact.

---

# 103. Structured result preservation

Where useful, Assistant responses should conceptually preserve enough structured information for the product UI to:

- link to the entity;
- open the relevant screen;
- provide actions;
- display provenance.

The exact frontend protocol is deferred.

---

# 104. Suggested actions

The Assistant may suggest valid next actions.

Example:

```text
"Juan debe S/ 80."
```

may offer:

```text
"Registrar pago"
```

if the Actor is authorized.

Suggestion does not execute the action.

---

# 105. Assistant does not silently chain writes

Initial V1 should avoid hidden chains such as:

```text
User asks one thing
Assistant decides three additional mutations are useful
and performs them automatically
```

Each consequential effect must belong to the explicitly supported application capability and confirmation preview.

---

# 106. Multi-step use cases

A canonical application use case may itself atomically coordinate several domains.

For example:

```text
Create Sale
```

may produce:

- Sale;
- Inventory Movement;
- Payment;
- Receivable.

The Assistant may call that one capability.

It should not separately orchestrate low-level domain writes to recreate it.

---

# 107. One confirmation may cover one canonical use case

If the canonical use case intentionally includes several consequences, one confirmation may approve the complete previewed operation.

Example:

```text
Confirm Sale
```

can authorize the expected:

```text
Sale
Inventory effect
Payment / Receivable
```

when all are clearly presented as consequences of the Sale.

---

# 108. Hidden side effects are prohibited

A confirmation preview should not present:

```text
"Create Sale"
```

while secretly also:

```text
forgiving customer debt
adjusting unrelated stock
changing permissions
```

Consequences must belong to the canonical operation being confirmed.

---

# 109. Assistant capability lifecycle

Adding an Assistant Intent should be deliberate.

A new Intent requires:

1. stable application capability;
2. validated input contract;
3. entity-resolution policy;
4. authorization requirement;
5. risk classification;
6. confirmation policy;
7. failure behavior;
8. test strategy.

---

# 110. Domain milestones and Assistant readiness

Domains should expose reusable application capabilities regardless of whether the Assistant uses them immediately.

This allows:

```text
Web
Assistant
future mobile app
future integrations
```

to share the same execution layer.

---

# 111. Assistant-specific business rules are a smell

If implementation starts adding rules such as:

```text
if source === "assistant"
then stock may go negative
```

or:

```text
assistant-created Sale uses another pricing rule
```

the architecture is likely incorrect.

Interface source must not redefine domain truth.

---

# 112. Assistant-specific presentation policy is acceptable

The Assistant may have interface-specific behavior such as:

- phrasing;
- clarification wording;
- confirmation presentation;
- conversational context.

Those are interaction concerns.

They must not alter business semantics.

---

# 113. Testing expectations

M10 should test the Assistant at several boundaries.

## Recognition tests

```text
phrase
→ expected Intent
```

## Slot tests

```text
phrase
→ normalized structured input
```

## Entity-resolution tests

```text
input
→ unique / ambiguous / not found
```

## Authorization tests

```text
Intent + Actor
→ allowed / denied
```

## Confirmation tests

```text
R2 write
→ cannot execute without matching confirmation
```

## Execution integration tests

```text
Intent
→ canonical application use case
```

without direct persistence shortcuts.

---

# 114. Security tests

At minimum, later implementation should verify:

- no cross-Organization entity resolution;
- unauthorized reads fail;
- unauthorized writes fail;
- confirmation cannot be reused across actions;
- stale confirmation cannot execute changed input;
- Assistant cannot call arbitrary repositories;
- sensitive Intents remain unavailable unless explicitly enabled.

---

# 115. Observability

Assistant execution should support correlation between:

```text
conversation request
Intent
application use case
domain execution
result
```

without requiring raw conversational text to appear in every technical log.

---

# 116. Privacy

Conversation handling should follow product privacy requirements.

Raw conversational text may contain:

- customer names;
- financial amounts;
- business information.

Logging and future model-provider integration must minimize unnecessary data exposure.

Detailed privacy/provider policy belongs to M10/production hardening.

---

# 117. External AI data exposure

If a future external AI provider is introduced, Manasiness must explicitly determine:

- what business data may be sent;
- how tenant isolation is preserved;
- retention policy;
- provider configuration;
- sensitive-data minimization.

No such provider is required by V1.

---

# 118. Initial representative Intent set

M10 does not need to implement every possible Intent.

A useful initial representative set may include:

```text
sales.summary.today
sales.summary.period

inventory.product.stock

customer.balance
customer.sales.history

supplier.balance
purchasing.history.supplier

sales.create
```

Potential additional Intents should be added only after the underlying application capability is stable.

---

# 119. Payment Intent

A future:

```text
finance.payment.record
```

is valuable but more sensitive than read queries.

It should only enter the Assistant allowlist once:

- Finance workflow is stable;
- allocation semantics are clear;
- Financial Account selection is safe;
- confirmation UX is adequate;
- idempotency is implemented.

---

# 120. Operations initially excluded from Assistant writes

The initial V1 Assistant should generally exclude direct conversational execution of actions such as:

```text
Inventory Adjustment
Payment Reversal
Debt Forgiveness
Sale Correction
Purchase Correction
Sale Cancellation with consequences
Purchase Cancellation with consequences
Membership changes
Permission changes
Identity-security operations
hard deletion
```

These operations may still exist through dedicated product workflows.

---

# 121. Why sensitive actions are excluded initially

The goal of V1 is not maximum Assistant power.

It is trustworthy operational usefulness.

Read queries and carefully selected write operations provide value without immediately exposing every high-risk capability through natural language.

---

# 122. Assistant failure principle

When uncertain, the Assistant should prefer:

```text
clarify
reject
or declare unsupported
```

over:

```text
guess and mutate
```

This principle becomes stricter as operation risk increases.

---

# 123. Assistant success principle

A successful Assistant write means:

> The canonical application capability successfully completed the operation.

It does not mean:

> The Assistant understood the sentence.

Understanding and execution are separate stages.

---

# 124. Response after successful write

After execution, the Assistant should report the authoritative result returned by the application capability.

Example:

```text
Venta registrada.

Cliente:
Juan Pérez

Total:
S/ 10.00

Estado financiero:
S/ 10.00 por cobrar
```

It should not reconstruct success from the original user message.

---

# 125. Response after rejected write

Example:

```text
No pude registrar la venta porque solo quedan 1 unidad y solicitaste 2.
```

The Assistant may offer a valid next step such as:

```text
"Puedes revisar o ajustar el inventario desde el flujo de Inventario."
```

It must not automatically bypass the rule.

---

# 126. Response after changed state

If the state changed after confirmation:

```text
"La operación ya no puede ejecutarse con los datos confirmados porque el stock cambió. Ahora queda 1 unidad."
```

The user must review the new situation.

---

# 127. Assistant and Reporting

For analytical questions, the Assistant should prefer canonical Reporting/application queries where those exist.

It should not download raw data and invent independent metric definitions.

Example:

```text
"¿Cuánto vendí hoy?"
```

should use the canonical definition of Sales amount.

---

# 128. Assistant and Parties

The Assistant resolves:

- Customers;
- Suppliers;
- Workers;

through Organization-scoped domain capabilities.

It must not maintain a private duplicate address book.

---

# 129. Assistant and Catalog

Product lookup uses Catalog capabilities.

Current Product metadata may aid interpretation.

Historical transaction facts remain owned by Sales/Purchasing.

---

# 130. Assistant and Inventory

Assistant stock queries use Inventory.

Assistant Sales use Sales, which coordinates Inventory through the canonical application flow.

The Assistant does not manipulate Stock Balance directly.

---

# 131. Assistant and Finance

Balance and Payment capabilities use Finance.

The Assistant does not derive:

```text
customer debt
```

from Sales statuses.

It consumes Finance-owned Receivables/Payables semantics.

---

# 132. Assistant and Sales

For Sales creation, the Assistant provides resolved structured input to the Sales application capability.

Sales remains responsible for:

- transaction validation;
- pricing behavior;
- Inventory coordination;
- Finance coordination;
- atomicity.

---

# 133. Assistant and Purchasing

Initial V1 may focus on Purchasing reads.

Future controlled writes such as Receipt recording can be introduced only after their risk and input requirements are explicitly defined.

---

# 134. Assistant and Workforce

The Assistant may support read queries such as worker history where authorized.

It must preserve:

```text
Worker
≠
Identity
```

and must not infer permissions from employment role.

---

# 135. Tenant invariant

Every Organization-scoped Intent executes in exactly one active Organization context.

The Assistant must never combine data from several Organizations unless a future explicitly authorized cross-Organization reporting capability is designed.

---

# 136. Canonical execution invariant

Every state-changing Intent ultimately maps to one authoritative application capability.

There must not be:

```text
Assistant-only business execution
```

---

# 137. Interpretation invariant

Natural-language interpretation produces candidate structured intent.

It does not produce trusted domain state directly.

---

# 138. Authorization invariant

Every Intent is authorized.

Correct language understanding cannot turn an unauthorized request into an allowed one.

---

# 139. Ambiguity invariant

Consequential ambiguous input is clarified explicitly.

Probability alone is not sufficient justification for a business mutation.

---

# 140. Confirmation invariant

Allowlisted consequential state-changing actions require deliberate confirmation according to their risk policy.

Confirmation is bound to one resolved action.

---

# 141. Persistence invariant

The Assistant never writes directly to database repositories, ORM models, or arbitrary SQL.

---

# 142. Domain-rule invariant

The Assistant never becomes the authoritative owner of business rules belonging to another domain.

---

# 143. AI invariant

Future NLU/LLM systems may improve interpretation.

They do not change:

- domain invariants;
- application capabilities;
- authorization;
- validation;
- confirmation;
- tenant isolation.

---

# 144. Audit invariant

Consequential Assistant-triggered actions remain attributable to:

```text
human Actor
+
Organization
+
Assistant channel
+
canonical business operation
```

---

# 145. Context invariant

Conversation context can reduce repetition.

It cannot:

- grant permissions;
- replace canonical business state;
- cross Organization boundaries silently;
- authorize future commands automatically.

---

# 146. V1 non-goals

V1 Assistant does not attempt to provide:

- unrestricted autonomous agents;
- arbitrary database querying;
- arbitrary SQL;
- arbitrary code execution;
- automatic business optimization;
- autonomous purchasing;
- autonomous Payments;
- unrestricted destructive actions;
- full voice assistant;
- general-purpose company chatbot;
- unrestricted analytics generation;
- AI-generated accounting decisions;
- background autonomous workflows.

---

# 147. Implementation non-goals for M0

This document does not:

- implement the Assistant engine;
- select an LLM provider;
- select embeddings;
- select a vector database;
- train a classifier;
- design chat UI;
- choose prompt formats;
- define final TypeScript schemas;
- define persistence tables;
- implement intent recognition;
- implement entity-resolution algorithms.

---

# 148. Deferred to M10

M10 will define and implement:

- physical Intent Registry;
- initial exact Intent list;
- recognition engine;
- normalization;
- input schemas;
- entity resolver interfaces;
- conversational context storage;
- clarification protocol;
- confirmation protocol;
- risk-policy representation;
- application-use-case adapters;
- Assistant audit metadata;
- response format;
- tests;
- API contract;
- user-facing conversational experience.

---

# 149. Future AI evolution

After deterministic V1 proves the execution model, future iterations may add:

```text
LLM / NLU
```

before the Intent boundary.

Conceptually:

```text
User language
      │
      ▼
Deterministic / AI interpretation
      │
      ▼
Validated Intent
      │
      ▼
Entity resolution
      │
      ▼
Authorization
      │
      ▼
Confirmation
      │
      ▼
Application use case
      │
      ▼
Domain
```

The lower half of this pipeline remains stable regardless of interpretation technology.

---

# 150. Decision summary

The Operational Assistant is:

```text
a conversational interface
over trusted Manasiness application capabilities
```

It is not:

```text
a second backend
an autonomous database agent
an authorization bypass
a business-rules engine
```

V1 uses a deterministic-first Intent model:

```text
language
   ↓
Intent
   ↓
validated Slots
   ↓
Organization-scoped Entity Resolution
   ↓
Clarification when necessary
   ↓
Authorization
   ↓
Risk / Confirmation
   ↓
Application capability
   ↓
Owning domain
```

Read operations are generally low-risk and require authorization but not confirmation.

State-changing operations are allowlisted and governed by explicit risk policies.

Consequential operations require confirmation.

Sensitive/destructive/security operations are generally excluded from the initial Assistant write surface.

Conversational context may improve usability but cannot become business truth or authorization.

Future LLM/NLU interpretation may replace or augment deterministic classification without changing the trusted execution architecture.

The central invariant is:

> **The Operational Assistant may interpret what the user wants, but only canonical Manasiness application capabilities may decide whether that operation is valid and change business state.**