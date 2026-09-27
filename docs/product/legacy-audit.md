# Manasiness — Legacy Product Audit

> **Status:** Active  
> **Milestone:** M0 — Product & Domain Foundation  
> **Scope:** `manasiness-legacy` → Manasiness V1  
> **Purpose:** Identify which legacy behaviors represent valid product requirements, which require redesign, which implementation approaches should be replaced, and which concepts must not survive into the new product.

---

## 1. Purpose

Manasiness Legacy is valuable because it contains real product ideas, implemented workflows, operational assumptions, UX decisions, and lessons learned.

It is not the product or architectural source of truth for the new Manasiness.

The new product is a complete rebuild.

This document treats the legacy repository as evidence and answers four questions for every meaningful capability:

1. What business need was the legacy system trying to solve?
2. Is that need still valid?
3. Which behavior should survive?
4. Which legacy modeling or implementation decisions must not be carried forward?

This audit is intentionally concerned with **behavior and product semantics**.

It does not define:

- the new database schema;
- NestJS modules;
- API endpoints;
- Drizzle tables;
- React components;
- final state machines;
- migration scripts;
- backward-compatibility layers.

Those decisions belong to later M0 issues and implementation milestones.

---

# 2. Sources reviewed

This audit is based on the provided `manasiness-legacy` repository snapshot.

The review included:

- product README and documentation;
- PostgreSQL schema;
- database functions and triggers;
- indexes and constraints;
- authentication behavior;
- backend modules;
- controllers, services, repositories, validators, and mappers;
- catalog behavior;
- customer, supplier, worker, and user behavior;
- sales;
- orders;
- staff payments;
- pending records;
- income and expense reports;
- statistics and activity reports;
- bootstrap behavior;
- frontend routing;
- frontend feature organization;
- forms and movement registration;
- localStorage bootstrap cache;
- settings;
- security documentation;
- manual QA checklist;
- product screenshots.

The audited snapshot contains approximately:

- 18 backend modules;
- 11 top-level frontend feature areas;
- 9 PostgreSQL tables, including authentication-support tables;
- about 30,000 lines of TypeScript, TSX, CSS, and SQL.

The quantity of code is not itself relevant to V2.

The purpose of reviewing it is to extract product knowledge without importing legacy coupling.

---

# 3. Relationship to the V1 product vision

`docs/product/product-vision.md` is the product source of truth.

When legacy behavior conflicts with the V1 product vision, the product vision wins.

This audit therefore does not ask:

> How do we rebuild exactly what Legacy does?

It asks:

> What did Legacy teach us about what Manasiness should become?

The most important product direction established for V1 includes:

- Organization as the tenant boundary;
- Identity separated from the business itself;
- Membership separated from employment;
- Party separated from authentication;
- customer, supplier, and worker as business relationships;
- anonymous sales without fake customer records;
- multi-item commercial transactions;
- inventory movements that explain stock;
- operational lifecycle separated from financial settlement;
- partial payments and outstanding balances;
- deterministic Operational Assistant;
- one canonical source of business truth.

Any legacy behavior that contradicts these principles must be redesigned, replaced, or removed.

---

# 4. Classification model

Every legacy behavior in this audit uses one of four classifications.

## Preserve

The underlying business need and its essential product behavior remain valid.

The implementation may still change.

Example:

> Searching products is useful and should continue to exist.

Preserve does **not** mean copying the old code.

---

## Redesign

The business need remains valid, but the legacy domain model or workflow represents it incorrectly or too narrowly.

Example:

> Customer history is valuable, but customers should not be represented as `users` with `role = customer`.

---

## Replace

The product outcome remains desirable, but the legacy mechanism should be replaced rather than evolved.

This classification is particularly useful for technical/product infrastructure.

Example:

> Fast navigation should remain, but a manually synchronized giant localStorage bootstrap cache should not.

---

## Remove

The behavior or concept exists primarily because of a legacy modeling limitation and should not survive in V2.

Example:

> `Unknown Customer` should not exist as a fake business entity.

---

# 5. Executive assessment

Manasiness Legacy contains a valid core product.

The strongest ideas worth carrying forward are:

- a single operational workspace for the business;
- product and category management;
- fast sales registration;
- supplier purchase tracking;
- customer, supplier, and worker histories;
- pending-obligation visibility;
- search and filtering;
- clear active/inactive lifecycle;
- dashboard summaries;
- operational analytics;
- simple daily workflows;
- organization-scoped data;
- preservation of transaction prices;
- transactional checks around stock;
- frontend organization by business features;
- backend responsibility separation;
- deliberate documentation.

The largest weaknesses are not that the application lacks enough screens.

They are **domain-model problems**.

The most consequential legacy assumptions are:

```text
Store = business + login identity

User = customer | supplier | worker

Sale = one product line

Order = one product line

State = pending | paid | canceled

Payment state controls inventory movement

Product.stock = primary inventory truth

Pending → Paid rewrites business timestamps

Income ≈ paid sales - paid purchases

Expense ≈ paid purchases + paid staff records
```

Those assumptions make the product easy to implement initially but increasingly difficult to evolve correctly.

V2 should preserve the operational simplicity while replacing these conceptual shortcuts.

---

# 6. Legacy capability map

At a high level, Legacy currently consists of the following product areas.

```text
Store / Account
│
├── Authentication
├── Store information
└── Currency

Catalog
│
├── Categories
└── Products
    ├── Cost price
    ├── Sale price
    └── Stock

People
│
└── Users
    ├── Customer
    ├── Supplier
    └── Worker

Movements
│
├── Sales
├── Orders
└── Staff payments

Finance / Reports
│
├── Pending
├── Income
├── Expenses
├── Stats
└── Activity

Platform
│
├── Bootstrap
├── localStorage cache
├── Authentication cookie
└── Store-scoped queries
```

This map is useful as a product inventory.

It is **not** the target V2 domain map.

---

# 7. Authentication, account, and business ownership

## 7.1 Registration and login

### Legacy behavior

A new registration creates a row in `stores`.

That row contains:

- business name;
- email;
- password hash;
- phone;
- currency;
- image.

The same `stores` row therefore represents:

1. the business;
2. the authenticated account;
3. the tenant;
4. the security principal.

A JWT then contains:

```text
storeId
email
```

and protected requests resolve the tenant from that authenticated store.

### Classification

**REDESIGN**

### Preserve

The product still needs:

- registration;
- login;
- secure sessions;
- email verification;
- password recovery;
- authentication protection.

### Change

Authentication must belong to an **Identity**, not to an Organization.

The business must become an Organization independent from the person who logs in.

Conceptually:

```text
Identity
    │
    └── Membership
            │
            └── Organization
```

