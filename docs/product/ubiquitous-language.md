# Manasiness — Ubiquitous Language

> **Status:** Active  
> **Milestone:** M0 — Product & Domain Foundation  
> **Scope:** Manasiness V1  
> **Purpose:** Establish the canonical business vocabulary used across product, domain, architecture, issues, documentation, and implementation.

---

## 1. Purpose

A long-lived product needs consistent language.

Manasiness Legacy used several terms with overlapping or overloaded meanings:

- `store` represented both a business and an authenticated account;
- `user` represented customers, suppliers, and workers;
- `order` represented supplier purchasing;
- `paid` represented financial settlement and also controlled inventory effects;
- `staff` represented worker-related payments;
- `pending` represented several unrelated kinds of unresolved business state.

Those terms made implementation initially simpler but made the product model increasingly ambiguous.

Manasiness V1 must avoid allowing code, database tables, UI labels, or API names to define business language accidentally.

This document establishes the canonical vocabulary.

When a term has a precise meaning here, future work should use that meaning unless a deliberate domain decision updates this document.

---

# 2. Language rules

## 2.1 Business meaning comes before implementation naming

A term describes a business concept.

It does not imply:

- a database table;
- a TypeScript class;
- a NestJS module;
- an API endpoint;
- a React component;
- a specific persistence pattern.

For example:

> `Sale`

means a commercial transaction.

It does not imply that the implementation must contain a SQL table literally named `sales`.

---

## 2.2 One term should have one primary meaning

Terms should not silently change meaning between domains.

For example:

`Organization` always means a tenant business operating in Manasiness.

It must not sometimes mean a supplier company.

A supplier company is a `Party`, specifically a company-type Party.

---

## 2.3 Different lifecycles require different concepts

If two facts can change independently, they should normally have different names.

Examples:

```text
Identity ≠ Worker

Membership ≠ Employment

Product ≠ Stock Balance

Sale ≠ Payment

Purchase ≠ Payment

Purchase ≠ Receipt

Operational status ≠ Settlement status
```

---

## 2.4 Historical facts should use historical language

A transaction that occurred yesterday does not become today's transaction because it was paid today.

Terms such as:

- occurred;
- confirmed;
- received;
- paid;
- cancelled;
- refunded;

must preserve their distinct meanings.

---

# 3. Identity and access language

## Identity

An **Identity** represents a person or security principal capable of authenticating into Manasiness.

Identity answers:

> Who is accessing Manasiness?

An Identity does not inherently represent:

- a customer;
- a supplier;
- a worker;
- an Organization;
- a job position.

One Identity may participate in multiple Organizations through Memberships.

### Example

```text
Sebastián
└── Identity
    ├── Membership → Business A
    └── Membership → Business B
```

### Ownership

**Identity & Access**

---

## User

`User` is considered an ambiguous term in domain language.

It may be used informally in product copy when referring generically to a person using Manasiness, but it should not be used as a domain synonym for:

- customer;
- supplier;
- worker;
- Party;
- Organization.

When precision matters, use `Identity`, `Member`, `Actor`, or the specific business relationship.

### Legacy status

**Deprecated as a domain entity name.**

The Legacy meaning:

```text
user.role = customer | supplier | worker
```

must not return.

---

## Authentication

**Authentication** is the process of proving which Identity is accessing Manasiness.

Authentication answers:

> Who are you?

It does not answer:

> What are you allowed to do?

### Ownership

**Identity & Access**

---

## Authorization

**Authorization** determines whether an authenticated Identity may perform a particular action in a particular context.

Authorization answers:

> Are you allowed to do this here?

Authorization must consider the active Organization and the relevant Membership.

### Ownership

**Identity & Access**, using Organization Membership information.

---

## Session

A **Session** represents an authenticated interaction context for an Identity.

The exact technical representation is not defined by this vocabulary.

A Session is not an Organization and does not itself establish business ownership.

### Ownership

**Identity & Access**

---

# 4. Organization language

## Organization

An **Organization** is a business operating within Manasiness.

It is the primary tenant boundary.

Most operational information belongs to exactly one Organization.

Examples include:

- products;
- Parties;
- sales;
- purchases;
- inventory;
- financial records;
- workforce records.

