- idempotency;
- invariant enforcement;
- domain ownership;
- cross-domain mutation rules;
- auditability;
- historical-data protection.

## Issue #6

Will refine Catalog and Inventory boundaries, including:

- Product;
- stocked vs non-stocked offerings;
- Stock Balance;
- Inventory Movement;
- Inventory Adjustment;
- negative-stock policy;
- correction semantics;
- future inventory locations.

## Issue #7

Will refine Finance concepts, including:

- Money;
- Payment;
- Settlement;
- Receivable;
- Payable;
- Outstanding Balance;
- Expense;
- Financial Account;
- Cash Movement;
- financial correction/reversal.

## Issue #8

Will refine the Sales domain, including:

- Sale;
- Sale Item;
- anonymous Sales;
- identified Customer association;
- Sale lifecycle;
- historical commercial snapshots;
- Inventory collaboration;
- Receivable creation.

## Issue #9

Will refine Purchasing, including:

- Purchase;
- Purchase Item;
- Supplier association;
- Purchase lifecycle;
- Receipt;
- Inventory collaboration;
- Payable creation.

## Issue #10

Will refine Workforce, including:

- Worker Relationship;
- Worker lifecycle;
- employment information;
- optional Identity association;
- Membership independence;
- worker-related Finance boundaries.

## Issue #11

Will refine the Operational Assistant, including:

- Intent registry;
- Slots;
- Entity Resolution;
- conversational context;
- Clarification;
- Confirmation;
- authorization;
- safe application-capability execution.

These later documents may refine these boundaries.

They should not silently contradict the ownership established here without updating the domain map explicitly.

---

# 26. Cross-cutting concerns are not business domains

Some responsibilities affect many domains but do not own the underlying business concepts.

Examples include:

- authentication infrastructure;
- authorization enforcement;
- logging;
- observability;
- audit infrastructure;
- validation infrastructure;
- configuration;
- database transactions;
- idempotency;
- error representation;
- caching;
- background execution.

These concerns should support owning domains rather than become a generic location where business rules accumulate.

For example:

```text
Transaction infrastructure
```

may help Sales and Inventory change state atomically.

It does not become the owner of:

```text
Sale rules
```

or:

```text
Inventory rules
```

Similarly:

```text
Audit infrastructure
```

may record relevant information from many domains.

It does not decide what a valid Sale or Payment means.

---

# 27. Application capability principle

A domain exposes useful business capabilities.

Other parts of Manasiness should depend on those capabilities rather than on the domain's internal representation.

Conceptually:

```text
Caller
   │
   ▼
Application capability
   │
   ▼
Owning domain
   │
   ▼
Persistence / external infrastructure
```

Examples may eventually include capabilities such as:

```text
CreateSale
RecordPayment
ReceivePurchase
AdjustInventory
CreateCustomerRelationship
EndWorkerRelationship
```

These names are illustrative rather than final API contracts.

The important principle is:

> Consumers ask the owning domain to perform business behavior.

They should not reproduce that behavior themselves.

---

# 28. Cross-domain transaction principle

Some real business operations naturally touch several domains.

For example, confirming a Sale may eventually involve:

```text
Sales
+
Inventory
+
Finance
```

That does not mean those domains should be collapsed into one domain.

It means the application layer needs an explicit orchestration and transactional strategy.

Likewise, receiving purchased goods may involve:

```text
Purchasing
+
Inventory
```

while supplier settlement may involve:

```text
Purchasing context
+
Finance
```

M0 Issue #5 will define the cross-cutting transaction policy.

This map establishes the more important rule first:

> Transactional consistency must not erase domain ownership.

---

# 29. Reference versus snapshot principle

Several domains need to preserve both a link to current master data and historical facts from the moment an operation occurred.

For example:

```text
Catalog Product
name = Coca-Cola 500 ml
current price = S/ 6
```

A historical Sale may need to preserve:

```text
Product reference
description at sale time
unit price = S/ 5
quantity = 2
```

If the Product later changes:

```text
current price = S/ 6
```

the Sale remains:

```text
unit price = S/ 5
```

The same principle applies where appropriate to:

- Purchase Items;
- Party display information;
- Supplier information;
- other historically meaningful transaction data.

This does not mean every field must always be snapshotted.

Each owning domain defines the minimum historical facts needed to keep its records understandable.

---

# 30. Anonymous operations versus missing data

Manasiness must distinguish:

```text
Information legitimately absent
```

from:

```text
Information accidentally missing
```

For example:

```text
Sale.customer = absent
```

can be valid because the buyer is anonymous.

That is different from:

```text
Sale total = unknown
```

when a total is required for a valid transaction.

This distinction prevents the return of Legacy patterns such as:

```text
Unknown Customer
```

which represented legitimate absence through a fake entity.

Domains should model optionality intentionally.

---

# 31. Lifecycle ownership

Every domain owns the lifecycle of the concepts it controls.

Examples:

```text
Organizations
└── Membership lifecycle

Parties
├── Customer Relationship lifecycle
└── Supplier Relationship lifecycle

Catalog
└── Product lifecycle

Sales
└── Sale lifecycle

Purchasing
└── Purchase lifecycle

Finance
├── Receivable lifecycle
├── Payable lifecycle
└── Payment/reversal semantics

Workforce
└── Worker Relationship lifecycle
```

No universal business `status` model should be created for all domains.

Similar labels do not imply identical semantics.

For example:

```text
active
```

may have different meaning for:

- Product;
- Membership;
- Worker Relationship;
- Customer Relationship.

Each domain defines its own valid transitions.

---

# 32. Deactivation versus historical existence

When a master entity or relationship is no longer active, that does not erase its historical existence.

Examples:

```text
Product deactivated
```

does not remove it from historical Sale Items.

```text
Supplier Relationship ended
```

does not remove previous Purchases.

```text
Worker Relationship ended
```

does not remove operations previously attributed to that Worker.

```text
Membership disabled
```

does not erase the Identity's historical actions.

Detailed deletion and archival policy belongs to Issue #5.

The domain-map principle is:

> Current usability and historical existence are different concerns.

---

# 33. Domain ownership of mutations

Only the owning domain should define how its canonical state changes.

Examples:

### Correct conceptual direction

```text
Sales
    │
    └── requests Inventory effect
               │
               ▼
          Inventory
```

### Incorrect conceptual direction

```text
Sales
    │
    └── directly updates stock balance
```

Likewise:

### Correct

```text
Sales
    │
    └── establishes obligation context
               │
               ▼
            Finance
               │
               └── owns Receivable settlement
```

### Incorrect

```text
Sales
    │
    └── directly changes receivable balance
```

This principle is fundamental for keeping business invariants in one place.

---

# 34. Read ownership versus write ownership

A domain may expose information that other domains need to read.

Reading does not transfer ownership.

For example:

```text
Sales reads Product information from Catalog
```

but Catalog owns Product.

```text
Reporting reads Sale information
```

but Sales owns Sale.

```text
Assistant reads Customer information
```

but Parties owns Customer Relationship.

Write behavior should be stricter than read behavior.

A consumer that needs another domain's state changed should use an owned capability rather than directly modifying internal data.

---

# 35. Domain events are intentionally undecided

Business events may eventually become useful for:

- decoupling secondary reactions;
- audit feeds;
- asynchronous work;
- integrations;
- reporting projections;
- notifications.

Examples might conceptually include:

```text
SaleConfirmed
PurchaseReceived
PaymentRecorded
InventoryAdjusted
```

However, this document intentionally does not decide:

- whether explicit domain events are implemented;
- whether they are synchronous;
- whether they are persisted;
- whether an event bus exists;
- whether messaging infrastructure is required.

Those are architectural choices.

The domain map only establishes that one domain may need to react to facts owned by another domain without taking ownership of the originating concept.

---

# 36. No microservice implication

The existence of several domains does not imply several deployable services.

The V1 architectural direction is a **modular monolith**.

Conceptually distinct domains can coexist in the same application and database while maintaining logical ownership boundaries.

Therefore:

```text
Domain boundary
```

does not mean:

```text
Network boundary
```

and:

```text
Domain dependency
```

does not imply:

```text
HTTP call
```

The implementation strategy belongs to M1 and architectural ADRs.

---

# 37. No table-per-domain implication

Likewise, this map does not prescribe persistence topology.

A domain may ultimately require:

- one table;
- several tables;
- projections;
- database constraints;
- snapshots;
- transactional coordination.

Those decisions must follow domain semantics.

The domain map should never be interpreted as a schema diagram.

---

# 38. Product surfaces are not domains

UI areas may combine capabilities from several domains.

For example, a future customer detail screen could show:

```text
Party information
Sales history
Receivables
Payments
```

That screen does not become a new `CustomerDetails` domain.

Likewise, a dashboard may combine:

```text
Sales
Inventory
Finance
Purchasing
```

without owning any of those facts.

Product surfaces organize user experience.