This makes possible:

- multiple users in one business;
- one user participating in several businesses;
- permissions;
- ownership transfer;
- worker accounts;
- customer portals;
- supplier portals.

None of these should require redefining the Organization itself.

---

## 7.2 One store equals one login

### Legacy behavior

There is no independent human identity.

Whoever owns the store credentials effectively **is the store**.

### Classification

**REMOVE**

This assumption must not survive.

One Organization may have multiple authorized identities.

One Identity may belong to multiple Organizations.

---

## 7.3 Email verification

### Legacy behavior

Registration sends a six-digit email verification code with expiration.

### Classification

**PRESERVE**

Verified registration is a valid product behavior.

The exact implementation belongs to the future identity/authentication design.

Verification must apply to Identity/account creation rather than to the Organization entity itself.

---

## 7.4 Password recovery and password change

### Legacy behavior

Legacy supports:

- forgot-password verification;
- password reset;
- authenticated password change;
- prevention of reusing the same password during change/reset.

### Classification

**PRESERVE**

Account recovery remains valuable.

It must move to the Identity lifecycle.

---

## 7.5 Browser authentication cookie

### Legacy behavior

The JWT is stored in an `httpOnly` browser cookie rather than localStorage.

### Classification

**REPLACE**

The **security intent should be preserved**:

- credentials/tokens should not be exposed unnecessarily to frontend JavaScript;
- browser sessions should use secure mechanisms.

However, JWT-in-cookie is an implementation choice, not a product contract.

M1/M3 should select the actual session architecture.

---

# 8. Tenant isolation

## 8.1 `store_id` scoping

### Legacy behavior

Business tables carry `store_id`.

Repositories consistently filter operations by the current store.

Composite foreign keys are also used in several places to reduce cross-store references.

### Classification

**PRESERVE**

The product requirement is excellent:

> Business data must belong to a tenant and must not cross tenant boundaries.

### Redesign direction

The tenant becomes `Organization`, not `Store`.

The exact enforcement strategy will be designed later and may include:

- application boundaries;
- database constraints;
- tenant-qualified queries;
- PostgreSQL policies or additional safeguards.

The legacy implementation is not copied, but the invariant is fundamental.

---

# 9. Organization information and settings

## 9.1 Store profile

### Legacy behavior

The store has:

- name;
- email;
- phone;
- image;
- currency.

### Classification

**REDESIGN**

Organization metadata remains useful.

However, account information and business information must be separated.

For example:

```text
Identity.email
```

and:

```text
Organization.name
Organization.contact information
Organization.settings
```

are not the same concern.

---

## 9.2 Currency

### Legacy behavior

Each store has a currency code and symbol.

The database restricts currency to a fixed list and also couples each code to a symbol.

### Classification

**REDESIGN**

An organization-level operating/base currency is useful for V1.

However:

- monetary semantics belong to the Finance domain;
- code and display symbol should not be treated as the same concept;
- supported-currency policy should not be determined by this legacy enum;
- historical transaction amounts must remain interpretable.

Detailed money semantics belong to M0 Finance work.

---

# 10. People model

This is one of the areas requiring the largest redesign.

---

## 10.1 Generic `users` table

### Legacy behavior

Legacy stores customers, suppliers, and workers in one table:

```text
users
├── role = customer
├── role = supplier
└── role = worker
```

A user has exactly one role.

Role changes are explicitly rejected.

### Classification

**REMOVE**

The `users` concept must not survive with this meaning.

In V2, `User` / `Identity` refers to someone who can authenticate.

Commercial people and companies belong to the Party model.

---

## 10.2 Customer relationship

### Legacy behavior

Customers have:

- name;
- image;
- phone;
- active/inactive state;
- sale history.

### Classification

**REDESIGN**

The business need is valid.

The customer should become a business relationship/profile associated with a Party.

Customer history should remain.

---

## 10.3 Supplier relationship

### Legacy behavior

Suppliers have:

- name;
- image;
- phone;
- active/inactive state;
- purchase/order history.

### Classification

**REDESIGN**

The need is valid.

Supplier becomes a Party relationship/profile.

Supplier history remains important.

---

## 10.4 Worker relationship

### Legacy behavior

Workers use the same `users` table and are distinguished by `role = worker`.

### Classification

**REDESIGN**

Worker identity must become independent from authentication.

A worker may exist without an application account.

A user may have application access without being a worker.

A worker may optionally be linked to an Identity later.

---

## 10.5 Exactly one business role per person

### Legacy behavior

A `users` row has one immutable role.

A supplier cannot also be a customer.

A worker cannot simultaneously have another relationship without duplicate records.

### Classification

**REMOVE**

Real-world relationships are not mutually exclusive.

V2 must allow, conceptually:

```text
Party
├── Customer relationship
└── Supplier relationship
```

and other valid combinations where necessary.

---

# 11. Synthetic default people

Upon Organization creation, the legacy database automatically creates:

```text
Unknown Customer
Unknown Supplier
Unknown Worker
```

These rows are specially protected and used as pseudo-anonymous entities.

This pattern exists because the movement tables require a `user_id`.

---

## 11.1 Unknown Customer

### Classification

**REMOVE**

An anonymous/casual sale must be representable without a fake customer.

Conceptually:

```text
Sale.customer = optional
```

is legitimate.

No fake Party should exist solely to satisfy persistence constraints.

---

## 11.2 Unknown Supplier

### Classification

**REMOVE**

A synthetic supplier should not represent the absence of a real supplier.

If a purchasing workflow legitimately allows an unknown source, that behavior must be modeled explicitly.

The database must not invent a company/person called `Unknown Supplier`.

Normal purchasing is expected to reference a meaningful supplier.

---

## 11.3 Unknown Worker

### Classification

**REMOVE**

A worker-related financial or operational event should not be attributed to an artificial worker.

If an expense does not belong to a worker, it belongs to another financial concept rather than to `Unknown Worker`.

---

# 12. Party search and history

## 12.1 Search by name and phone

### Legacy behavior

People lists support:

- search;
- active/inactive filtering;
- role-specific views.

### Classification

**PRESERVE**

Fast search/filtering remains useful.

The underlying Party model changes, but the user-facing need remains.

---

## 12.2 Customer history

### Legacy behavior

Customer detail displays dated sale history.

### Classification

**PRESERVE**

This is an important product capability.

V2 should improve it by making history transaction-aware rather than line-aware and by eventually showing:

- sales;
- payments;
- outstanding balance;
- relevant corrections/returns.

---

## 12.3 Supplier history

### Legacy behavior

Supplier detail displays dated order/purchase history.

### Classification

**PRESERVE**

Supplier history is valuable.