An Organization is not an authentication account.

An Organization may have many authorized Identities through Memberships.

### Example

```text
Identity
    │
Membership
    │
    ▼
Organization
```

### Ownership

**Organizations**

---

## Tenant

`Tenant` is an architectural term describing an isolated customer/business boundary in the SaaS.

For Manasiness V1:

> Organization is the primary tenant.

Use `Organization` in product/domain language.

Use `tenant` only when discussing architectural isolation concerns.

---

## Membership

A **Membership** represents the relationship that allows an Identity to participate in an Organization.

It answers:

- which Organization may this Identity access?
- what authorization context does the Identity have there?
- whether the Identity currently participates in that Organization?

A Membership is not:

- employment;
- a Worker Relationship;
- a customer relationship;
- a supplier relationship.

### Example

```text
Identity: María
    │
Membership: Administrator
    │
Organization: Bodega Central
```

María may or may not also be a Worker.

### Ownership

**Organizations**

Authorization behavior based on Membership belongs to **Identity & Access**.

---

## Member

A **Member** is an Identity with an active Membership in an Organization.

This is a convenience business term.

`Member` does not imply employment.

---

# 5. Party language

## Party

A **Party** represents a real person or external business/company with whom an Organization maintains a meaningful business relationship.

A Party provides stable business identity independent from authentication.

A Party may participate in several relationships simultaneously.

### Examples

```text
Party: Juan Pérez
├── Customer Relationship
└── Supplier Relationship
```

or:

```text
Party: Distribuidora Lima S.A.C.
└── Supplier Relationship
```

A Party does not require a Manasiness Identity.

### Ownership

**Parties**

---

## Person Party

A **Person Party** is a Party representing a natural person.

Examples:

- individual customer;
- independent supplier;
- worker;
- business contact.

The term describes the Party's real-world identity, not its relationship with the Organization.

---

## Company Party

A **Company Party** is a Party representing a company, business, institution, or other organizational counterparty.

Examples:

- supplier company;
- corporate customer;
- service provider.

Use `Company Party` when precision is necessary to avoid confusing it with the Manasiness tenant `Organization`.

---

## Contact information

**Contact information** describes ways of communicating with a Party.

Examples may include:

- phone;
- email;
- address;
- external identifiers.

Contact information is not equivalent to authentication credentials.

### Ownership

**Parties**

---

# 6. Commercial relationship language

## Customer Relationship

A **Customer Relationship** states that a Party is recognized by an Organization as a customer worth identifying persistently.

It exists because the Organization needs an ongoing commercial relationship or history.

A Customer Relationship may support:

- identifiable purchase history;
- receivables;
- recurring orders;
- notes;
- contact information;
- future customer portal access.

A customer does not require a Manasiness Identity.

### Ownership

**Parties**

Sales references the relationship but does not own it.

---

## Customer

`Customer` is the normal shorthand for a Party with a Customer Relationship.

It should not be interpreted as an authenticated user.

---

## Anonymous Customer

There is no persistent domain entity named `Anonymous Customer`.

When a sale does not require identifying the buyer:

```text
Sale
└── Customer Relationship: absent
```

The transaction is an **anonymous sale** or **casual sale**.

Manasiness must not create a fake Party such as `Unknown Customer`.

---

## Supplier Relationship

A **Supplier Relationship** states that a Party supplies goods or services to an Organization.

It may support:

- purchase history;
- payable history;
- contact information;
- commercial terms;
- future supplier portal access.

A Supplier Relationship does not require authentication access.

### Ownership

**Parties**

Purchasing references the relationship but does not own it.

---

## Supplier

`Supplier` is the normal shorthand for a Party with a Supplier Relationship.

---

# 7. Workforce language

## Worker Relationship

A **Worker Relationship** represents the operational/employment relationship between a Party and an Organization.

A Worker Relationship is independent from:

- Identity;
- Membership;
- authorization role.

A person may therefore be:

```text
Party
└── Worker Relationship
```

without having login access.

Or:

```text
Identity
├── Membership
│
Party
└── Worker Relationship
```

when the same person is also authorized to use Manasiness.

### Ownership

**Workforce**

The underlying Party identity remains owned by **Parties**.

---

## Worker