Domains organize business ownership.

---

# 39. The Pending experience is not a domain

Legacy had a dedicated Pending module.

V2 should retain the useful user experience:

> Show me unresolved obligations.

However, `Pending` should not become a canonical business domain.

Instead, the experience may project information such as:

```text
Finance
├── Receivables
└── Payables
```

plus other explicitly supported outstanding work.

Conceptually:

```text
Canonical domains
       │
       ▼
Outstanding-work projection
       │
       ▼
User experience
```

This prevents a generic `pending` concept from replacing precise domain semantics.

---

# 40. Dashboard is not a domain

Dashboard is a product surface.

It consumes information from domains such as:

- Sales;
- Purchasing;
- Inventory;
- Finance;
- Reporting.

It should not contain business logic that exists nowhere else.

---

# 41. Settings is not a single domain

A Settings UI may expose configuration owned by different domains.

Examples:

```text
Organization settings       → Organizations
Security settings           → Identity & Access
Financial settings          → Finance
Catalog configuration       → Catalog
```

The UI may group these for usability.

Their ownership remains separate.

---

# 42. Domain-level invariants

The exact invariant set will be defined in later M0 issues.

At this level, several ownership principles are already established.

## Identity & Access

- an operation requiring authentication must have a valid Identity context;
- authorization must respect the active Organization context.

## Organizations

- Organization-scoped behavior belongs to an explicit Organization;
- Membership and employment are different relationships.

## Parties

- Party identity is independent from authentication;
- one Party may hold more than one business relationship.

## Catalog

- Product identity is not inventory quantity;
- current Product information must not silently rewrite transaction history.

## Inventory

- meaningful stock mutation requires an explainable reason;
- Inventory owns quantity invariants.

## Finance

- settlement is distinct from commercial lifecycle;
- Receivables and Payables must preserve outstanding balance semantics.

## Sales

- one Sale may contain multiple Sale Items;
- anonymous Sale is valid;
- historical commercial values must remain understandable.

## Purchasing

- one Purchase may contain multiple Purchase Items;
- receipt and supplier settlement are distinct.

## Workforce

- Worker Relationship does not require application access;
- ending employment does not erase history.

## Assistant

- Assistant does not own business rules;
- ambiguity must not silently produce consequential operations.

## Reporting

- Reports derive from canonical facts;
- Reporting does not redefine source-domain truth.

---

# 43. Domain dependency summary

A simplified dependency view is:

```text
Identity & Access ←→ Organizations

Organizations
├── Parties
├── Catalog
├── Inventory
├── Finance
├── Sales
├── Purchasing
└── Workforce

Parties
├── Sales
├── Purchasing
├── Workforce
└── Finance

Catalog
├── Sales
├── Purchasing
└── Inventory

Sales
├── Inventory
└── Finance

Purchasing
├── Inventory
└── Finance

Workforce
└── Finance

Operational Assistant
└── consumes application capabilities across domains

Reporting
└── consumes canonical/read-oriented information across domains
```

This should be interpreted as conceptual dependency, not physical architecture.

---

# 44. High-level capability matrix

| Domain | Primary capability | Key concepts | Main collaborators |
|---|---|---|---|
| Identity & Access | authenticate and authorize access | Identity, Session, authorization | Organizations |
| Organizations | represent tenant businesses and participation | Organization, Membership | Identity & Access |
| Parties | represent business counterparties | Party, Customer Relationship, Supplier Relationship | Sales, Purchasing, Workforce, Finance |
| Catalog | represent commercial offerings | Product, Category | Sales, Purchasing, Inventory |
| Inventory | explain and control stock | Stock Balance, Inventory Movement, Adjustment | Catalog, Sales, Purchasing |
| Finance | manage operational money and obligations | Money, Payment, Receivable, Payable, Expense | Sales, Purchasing, Workforce, Parties |
| Sales | represent customer commercial transactions | Sale, Sale Item | Parties, Catalog, Inventory, Finance |
| Purchasing | represent supplier commercial transactions | Purchase, Purchase Item | Parties, Catalog, Inventory, Finance |
| Workforce | represent workers and their operational relationship | Worker Relationship | Parties, Organizations, Finance |
| Operational Assistant | conversational access to capabilities | Intent, Slot, Clarification, Confirmation | all operational domains |
| Reporting | derive business understanding | Report, Metric, Projection | all canonical domains |

---

# 45. Business flow examples

## 45.1 Anonymous cash sale

Conceptually:

```text
Identity & Access
    │ authorize operator
    ▼
Sales
    │
    ├── Customer Relationship: absent
    ├── Sale Item → Catalog Product
    │
    ├── request inventory consequence
    │          │
    │          ▼
    │      Inventory
    │
    └── settlement information
               │
               ▼
            Finance
```

No fake Customer Party is needed.

---

## 45.2 Identified credit sale

```text
Parties
└── Customer Relationship
        │
        ▼
Sales
└── Sale
    ├── Sale Items
    └── commercial total
             │
             ├────► Inventory effect
             │
             └────► Finance
                    └── Receivable
                        ├── Payment #1
                        ├── Payment #2
                        └── Outstanding Balance
```

The customer relationship, Sale, inventory effect, and Receivable are related but distinct.

---

## 45.3 Supplier purchase paid later

```text
Parties
└── Supplier Relationship
        │
        ▼
Purchasing
└── Purchase
    ├── Purchase Items
    │
    ├── goods received
    │       │
    │       ▼
    │   Inventory
    │
    └── commercial obligation
            │
            ▼
         Finance
         └── Payable
             └── Payment later
```

Stock can exist before the supplier has been fully paid.

---

## 45.4 Worker without account

```text
Parties
└── Party
    └── Worker Relationship
            │
            ▼
        Workforce
```

No Identity or Membership is required.

---

## 45.5 Worker with application access

```text
Real person
│
├── Party
│   └── Worker Relationship
│
└── Identity
    └── Membership
```

The relationship between those representations may be linked explicitly.

They must not collapse into one entity.

---

## 45.6 Assistant-driven sale

```text
"Registra 2 Coca-Colas a Juan"
               │
               ▼
      Operational Assistant
               │
       recognize Intent
               │
       resolve entities
               │
       clarify if needed
               │
       confirm if required
               │
               ▼
          Sales capability
               │
          ┌────┴────┐
          ▼         ▼
      Inventory   Finance
```

The execution path after interpretation is the same trusted domain behavior available to other interfaces.

---

# 46. Evolution rules

The domain map is expected to evolve.

New capabilities may appear as product knowledge increases.

However, creating a new domain should require evidence that the capability has:

- meaningful business language of its own;
- meaningful rules/invariants;
- an independent lifecycle;
- clear ownership value.

A new domain should not be created merely because:

- a new screen exists;
- a new table exists;
- a folder becomes large;
- a developer wants another module;
- a technical integration is introduced.

Likewise, two domains should not be merged merely because they currently share infrastructure or participate in the same transaction.

---

# 47. How future issues should use this map

Before implementing or specifying a capability, future work should ask:

1. Which domain owns this concept?
2. Which other domains does it reference?
3. Which other domains can it ask to perform behavior?
4. Are we duplicating another domain's invariant?
5. Are we introducing ambiguous vocabulary?
6. Are we accidentally making a UI/report/assistant layer the source of business truth?
7. Does the proposed implementation preserve Organization isolation?
8. Does historical information remain understandable?

When ownership is unclear, the domain decision should be resolved before implementation.

---

# 48. Source-of-truth hierarchy

For domain ownership:

```text
Product Vision
      │
      ▼
Ubiquitous Language
      │
      ▼
Domain Capability Map
      │
      ▼
Domain-specific M0 documents
      │
      ▼
ADRs / architecture
      │
      ▼
Implementation
```

`docs/domain/ubiquitous-language.md` defines what canonical terms mean.

This document defines which domain owns those concepts and how domains collaborate at a high level.

Later domain-specific documents may add precision.

They must not silently redefine ownership.

---

# 49. Decision summary

Manasiness V1 is organized around eleven primary domains:

```text
Identity & Access
Organizations
Parties
Catalog
Inventory
Finance
Sales
Purchasing
Workforce
Operational Assistant
Reporting
```

Their core ownership can be summarized as:

```text
Identity & Access
→ who is accessing and whether they may act

Organizations
→ which business is being operated and who participates

Parties
→ who the business knows

Catalog
→ what the business commercially recognizes

Inventory
→ how much stocked product exists and why

Finance
→ what money moved or remains owed

Sales
→ what the business sold

Purchasing
→ what the business acquired

Workforce
→ who works for the business

Operational Assistant
→ how natural-language requests reach trusted capabilities

Reporting
→ how canonical facts become business understanding
```

The most important boundary rule is:

> **A domain may cause, consume, or display another domain's information without becoming the owner of that domain's rules.**

This rule is the basis for the modular-monolith architecture that will be designed in later milestones.