V2 should make it reflect proper Purchase and Payment concepts.

---

## 12.4 Worker history

### Legacy behavior

Worker detail exposes staff-payment history.

### Classification

**PRESERVE**

Historical continuity matters.

The underlying workforce and finance model must be redesigned, but former workers must remain historically attributable.

---

# 13. Active/inactive lifecycle

## 13.1 Catalog and people deactivation

### Legacy behavior

Categories, products, and people generally use `is_active` instead of deletion.

Inactive records remain available historically.

### Classification

**PRESERVE**

This is a strong product principle.

Referenced historical entities should generally not disappear.

### Redesign direction

M0 cross-cutting policies must distinguish concepts such as:

- active/inactive;
- archived;
- ended relationship;
- deleted;
- anonymized where legally required.

A single `is_active` flag should not automatically become the universal lifecycle model.

---

# 14. Catalog

## 14.1 Categories

### Legacy behavior

Categories support:

- creation;
- editing;
- activation/deactivation;
- search;
- image;
- use as product grouping.

### Classification

**PRESERVE**

Product grouping remains useful.

Whether category membership is mandatory and how hierarchy works should be decided in the Catalog domain rather than inherited blindly.

---

## 14.2 Product catalog

### Legacy behavior

Products contain:

- name;
- category;
- image;
- cost price;
- sale price;
- stock;
- active status.

Lists support:

- text search;
- category filter;
- active/inactive filter;
- details;
- editing.

### Classification

**REDESIGN**

The catalog capability itself should be preserved.

However, several concerns currently mixed into `products` need separation:

```text
Product identity
Pricing
Cost information
Inventory
```

A Product is not equivalent to its current stock balance.

---

## 14.3 Search and filters

### Classification

**PRESERVE**

The legacy product demonstrates that quick search and filters are valuable for daily operation.

V2 should retain:

- product search;
- category filtering;
- lifecycle/status filtering;
- result counts;
- quick navigation to detail/edit operations.

The final visual design belongs to M2.

---

## 14.4 Product name uniqueness

### Legacy behavior

Products are unique by lowercase name within a store.

### Classification

**REDESIGN**

This should not automatically become a domain invariant.

Real businesses may require:

- products with similar names;
- variants;
- SKUs;
- barcodes;
- supplier-specific references.

Catalog identity must be defined intentionally in M5 rather than inherited from a convenience constraint.

---

## 14.5 Current cost and sale price

### Legacy behavior

A Product stores one current `cost_price` and one current `sale_price`.

Sales and orders copy the current price into the movement row at creation.

### Classification

**PRESERVE / REDESIGN**

Two useful principles exist:

1. the catalog can expose current/default commercial pricing;
2. transactions preserve historical monetary values.

Those principles should remain.

Pricing semantics themselves require redesign and should not be reduced to assuming that one product always has exactly one meaningful cost and one meaningful sale price forever.

---

## 14.6 Product images represented as URL strings

### Classification

**REPLACE**

Images are useful product information.

The legacy storage mechanism is not a product invariant.

Asset handling should be designed later.

---

# 15. Inventory

Inventory is one of the most consequential redesigns.

---

## 15.1 `products.stock`

### Legacy behavior

Current stock is stored directly on the Product row.

### Classification

**REDESIGN**

The system still needs an efficient current stock balance.

However, Product and Inventory must be separate concepts.

Current balance should be explainable from inventory history.

---

## 15.2 Direct stock editing

### Legacy behavior

The ordinary product edit form allows directly changing `stock`.

This changes inventory without preserving why the quantity changed.

### Classification

**REMOVE**

Routine inventory changes must not happen as unexplained edits to Product metadata.

Changes should occur through meaningful inventory operations such as:

- initial balance;
- purchase receipt;
- sale fulfillment;
- return;
- adjustment;
- loss;
- damage;
- correction.

---

## 15.3 Database stock protection

### Legacy behavior

Database triggers prevent paid sales from taking stock below zero and mutate stock when relevant records change state.

### Classification

**PRESERVE / REPLACE**

The important invariant is worth preserving:

> Invalid stock transitions should not be accepted merely because the frontend allowed them.

The specific trigger implementation should not be treated as V2 architecture.

M5 will determine where each invariant belongs across:

- domain logic;
- application transactions;
- database constraints;
- locking/concurrency controls.

---

## 15.4 Paid sale reduces stock

### Legacy behavior

Stock is reduced only when:

```text
Sale.state = paid
```

A pending sale does not affect stock.

### Classification

**REMOVE**

Payment and inventory are different dimensions.

Whether stock leaves the business should depend on the operational sale/fulfillment lifecycle, not on whether money has been received.

For example, a credit sale may legitimately:

```text
remove inventory now
remain financially unpaid
```

Legacy cannot represent that correctly.

---

## 15.5 Paid order increases stock

### Legacy behavior

Supplier merchandise increases inventory only when:

```text
Order.state = paid
```

### Classification

**REMOVE**

Receiving inventory and paying the supplier are distinct events.

It must be possible to:

```text
receive merchandise today
pay supplier next week
```

without inventory being incorrect during the intervening period.

---

## 15.6 Explainable inventory history

### Legacy behavior

Legacy knows the current stock and can infer some changes indirectly from sales/orders, but it has no canonical inventory-movement ledger.

### Classification

**REDESIGN**

V2 must make inventory movement an explicit business concept.

The product should be able to answer:

> Why is stock 14?

without reconstructing the answer from unrelated mutable tables.

---

# 16. Sales

## 16.1 Sales registration

### Legacy behavior

Users can quickly register a sale through a modal/form.

### Classification

**PRESERVE**

Fast transaction entry is core product value.

---

## 16.2 One sale row equals one product

### Legacy behavior

`sales` contains:

```text
product_id
user_id
sale_price
quantity
state
sold_at
```

Therefore:

> 2 Coca-Colas + 1 Bread + 3 Chocolates

becomes three unrelated sale records.

### Classification

**REDESIGN**

A commercial Sale should be the transaction aggregate.

Conceptually:

```text
Sale
├── SaleItem
├── SaleItem
└── SaleItem
```

The exact domain model belongs to Issue #8.

---

## 16.3 Customer required on every sale

### Legacy behavior

Every sale requires `user_id`.

Anonymous transactions use `Unknown Customer`.

### Classification

**REDESIGN**

Identified customer must be optional for ordinary casual sales.

Persistent customer identity is required only when the business needs history or an ongoing relationship.

---

## 16.4 Transaction price snapshot

### Legacy behavior

When a sale is created, the current product sale price is copied to `sales.sale_price`.

### Classification

**PRESERVE**

This is an important domain principle.

Historical transaction values must not change because the current catalog price changes.