`Worker` is the normal shorthand for a Party with a Worker Relationship.

A Worker is not automatically a Member.

A Member is not automatically a Worker.

---

## Employment role

An **Employment Role** describes a worker's role, function, position, or responsibility in the business.

Examples might include:

- cashier;
- salesperson;
- warehouse operator;
- manager.

It is not an authorization permission.

---

## Authorization role

An **Authorization Role** groups or expresses permissions inside Manasiness.

Examples might include:

- administrator;
- inventory operator;
- sales operator.

An Authorization Role does not prove that the Member holds the equivalent real-world job.

The exact authorization model is defined later.

---

# 8. Catalog language

## Catalog

The **Catalog** is the Organization's managed set of commercial offerings and associated descriptive information.

It may contain Products, categories, pricing metadata, and other information required for commercial operation.

The Catalog does not own inventory quantities.

### Ownership

**Catalog**

---

## Product

A **Product** represents a good or service that the Organization recognizes commercially.

A Product has stable identity within the Organization even when mutable attributes change.

Examples of mutable catalog information may include:

- display name;
- category;
- description;
- current/default price;
- current/default cost metadata;
- active state.

A Product is not its current inventory quantity.

### Ownership

**Catalog**

---

## Service

A **Service** is a commercial offering that does not necessarily represent stocked physical inventory.

Whether V1 exposes Services explicitly or models stocked/non-stocked Products is deferred to Catalog design.

The important distinction is:

> Not every commercial offering must imply stock.

---

## Category

A **Category** groups Products for organization, navigation, filtering, or reporting.

The exact category model is not defined here.

### Ownership

**Catalog**

---

## Price

A **Price** is a monetary amount associated with selling a Product under a particular commercial context.

Current catalog pricing and historical transaction pricing are different facts.

A change to a current Price must not change historical Sale Items.

---

## Cost

A **Cost** is monetary information describing what acquiring or otherwise obtaining a Product costs in a defined context.

Current/default cost metadata must not replace historical Purchase Item cost facts.

---

# 9. Inventory language

## Inventory

**Inventory** is the domain concerned with quantities of stocked goods held or controlled by an Organization.

Inventory answers questions such as:

- how much stock is available?
- why did stock change?
- what business event caused the change?
- can a requested stock mutation occur?

Inventory does not own Product identity.

### Ownership

**Inventory**

---

## Stock

**Stock** refers to quantities of physical inventory.

`Stock` is not a field on Product in the domain vocabulary.

It is a business quantity managed by Inventory.

---

## Stock Balance

A **Stock Balance** represents the current quantity of stock for a Product within a defined inventory scope.

In V1 the primary scope may be the Organization.

Future scopes may include locations or warehouses.

A Stock Balance is a current projection/state.

It is not sufficient by itself to explain inventory history.

### Ownership

**Inventory**

---

## Available Stock

**Available Stock** represents the quantity that the product considers available for relevant operations.

The exact distinction between:

- on hand;
- reserved;
- available;

is intentionally deferred until Inventory requirements justify it.

Do not use these terms interchangeably unless the domain later defines them as equivalent for V1.

---

## Inventory Movement

An **Inventory Movement** is an explainable business record of a quantity change.

Examples include:

- receipt;
- sale/fulfillment;
- customer return;
- supplier return;
- adjustment;
- loss;
- damage;
- correction.

Every meaningful stock change should have a business reason.

### Ownership

**Inventory**

---

## Inventory Adjustment

An **Inventory Adjustment** is an intentional correction of inventory quantity that does not originate from an ordinary Sale or Purchase flow.

An Adjustment must preserve why the quantity changed.

It replaces the Legacy behavior of editing `Product.stock` directly.

---

## Receipt

A **Receipt** is the business event in which goods are physically or operationally received into inventory.

Receipt is distinct from:

- Purchase creation;
- supplier invoice;
- Payment.

A Purchase may be unpaid while its merchandise has already been received.

### Ownership

The purchasing lifecycle may initiate or reference the Receipt, while inventory effects remain owned by **Inventory**.

Detailed ownership is refined in Issue #9.

---

# 10. Sales language

## Sale

A **Sale** is a commercial transaction in which an Organization provides one or more goods or services to a customer or anonymous buyer.