The new aggregate will preserve pricing information at the appropriate transaction-item level.

---

## 16.5 Sale state

### Legacy behavior

A Sale can be:

```text
pending
paid
canceled
```

This single state simultaneously influences:

- financial settlement;
- stock;
- reports;
- pending balances;
- operation lifecycle.

### Classification

**REMOVE**

One state cannot correctly describe all those independent facts.

V2 must distinguish at least conceptually:

```text
Operational lifecycle
Financial settlement
Inventory effect
```

Exact state machines belong to M0 Sales/Finance work.

---

## 16.6 Partial payment

### Legacy behavior

There is no first-class partial-payment model.

A sale is effectively pending or paid as a whole.

### Classification

**REDESIGN**

V1 explicitly needs:

- immediate payment;
- deferred payment;
- partial payment;
- remaining receivable balance.

---

## 16.7 Resolving a pending sale

### Legacy behavior

When a pending sale is marked as paid, Legacy updates:

```text
sold_at = CURRENT_TIMESTAMP
```

The record's apparent sale date therefore becomes the settlement date.

### Classification

**REMOVE**

This destroys historical meaning.

A transaction's occurrence/confirmation timestamp and its payment timestamps are different facts.

Paying an old debt must not make the sale appear to have occurred today.

---

## 16.8 Sale cancellation

### Legacy behavior

A pending record can be changed to canceled.

### Classification

**REDESIGN**

Cancellation is a legitimate business concept.

However, cancellation, return, refund, voiding, and correction are not necessarily the same event.

V2 should make these distinctions intentionally.

---

# 17. Purchasing

Legacy calls this area `orders`.

The product behavior is actually closer to purchasing merchandise from suppliers.

---

## 17.1 `orders` terminology

### Classification

**REPLACE**

The name is ambiguous.

In commerce, `Order` can mean:

- customer order;
- purchase order;
- fulfillment order;
- internal request.

V1 should use explicit purchasing terminology.

---

## 17.2 One order row equals one product

### Legacy behavior

Each order contains one product, quantity, supplier, cost, state, and timestamp.

### Classification

**REDESIGN**

A Purchase should be capable of containing multiple items.

---

## 17.3 Supplier association

### Legacy behavior

Each purchase/order requires a supplier.

### Classification

**PRESERVE**

A meaningful supplier relationship is central to ordinary purchasing.

Synthetic `Unknown Supplier` is removed.

Exceptional unknown-source acquisitions, if needed, should be modeled intentionally instead of through a fake supplier.

---

## 17.4 Historical purchase cost

### Legacy behavior

The Product's current cost is copied into the order row when registered.

### Classification

**PRESERVE**

Historical acquisition cost should remain stable after current product cost information changes.

---

## 17.5 Purchase state equals settlement state

### Legacy behavior

`pending | paid | canceled` simultaneously represents purchasing and payment progress.

### Classification

**REMOVE**

At minimum these concepts must become separable:

```text
Purchase lifecycle
Receipt lifecycle
Supplier settlement
```

V1 may keep procurement simple while preserving these semantic distinctions.

---

## 17.6 Resolving a pending supplier record

### Legacy behavior

When an order is marked paid:

```text
ordered_at = CURRENT_TIMESTAMP
```

and stock increases.

### Classification

**REMOVE**

This incorrectly makes payment date:

- the purchase date;
- the inventory receipt date.

Historical purchasing and settlement facts must remain independent.

---

## 17.7 Partial supplier payments

### Legacy behavior

Not first-class.

### Classification

**REDESIGN**

V1 must support an outstanding payable that can be settled through one or more payments.

---

# 18. Workforce and staff payments

## 18.1 Worker records

### Legacy behavior

Workers are `users` with `role = worker`.

### Classification

**REDESIGN**

See the Party/Workforce model.

---

## 18.2 `staff` movement table

### Legacy behavior

`staff` records contain:

```text
worker
salary
state
created_at
```

The table is used as worker-payment history.

### Classification

**REDESIGN**

The underlying need is valid:

> Record money owed or paid to workers where relevant to operational management.

However, `salary` and payment are not automatically equivalent concepts.

V1 is not a payroll system.

M9 and Finance must define the proper boundary.

---

## 18.3 Pending worker payment

### Legacy behavior

Worker payments may be pending, paid, or canceled.

### Classification

**REDESIGN**

Outstanding worker-related obligations may be useful, but they should use finance semantics rather than inheriting the generic movement-state pattern.

---

## 18.4 Marking staff payment as paid rewrites its timestamp

### Legacy behavior

When a pending staff row becomes paid, its `created_at` may be changed to the payment time.

### Classification

**REMOVE**

Creation/obligation time and settlement time must remain independently observable.

---

# 19. Pending obligations

The Pending screen is one of the strongest product ideas in Legacy, even though its underlying model is insufficient.

---

## 19.1 Unified Pending view

### Legacy behavior

Legacy provides one screen summarizing pending:

- customer records;
- supplier records;
- worker records.

It shows:

- total amount;
- count;
- grouped records;
- quick actions.

### Classification

**PRESERVE**

The user need is excellent:

> Show me what remains unresolved without forcing me to search several modules.

This should survive conceptually.

---

## 19.2 Pending as raw movement state

### Legacy behavior

A pending customer balance is a Sale where:

```text
state = pending
```

A pending supplier balance is an Order where:

```text
state = pending
```

A pending worker balance is a Staff row where:

```text
state = pending
```

### Classification

**REDESIGN**

V2 should derive this view from actual financial obligations such as:

- receivables;
- payables;
- other supported obligations.

The Pending experience may remain unified while the underlying domains become correct.

---

## 19.3 Mark Paid action

### Legacy behavior

A pending row can be marked paid directly.

### Classification

**PRESERVE / REDESIGN**

The quick-action experience is useful.

The implementation should create or apply a Payment/Settlement rather than simply changing a generic status flag.

---

## 19.4 Cancel action

### Classification

**REDESIGN**

Users need a way to correct or invalidate obligations.

However, canceling an obligation, canceling the originating transaction, forgiving debt, recording an error, and reversing a payment are different business events.

The new domain model should represent the correct reason rather than offering one universal destructive shortcut.

---

# 20. Finance semantics

Legacy reporting exposes useful business questions but several definitions are semantically inaccurate.

---

## 20.1 Income

### Legacy behavior

The `income` report calculates essentially:

```text
paid sales
-
paid supplier orders
=
income
```

### Classification

**REPLACE**

This metric should not define V2 financial semantics.

It mixes concepts such as:

- revenue;
- purchase cost;
- payment timing;
- cash flow;
- profit.

V2 should name and calculate financial metrics according to what they actually represent.

---

## 20.2 Expenses

### Legacy behavior

Expenses are calculated from:

```text
paid supplier orders
+
paid staff records
```

### Classification

**REPLACE**

Purchasing inventory, paying an existing payable, operational expenses, and workforce-related payments are not interchangeable concepts.

The Finance domain must define them explicitly.

---

## 20.3 Paid state as the reporting source

### Legacy behavior

Most financial/activity reports filter primarily on:

```text
state = paid
```

### Classification

**REDESIGN**

Reports should derive from canonical domain facts.

Examples:

- sales reporting from commercial sales;
- cash reporting from payments/cash movements;
- receivables from obligations and settlement;
- inventory from inventory events;
- purchasing from purchases/receipts.

One status should not decide every report.

---

# 21. Reports and analytics

## 21.1 Sales statistics

### Legacy behavior

Legacy shows sales totals/counts by:

- day;
- week;
- month.

### Classification

**PRESERVE**

Useful business question.

The data source must be redesigned around proper Sale semantics.

---

## 21.2 Purchasing statistics

### Classification

**PRESERVE**

Understanding purchasing volume and supplier spending is useful.

The new report should consume Purchase/Finance facts correctly.

---

## 21.3 Workforce payment statistics

### Classification

**REDESIGN**

Operational visibility remains useful.

The specific metric depends on what V1 Workforce/Finance ultimately supports.

---

## 21.4 Growth rate

### Legacy behavior

The Activity page compares paid-sale totals between periods.

### Classification

**PRESERVE**

Period comparison is useful.

The calculation should later use canonical sales/revenue definitions.

---

## 21.5 Best and worst days

### Classification

**PRESERVE**

This is useful operational insight.

The final definition of "best" must state which metric it is based on.

---

## 21.6 Top and least sold products/categories

### Classification

**PRESERVE**

Catalog performance is useful.

The new reporting model should make the measurement explicit, for example:

- units sold;
- gross sales amount;
- margin;
- transaction frequency.

V1 can begin with a clearly defined subset.

---

## 21.7 Period navigation

### Legacy behavior

Reports provide:

- week/month selection;
- older/newer period navigation;
- day selection;
- recent/oldest sorting for histories.

### Classification

**PRESERVE**

Time-based exploration is a good UX pattern.

The exact UI belongs to M2/M11.

---

# 22. Dashboard and onboarding

## 22.1 Guided initial setup

### Legacy behavior

The dashboard encourages users to configure:

1. Categories
2. Products
3. Users

before daily operation.

### Classification

**REDESIGN**

Guided onboarding is valuable.

However:

```text
Users
```

is not the correct V2 business concept.

The future onboarding flow should be based on actual product prerequisites and may include:

- Organization setup;
- catalog;
- opening inventory;
- optional customers/suppliers/workers;
- finance settings.

Not every business should be forced through setup that is not required.

---

## 22.2 Dashboard summaries and shortcuts

### Classification

**PRESERVE**

Owners need immediate orientation and access to high-value actions.

Dashboard content should eventually reflect the new canonical domains.

---

# 23. Navigation and information architecture

## 23.1 Legacy grouping

The sidebar groups capabilities roughly as:

```text
Catalog
Register
People
Reports
Settings
```

### Classification

**REDESIGN**

The mental grouping has value but should not become the final V2 navigation automatically.

The new information architecture belongs to M2 after the domain model is clearer.

Potential V2 areas include concepts such as:

```text
Home
Sales
Purchases
Inventory
People
Finance
Assistant
Reports
Settings
```

This audit does not decide the final navigation.

---

# 24. UX behaviors worth preserving

The Legacy UI should not be copied visually, but several interaction patterns are useful.

---

## 24.1 Searchable collection screens

### Classification

**PRESERVE**

Products and people are easier to operate when lists provide search and filters close to the data.

---

## 24.2 Explicit empty states

### Classification

**PRESERVE**

Legacy frequently explains when no data exists rather than leaving blank regions.

The new design system should make empty states reusable and actionable.

---

## 24.3 Immediate operation feedback

### Legacy behavior

Frontend mutations display success/error feedback.

### Classification

**PRESERVE**

Users should receive clear outcomes for operations.

The exact toast mechanism is not important.

---

## 24.4 Detail pages with history

### Classification

**PRESERVE**

Entity detail pages are particularly valuable for:

- customers;
- suppliers;
- workers;
- products.

V2 detail experiences should become richer as the domain model improves.

---

## 24.5 Quick registration flows

### Classification

**PRESERVE**

Ordinary daily actions should not require navigating complex enterprise workflows.

---

## 24.6 Active/inactive filtering

### Classification

**PRESERVE**

Operators need to see both active records and historical/inactive records when necessary.

---

## 24.7 Legacy visual identity

### Classification

**REPLACE**

The visual system is recognizable and was useful for the original project, but V2 is a new product.

Typography, layout, navigation, visual hierarchy, accessibility, responsive behavior, brand, and component system will be deliberately rebuilt in M2.

The goal is not to reproduce the Legacy appearance.

---

# 25. Bootstrap and client cache

## 25.1 Bootstrap endpoint

### Legacy behavior

`GET /bootstrap` aggregates many services and returns initial data for:

- session;
- options;
- catalog;
- people;
- dashboard stats;
- pending records;
- income/expenses;
- movement windows;
- activity.

### Classification

**REPLACE**

The product need is valid:

> Initial application navigation should feel fast and should not require a waterfall of unnecessary requests.

However, the giant bootstrap payload creates increasing coupling between unrelated domains.

V2 should design data loading around actual screen/use-case needs.

A small application bootstrap may still exist for truly global/session information, but it must not become a second representation of the entire application state.

---

## 25.2 localStorage bootstrap cache

### Legacy behavior

Bootstrap data is cached under a key such as:

```text
manasiness_bootstrap_cache_<storeId>
```

### Classification

**REPLACE**

Local browser caching can improve UX, but this implementation creates a second manually maintained representation of server state.

V2 should use an intentional server-state/data-fetching strategy.

---

## 25.3 Manual bootstrap updaters

### Legacy behavior

After mutations, frontend code manually updates cached slices such as:

- catalog;
- people;
- finance;
- movement windows.

### Classification

**REPLACE**

This creates synchronization risk as the product grows.

V2 should favor explicit cache invalidation/update semantics owned by the data-access layer rather than dozens of ad-hoc cache mutation functions.

---

# 26. API and frontend contracts

## 26.1 Frontend mappers

### Legacy behavior

The frontend often maps backend responses into UI-specific structures.

### Classification

**PRESERVE**

Separating transport data from presentation requirements is useful.

V2 should continue preventing components from depending unnecessarily on persistence-specific shapes.