A Sale represents the transaction as a whole.

It may contain multiple Sale Items.

A Sale may exist independently from its financial settlement.

### Ownership

**Sales**

---

## Sale Item

A **Sale Item** represents one line within a Sale.

It identifies what was sold and preserves the historical commercial facts required to understand the transaction later.

Examples include:

- Product reference;
- description snapshot where appropriate;
- quantity;
- unit price;
- discount;
- line total.

Changing current Catalog information must not silently rewrite a historical Sale Item.

### Ownership

**Sales**

---

## Anonymous Sale

An **Anonymous Sale** is a Sale without an identified Customer Relationship.

Anonymous does not mean invalid or incomplete.

It is normal business behavior for casual purchases.

---

## Credit Sale

A **Credit Sale** is a Sale whose financial obligation is not fully settled at the relevant commercial point.

Credit describes settlement behavior.

It does not mean a separate type of customer identity.

---

## Sale lifecycle

The **Sale lifecycle** describes the commercial/operational progression of a Sale.

It must not be treated as identical to settlement status.

Exact Sale states are intentionally deferred to Issue #8.

---

# 11. Purchasing language

## Purchase

A **Purchase** is a commercial transaction in which an Organization acquires one or more goods or services from a Supplier.

A Purchase represents the acquisition transaction as a whole.

It may contain multiple Purchase Items.

### Ownership

**Purchasing**

---

## Purchase Item

A **Purchase Item** represents one line within a Purchase.

It preserves historical acquisition facts such as:

- Product reference;
- quantity;
- unit cost;
- relevant commercial values.

Changes to current Catalog cost metadata must not rewrite historical Purchase Items.

### Ownership

**Purchasing**

---

## Purchase Order

A **Purchase Order** is a specific procurement document or commitment sent to a Supplier before or independently from receipt.

It is **not** a synonym for Purchase.

V1 does not require a separate Purchase Order capability unless later domain work determines it is necessary.

This distinction exists to prevent the Legacy generic term `order` from returning ambiguously.

---

## Purchase lifecycle

The **Purchase lifecycle** describes the commercial progression of acquiring goods/services.

It is distinct from:

- Receipt;
- Payment;
- settlement status.

Exact states are defined later in Issue #9.

---

# 12. Finance language

## Money

**Money** represents a monetary amount together with the currency needed to interpret it correctly.

Money semantics include concerns such as:

- amount;
- currency;
- precision;
- rounding.

The exact rules are defined in Issue #7.

### Ownership

**Finance**

---

## Payment

A **Payment** represents a financial settlement event in which money is transferred or recorded toward an obligation.

Payments may be:

- incoming;
- outgoing;
- partial;
- complete;
- later corrected or reversed according to explicit rules.

A Payment is not a Sale.

A Payment is not a Purchase.

### Ownership

**Finance**

---

## Settlement

**Settlement** is the process of satisfying a financial obligation through one or more Payments or other explicitly supported adjustments.

Settlement is separate from the operational lifecycle of the originating transaction.

---

## Settlement Status

**Settlement Status** describes the financial state of an obligation.

Possible concepts may eventually include:

- unpaid;
- partially paid;
- paid;
- reversed.

Exact states are defined by Finance.

Do not reuse Sale or Purchase lifecycle states as settlement state.

---

## Receivable

A **Receivable** represents money the Organization has a valid right to collect from another Party.

A Receivable commonly originates from commercial behavior such as an identified credit Sale.

A Receivable may be settled through one or more incoming Payments.

### Ownership

**Finance**

Sales establishes the commercial facts that may cause the obligation.

Finance owns the financial obligation and settlement semantics.

---

## Payable

A **Payable** represents money the Organization owes to another Party.

A Payable commonly originates from purchasing or another supported obligation.

It may be settled through one or more outgoing Payments.

### Ownership

**Finance**

Purchasing establishes relevant commercial facts.

Finance owns the financial obligation and settlement semantics.

---

## Outstanding Balance

An **Outstanding Balance** is the remaining unsettled monetary amount of a Receivable or Payable.

It is not a replacement for the underlying obligation or payment history.

---

## Expense

An **Expense** represents an operational economic cost recognized by Manasiness according to the product's finance scope.