---

## 26.2 Contract drift

### Legacy evidence

Some frontend User forms include fields such as:

```text
email
status
```

while the backend User validator/model only accepts the legacy business-person fields:

```text
name
image
phone
role
```

This demonstrates how separate frontend/backend assumptions can drift.

### Classification

**REMOVE**

Silent contract drift must not become normal V2 behavior.

Shared contracts and validation should make incompatible payload expectations visible during development.

This is one reason the V2 platform will establish explicit validated contracts rather than relying on duplicated informal TypeScript shapes.

---

# 27. Backend architectural behavior

## 27.1 Controller / validator / service / repository separation

### Legacy behavior

Backend modules generally separate:

```text
route
controller
validator
service
repository
mapper
```

### Classification

**PRESERVE**

The underlying principle is good:

> Responsibilities should have discoverable ownership.

V2 should preserve clarity and separation.

### Redesign direction

The exact legacy file template should not be copied mechanically.

The modular monolith should structure complex domains according to their actual needs, potentially separating:

```text
domain
application
infrastructure
presentation
```

where that improves clarity.

Simple modules should remain simple.

---

## 27.2 Feature-oriented modules

### Classification

**PRESERVE**

Organizing code around business capabilities is better than organizing the entire product around technical file types.

---

## 27.3 Direct repository access across modules

### Legacy evidence

Some services import repositories belonging to another module directly.

For example, Product behavior can query Category persistence directly.

### Classification

**REDESIGN**

V2 modules should have explicit ownership boundaries.

Cross-domain behavior should not casually bypass the application/domain boundary of the owning module.

The exact communication pattern will be defined later.

---

# 28. Frontend architectural behavior

## 28.1 Feature-first organization

### Legacy behavior

The frontend groups capabilities into areas such as:

```text
catalog
people
movements
finance
analytics
auth
settings
```

### Classification

**PRESERVE**

This is a good discoverability principle.

The new web application should continue organizing most product behavior around cohesive features/domains rather than one global `components`, `hooks`, or `services` directory.

---

## 28.2 Shared reusable UI

### Classification

**PRESERVE**

Legacy already extracts shared:

- forms;
- collection screens;
- detail screens;
- movement tables;
- modal primitives.

The new Design System should retain the concept while replacing the current visual implementation.

---

# 29. Database behavior

## 29.1 Referential integrity

### Legacy behavior

PostgreSQL foreign keys and checks protect several relationships.

### Classification

**PRESERVE**

Critical invariants should not depend solely on frontend validation.

---

## 29.2 Tenant-qualified relationships

### Classification

**PRESERVE**

Relationships should not accidentally connect records belonging to different tenants.

How this is enforced in V2 belongs to M1/domain persistence design.

---

## 29.3 Database transactions and row locking

### Legacy behavior

Sensitive operations such as creating sales and resolving pending records use transactions and `FOR UPDATE` in relevant paths.

### Classification

**PRESERVE**

The exact implementation may change, but concurrent business mutations require transactional correctness.

---

## 29.4 Ordered SQL schema files as deployment evolution

### Legacy behavior

Database creation relies mainly on:

```text
01_extensions.sql
02_tables.sql
03_functions.sql
04_triggers.sql
05_indexes.sql
```

applied as an initial schema.

### Classification

**REPLACE**

V2 requires versioned migrations that describe database evolution over time.

The current "recreate the complete schema" approach is not sufficient for a long-lived production product.

---

# 30. Testing and quality

## 30.1 Manual QA checklist

### Legacy behavior

The repository has a detailed manual QA checklist covering:

- auth;
- bootstrap;
- categories;
- products;
- users;
- sales;
- orders;
- staff;
- pending;
- finance;
- activity;
- settings;
- database;
- build.

### Classification

**PRESERVE**

The habit of describing critical product flows explicitly is valuable.

Manual exploratory QA remains useful.

---

## 30.2 Automated tests

### Legacy behavior

The audited snapshot contains no meaningful automated unit, integration, or E2E test suite.

### Classification

**REMOVE**

A real V2 product cannot rely on manual QA for business-critical behavior such as:

- tenant isolation;
- inventory;
- receivables;
- payables;
- permissions;
- authentication;
- transaction lifecycle.

Automated testing becomes part of the engineering platform.

---

## 30.3 Validation script

### Legacy behavior

The root `validate` command runs:

- typecheck;
- backend build;
- frontend lint;
- frontend build.

### Classification

**PRESERVE**

One predictable local quality command is useful.

V2 will extend this concept to automated testing and CI.

---

# 31. CI/CD

## 31.1 GitHub Actions

### Legacy behavior

The audited repository does not contain a GitHub Actions quality pipeline.

### Classification

**REPLACE**

Manual local validation must become enforceable repository-level quality gates.

M1 will create the real workflow.

---

# 32. Local development and Docker

## 32.1 Docker-based local infrastructure

### Legacy behavior

Docker Compose can start:

- PostgreSQL;
- backend;
- frontend.

### Classification

**PRESERVE**

Reproducible local infrastructure is useful.

The new monorepo will rebuild this according to the V2 stack.

---

# 33. Documentation

## 33.1 Explicit architecture documentation

### Legacy behavior

The repository contains dedicated documentation for:

- architecture;
- backend;
- frontend;
- database;
- bootstrap;
- security;
- Docker;
- development;
- QA.

### Classification

**PRESERVE**

This is one of the better habits in Legacy.

V2 should continue treating architectural and operational knowledge as part of the product repository.

### Redesign direction

Documentation should focus more strongly on:

- product semantics;
- domain invariants;
- ADRs;
- boundaries;
- operational runbooks;

and less on repeating code structure that is already self-evident.

---

# 34. Operational Assistant / chat

The Issue #2 review scope explicitly includes legacy chat/assistant behavior.

The audited repository snapshot contains **no implemented Assistant or chat feature** in either the backend or frontend.

There is:

- no assistant module;
- no chat feature directory;
- no intent engine;
- no assistant routes;
- no AI provider integration;
- no assistant persistence;
- no conversational execution path.

Therefore, this audit must not invent legacy Assistant behavior that is not present in the source snapshot.

If an earlier Manasiness version contained an experimental chat implementation, it is outside the evidence available in this audited repository.

### Classification

**REPLACE**

There is no implementation in this snapshot worth carrying forward.

Any previous ad-hoc chatbot concept is superseded by the V1 product direction:

```text
User language
    ↓
Controlled intent recognition
    ↓
Validated entities / slots
    ↓
Authorization
    ↓
Application use case
    ↓
Result
```

The Assistant must not own business logic or access persistence directly.

The precise contract belongs to Issue #11.

---