An Expense is not automatically:

- a Purchase;
- a supplier Payment;
- a cash movement;
- a worker Payment.

The precise V1 scope is defined by Finance.

### Ownership

**Finance**

---

## Financial Account

A **Financial Account** represents an operational place or channel in which money is tracked.

Examples might eventually include:

- cash register;
- bank account;
- digital wallet.

The exact V1 model is deferred.

### Ownership

**Finance**

---

## Cash Movement

A **Cash Movement** represents money entering, leaving, or moving between supported Financial Accounts.

Cash movement is not automatically equivalent to:

- revenue;
- Expense;
- Sale;
- Purchase.

### Ownership

**Finance**

---

## Revenue

**Revenue** describes value earned from supported commercial activity according to the reporting/finance definition.

It is not synonymous with incoming cash.

A credit Sale may create revenue before cash is received, depending on the final V1 finance semantics.

Detailed accounting semantics remain intentionally limited in V1.

---

# 13. Operational lifecycle language

## Operational Status

**Operational Status** describes where a business operation is in its own lifecycle.

Examples may include Sale or Purchase lifecycle states.

It must not be used as a generic synonym for financial settlement.

---

## Confirmed

`Confirmed` generally means an operation has crossed a business boundary after which it is considered authoritative enough to produce consequences.

The exact consequence depends on the owning domain.

This term should not be introduced into implementation until the specific domain defines it precisely.

---

## Cancelled

`Cancelled` means an operation has been intentionally terminated according to the owning domain's rules.

Cancellation is not automatically equivalent to:

- deletion;
- refund;
- reversal;
- return;
- debt forgiveness.

---

## Correction

A **Correction** is an explicit operation that repairs an incorrect historical or current business fact while preserving appropriate traceability.

Correction should generally be preferred over silently rewriting consequential history.

---

## Reversal

A **Reversal** is an explicit counter-operation that neutralizes or offsets a prior effect while keeping the original event observable.

The exact semantics depend on the owning domain.

---

# 14. Workforce and financial language

## Worker-related obligation

A **Worker-related obligation** is money the Organization owes to or records for a Worker according to supported Workforce/Finance behavior.

This term intentionally avoids assuming that every worker-related payment is `salary`.

Full payroll is outside V1.

---

## Salary

`Salary` should only be used when the product is actually representing salary as an employment concept.

It must not be used as a generic synonym for any money paid to a Worker.

---

# 15. Assistant language

## Operational Assistant

The **Operational Assistant** is a conversational interface over trusted Manasiness application capabilities.

It does not own domain business rules.

It does not directly own persistence.

### Ownership

**Operational Assistant**

---

## Intent

An **Intent** is a supported operation or information request that the Operational Assistant can recognize and route safely.

Examples:

```text
sales.summary
customer.receivable.get
inventory.stock.get
sale.create
```

An Intent represents a controlled capability, not arbitrary code execution.

### Ownership

**Operational Assistant**

---

## Slot

A **Slot** is a structured piece of information required to execute or clarify an Intent.

Examples:

- Product;
- quantity;
- Customer;
- Supplier;
- date range;
- Money amount.

The exact implementation is deferred.

---

## Entity Resolution

**Entity Resolution** is the process of matching conversational input to a canonical Manasiness entity.

Example:

```text
"Juan"
```

may resolve to:

```text
Juan Pérez
```

or may be ambiguous between multiple Parties.

Ambiguity must be made explicit when consequential.

---

## Clarification

A **Clarification** is an Assistant interaction that asks the user for missing or ambiguous information before execution.

The Assistant should clarify rather than guess when an incorrect assumption could have meaningful consequences.

---

## Confirmation

A **Confirmation** is deliberate user approval required before executing defined state-changing or sensitive Assistant actions.

Clarification and Confirmation are different:

```text
Clarification:
Which Juan?

Confirmation:
Register this Sale for Juan Pérez?
```

---

# 16. Reporting language

## Report

A **Report** is a presentation of operational information derived from canonical domain facts.

A Report does not own the underlying business rules.

### Ownership

**Reporting**

---

## Metric

A **Metric** is a precisely defined measurement derived from canonical domain information.

Metric names must describe what they actually measure.

Avoid vague names such as `income` when the calculation actually represents something else.