# 35. Historical-data integrity problems that must not return

Several Legacy behaviors mutate historical meaning.

These are especially important because the UI can appear correct while business history becomes inaccurate.

---

## 35.1 Payment rewrites sale date

Legacy can change `sold_at` when a pending sale is paid.

### Decision

**REMOVE**

Payment date and sale date must remain distinct.

---

## 35.2 Payment rewrites purchase date

Legacy can change `ordered_at` when a pending supplier record becomes paid.

### Decision

**REMOVE**

Settlement must not rewrite purchasing history.

---

## 35.3 Payment rewrites worker-record date

Legacy can change the staff row timestamp when it becomes paid.

### Decision

**REMOVE**

Obligation/event date and settlement date must remain independent.

---

## 35.4 Direct stock edits erase explanation

### Decision

**REMOVE**

Inventory correction must leave an explainable record.

---

# 36. Anti-patterns that must not return

The following legacy patterns are explicitly rejected for V2.

## Identity and tenancy

- Organization containing authentication credentials.
- Business entity and login identity represented by one row.
- Assuming one human operator per business.
- Using the authenticated business row itself as the authorization model.

## People

- Customer, supplier, and worker represented as authentication-style `users`.
- Exactly one immutable business role per person/company.
- Fake `Unknown Customer`.
- Fake `Unknown Supplier`.
- Fake `Unknown Worker`.
- Requiring persistent people records solely because a foreign key is non-null.

## Sales

- One Sale row representing one product line.
- Payment state doubling as Sale lifecycle.
- Payment state controlling inventory fulfillment.
- Rewriting sale occurrence time when debt is paid.
- No first-class partial-payment model.

## Purchasing

- Ambiguous generic `orders` terminology.
- One Purchase represented as one product line.
- Payment state controlling inventory receipt.
- Rewriting purchase time when supplier debt is paid.
- Treating "received" and "paid" as the same event.

## Inventory

- `Product.stock` as the only meaningful inventory history.
- Direct stock mutation through ordinary Product editing.
- Making inventory movement depend on settlement state.
- Corrections with no explainable inventory event.

## Finance

- Generic `pending` state as the financial model.
- Treating sale operational state and settlement as one thing.
- Treating purchase operational state and settlement as one thing.
- Defining income as paid sales minus paid purchases.
- Treating inventory acquisition, cash payment, expense, and cost as interchangeable.

## History

- Mutating original timestamps to represent later events.
- Losing the distinction between occurrence, confirmation, receipt, and payment time.

## Architecture

- Allowing frontend/backend contracts to drift silently.
- Treating a large browser bootstrap cache as an alternative source of truth.
- Manually synchronizing many duplicated cached representations.
- Casual direct access to another module's persistence when an owned capability should exist.

## Quality

- Relying on manual QA for critical financial, inventory, and tenant invariants.
- Depending on developer discipline rather than CI quality gates.

---

# 37. Behaviors that should survive

Legacy also contains important product lessons that should not be lost during the rebuild.

## Product behavior

Preserve the need for:

- one operational workspace;
- fast daily data entry;
- simple product management;
- customer history;
- supplier history;
- worker history;
- visible outstanding obligations;
- inventory awareness;
- clear business summaries;
- period-based reporting;
- product/category performance insights;
- organization-level configuration.

## UX behavior

Preserve the principles of:

- search close to collections;
- filters;
- clear active/inactive state;
- entity details;
- visible history;
- quick registration;
- clear empty states;
- explicit success/error feedback;
- obvious actions for unresolved work;
- lightweight navigation for common operations.

## Engineering behavior

Preserve the principles of:

- TypeScript;
- clear responsibility boundaries;
- business-oriented feature organization;
- database integrity;
- transaction usage for critical mutations;
- tenant-qualified data access;
- secure password hashing;
- protected browser authentication;
- environment-managed secrets;
- reproducible local development;
- documentation;
- one predictable validation command.

These are principles to preserve, not code to copy.

---

# 38. Legacy-to-V2 mapping

The primary migration in mental model is:

```text
LEGACY                              V2 DIRECTION
────────────────────────────────────────────────────────────

Store                               Organization
Store credentials                   Identity
Store JWT identity                  Identity + Membership
store_id                            organization tenant boundary

users                               Party + relationships
user.role = customer                Customer relationship
user.role = supplier                Supplier relationship
user.role = worker                  Worker relationship
Unknown Customer                    no persistent customer
Unknown Supplier                    no synthetic supplier
Unknown Worker                      no synthetic worker

products.stock                      Inventory balance/projection
stock trigger                       Inventory domain invariants
direct stock edit                   Inventory adjustment

sales row                           Sale aggregate
sale.product_id                     SaleItem[]
sale.user_id                        optional customer relationship
sale.state                          operation + settlement concepts
sale paid                           Payment/settlement
pending sale                        Receivable where applicable

orders row                          Purchase aggregate
order.product_id                    PurchaseItem[]
order.user_id                       Supplier relationship
order paid                          Payment/settlement
order stock effect                  Receipt/inventory movement
pending order                       Payable where applicable

staff row                           Workforce/Finance operation
staff.salary                        explicit worker-related obligation/payment

pending screen                      Outstanding-work/obligations experience

income report                       explicitly defined business metrics
expenses report                     explicitly defined finance metrics
activity                            Reporting domain

bootstrap mega-payload              scoped data loading
localStorage server cache           explicit server-state caching

manual QA only                      automated + manual testing
local validate only                 CI quality gates
```

---

# 39. Decisions intentionally deferred

This audit identifies what Legacy should teach us.

It intentionally does not settle every replacement design.

The following are deferred to their dedicated M0/domain issues:

## Issue #3 — Ubiquitous language and domain map

Will formalize terms such as:

- Identity;
- Organization;
- Membership;
- Party;
- Customer;
- Supplier;
- Worker;
- Sale;
- Purchase;
- Payment;
- Inventory Movement.

## Issue #4 — Identity / Organization / Party boundaries

Will define their precise conceptual relationships.

## Issue #5 — Cross-cutting policies

Will define:

- time;
- identifiers;
- deletion;
- auditability;
- transactions;
- idempotency;
- ownership boundaries.

## Issue #6 — Catalog and Inventory

Will define:

- Product;
- stock balance;
- inventory movement;
- negative stock;
- adjustments;
- future locations.

## Issue #7 — Finance

Will define:

- Money;
- Payment;
- Receivable;
- Payable;
- Expense;
- cash movement;
- corrections.

## Issue #8 — Sales

Will define the Sale lifecycle and aggregate.

## Issue #9 — Purchasing

Will define Purchase, receipt, and payable lifecycle.

## Issue #10 — Workforce

Will define worker lifecycle and Finance boundary.

## Issue #11 — Operational Assistant

Will define the deterministic intent/execution contract.

---

# 40. Legacy capability classification summary

| Legacy capability | Classification | V2 direction |
|---|---|---|
| Registration | Preserve | Identity registration |
| Email verification | Preserve | Identity verification |
| Login/logout | Preserve | Identity session |
| Password recovery | Preserve | Identity lifecycle |
| Store as login principal | Remove | Identity + Organization |
| One store / one operator | Remove | Membership model |
| `store_id` tenant isolation | Preserve | Organization isolation |
| Store business profile | Redesign | Organization settings |
| Store currency | Redesign | Finance/organization money settings |
| Categories | Preserve | Catalog |
| Product management | Preserve | Catalog |
| Search/filter products | Preserve | Catalog UX |
| Product active/inactive | Preserve | Explicit lifecycle |
| Product price snapshots in movements | Preserve | Historical item values |
| Product name uniqueness | Redesign | Catalog identity rules |
| Product image URL mechanism | Replace | Asset strategy |
| `products.stock` as primary truth | Redesign | Inventory balance + movements |
| Direct stock editing | Remove | Inventory adjustment |
| DB protection against invalid stock | Preserve | Multi-layer invariants |
| Paid sale reduces stock | Remove | Operational inventory effect |
| Paid purchase increases stock | Remove | Receipt inventory effect |
| Generic `users` table | Remove | Party model |
| Customer records | Redesign | Party + customer relationship |
| Supplier records | Redesign | Party + supplier relationship |
| Worker records | Redesign | Party/workforce relationship |
| One immutable user role | Remove | Multiple relationships |
| Unknown Customer | Remove | Anonymous sale |
| Unknown Supplier | Remove | Explicit supplier/null semantics where valid |
| Unknown Worker | Remove | Explicit workforce/finance semantics |
| Customer history | Preserve | Transaction/payment history |
| Supplier history | Preserve | Purchase/payment history |
| Worker history | Preserve | Workforce/payment history |
| Sales registration | Preserve | Sale aggregate |
| One sale row per product | Redesign | Sale + items |
| Customer required on sale | Redesign | Optional customer |
| `pending/paid/canceled` Sale state | Remove | Separate lifecycles |
| Partial customer payments absent | Redesign | Payments + receivable |
| Pending sale rewrites `sold_at` | Remove | Immutable occurrence history |
| Purchasing registration | Preserve | Purchase aggregate |
| `orders` naming | Replace | Explicit Purchasing terminology |
| One order row per product | Redesign | Purchase + items |
| Supplier cost snapshot | Preserve | Historical purchase-item cost |
| Purchase payment controls stock | Remove | Receipt vs settlement |
| Partial supplier payments absent | Redesign | Payments + payable |
| Pending purchase rewrites date | Remove | Separate event dates |
| Worker payment tracking | Redesign | Workforce + Finance |
| Unified Pending view | Preserve | Unified obligations experience |
| Mark Paid shortcut | Redesign | Record/apply payment |
| Generic Cancel shortcut | Redesign | Explicit correction lifecycle |
| Income report | Replace | Explicit reporting metrics |
| Expenses report | Replace | Explicit finance metrics |
| Sales stats | Preserve | Canonical Sales reporting |
| Purchase stats | Preserve | Canonical Purchasing reporting |
| Growth comparisons | Preserve | Reporting |
| Best/worst day | Preserve | Reporting |
| Top/least sold catalog | Preserve | Reporting |
| Period navigation | Preserve | Reporting UX |
| Setup guidance | Redesign | V2 onboarding |
| Search/filter collection UX | Preserve | V2 UX |
| Empty states | Preserve | Design system |
| Success/error feedback | Preserve | Design system |
| Legacy visual design | Replace | M2 product experience |
| Feature-first frontend | Preserve | Domain/feature organization |
| Layered backend responsibilities | Preserve | Modular-monolith boundaries |
| Exact legacy file template | Replace | Domain-proportional structure |
| Database constraints/FKs | Preserve | Persistence invariants |
| Transactions/row locking | Preserve | Transactional correctness |
| Ordered initial SQL schema | Replace | Versioned migrations |
| Giant bootstrap payload | Replace | Scoped data loading |
| localStorage bootstrap cache | Replace | Server-state strategy |
| Manual cache updaters | Replace | Explicit cache lifecycle |
| Frontend response mappers | Preserve | Contract/presentation boundary |
| Silent API contract drift | Remove | Shared validated contracts |
| Docker local environment | Preserve | Rebuild for monorepo |
| Manual QA checklist | Preserve | Manual + automated QA |
| No automated test suite | Remove | Unit/integration/E2E |
| No CI quality gates | Replace | GitHub Actions |
| Legacy Assistant implementation | Replace | No implementation exists in audited snapshot; V2 deterministic assistant |

---

# 41. Final migration principles

The rebuild should follow these rules.

## Do not port code because it already exists

Legacy code must earn its conceptual place in V2 through the new product/domain model.

---

## Preserve business knowledge, not accidental schema

A useful workflow can survive while every table behind it changes.

---

## Preserve simplicity at the interface

The domain model can become more correct without making ordinary work more complicated for the user.

---

## Never solve a modeling problem by inventing fake real-world entities

If reality says there is no identified customer, the model must allow no identified customer.

---

## Separate facts that happen at different times

Examples:

```text
Sale occurred
Inventory left
Payment received
```

and:

```text
Purchase agreed
Merchandise received
Supplier paid
```

These may happen together, but they are not the same fact.

---

## Historical events should not move through time

Later actions must not rewrite when earlier business events occurred.

---

## Important balances must be explainable

This applies especially to:

- inventory;
- receivables;
- payables;
- money movement.

---

## One business rule, one authoritative implementation

Web, Assistant, reports, and future integrations must not invent independent versions of the same domain rule.

---

## Professional does not mean maximum complexity

V2 should introduce structure where the domain needs it.

It should not introduce distributed systems, enterprise workflows, or abstractions merely to appear sophisticated.

---

# 42. Audit conclusion

Manasiness Legacy successfully proved the core idea:

> A small business benefits from having catalog, people, commercial movements, pending obligations, and reporting connected in one operational product.

That idea should be preserved.

What should not be preserved is the assumption that these capabilities can remain modeled as:

```text
Store
+
Role-based Users
+
Single-product Movements
+
paid/pending/canceled
+
mutable stock
```

The rebuild should keep the speed and simplicity of Legacy while replacing its accidental coupling with explicit domain concepts.

The purpose of V2 is therefore not to make Legacy larger.

It is to make the same product idea structurally capable of becoming a trustworthy real product.