---

## Projection

A **Projection** is a read-oriented representation derived from canonical business facts for efficient presentation or reporting.

A Projection is not the authoritative owner of those facts.

---

# 17. Audit language

## Actor

An **Actor** identifies who or what initiated or performed a relevant operation.

An Actor may represent, for example:

- an authenticated Identity;
- a system process;
- a future integration.

Actor is not a synonym for Worker.

### Ownership

Actor attribution is a cross-cutting concern.

Identity information is owned by Identity & Access.

Audit semantics are defined in cross-cutting architecture work.

---

## Audit Event

An **Audit Event** records security- or business-relevant information about an operation that must remain attributable or inspectable.

Audit Event is not the same as every domain event.

Not every technical action needs an Audit Event.

### Ownership

Cross-cutting architecture policy, with information supplied by owning domains.

---

# 18. Terms intentionally retired from Legacy

The following Legacy terms must not keep their previous meaning.

| Legacy term | Legacy meaning | V1 decision |
|---|---|---|
| `Store` | business + login + tenant | Retired as core domain term; use `Organization` |
| `User` | customer, supplier, or worker | Retired with this meaning |
| `user.role` | one of customer/supplier/worker | Removed |
| `Unknown Customer` | fake customer for anonymous sales | Removed |
| `Unknown Supplier` | fake supplier | Removed |
| `Unknown Worker` | fake worker | Removed |
| `Order` | supplier acquisition row | Replace with explicit `Purchase` terminology |
| `Staff` | worker payment row | Removed as movement-domain concept |
| `Pending` | generic unresolved state | Do not use as universal domain model |
| `Paid` | generic operation state | Financial settlement concept only where defined |
| `Income` | paid sales minus paid purchases | Retired as that metric definition |
| `Expense` | paid purchases + paid staff | Retired as that legacy calculation |
| `Product.stock` | inventory source of truth | Retired as domain model |

---

# 19. Terms that require context

Some words may remain useful but must be qualified when ambiguity exists.

## Role

Always distinguish:

```text
Authorization Role
```

from:

```text
Employment Role
```

Do not write only `Role` in domain documentation when either meaning is possible.

---

## Status

Avoid a generic `status` when several independent lifecycles exist.

Prefer:

```text
Sale Status
Settlement Status
Worker Status
Membership Status
Product Status
```

---

## Organization

Without qualification, `Organization` means the Manasiness tenant business.

When referring to an external company represented as a Party, prefer:

```text
Company Party
```

---

## Account

`Account` is ambiguous.

Use:

- Identity;
- Financial Account;
- Organization;

depending on the actual concept.

---

## Order

Do not use `Order` without qualification.

Possible future terms include:

- Customer Order;
- Purchase Order.

The canonical V1 supplier acquisition transaction is `Purchase`.

---

# 20. Naming rules for future work

Future product, domain, architecture, issue, and implementation work should follow these rules.

### Use canonical domain terms

Prefer:

```text
Organization
Identity
Membership
Party
Customer Relationship
Supplier Relationship
Worker Relationship
Sale
Purchase
Payment
Receivable
Payable
Inventory Movement
```

over legacy terminology.

### Avoid generic names when ownership matters

Avoid:

```text
Manager
Helper
Common
Data
Record
Movement
Status
User
Order
```

when a more precise business term exists.

### Name operations by business intent

Prefer concepts such as:

```text
Create Sale
Receive Purchase
Record Payment
Adjust Inventory
Deactivate Customer Relationship
```

rather than generic operations such as:

```text
Update Record
Process Data
Change Status
```

### Do not let persistence naming redefine the domain

A future table or API name may differ for technical reasons.

The domain meaning defined here remains authoritative.

---

# 21. Source-of-truth policy

For terminology:

1. this glossary is the canonical naming source;
2. domain-specific documents may refine a term without silently changing its fundamental meaning;
3. ADRs may define technical representations but do not redefine business language;
4. implementation should follow the vocabulary rather than introduce competing terminology;
5. substantial vocabulary changes should update this document explicitly.

The purpose is not linguistic perfection.

The purpose is to make it possible for a founder, designer, developer, reviewer, and future contributor to discuss the same business concept and mean the same thing.