# Manasiness — Catalog and Inventory Domain Foundation

> **Status:** Active  
> **Milestone:** M0 — Product & Domain Foundation  
> **Scope:** Manasiness V1  
> **Purpose:** Define the business meaning, ownership boundaries, invariants, and collaboration rules for Catalog and Inventory before persistence and implementation are designed.

---

# 1. Purpose

Catalog and Inventory are closely related but solve different business problems.

Catalog answers:

> What does this Organization recognize commercially?

Inventory answers:

> How much physical stock does the Organization currently hold, and why?

Manasiness Legacy collapsed these responsibilities by storing stock directly on Product:

```text
Product
├── name
├── sale price
├── cost price
└── stock
```

That model provides a convenient current number but becomes fragile when the product needs:

- Sales;
- Purchases;
- returns;
- losses;
- corrections;
- receiving before Payment;
- credit Sales;
- auditability;
- concurrency;
- future inventory locations.

Manasiness V1 therefore separates Product identity from inventory state.

This document defines that separation.

It intentionally does not define:

- database tables;
- Drizzle schemas;
- SQL constraints;
- API endpoints;
- NestJS modules;
- concurrency primitives;
- transaction implementation;
- UI screens.

Those concerns belong to M1 and M5.

---

# 2. Foundational model

The conceptual relationship is:

```text
Organization
│
├── Catalog
│   └── Product
│
└── Inventory
    ├── Stock Balance
    └── Inventory Movement
            │
            └── references Product
```

Catalog owns:

```text
What the Product is
```

Inventory owns:

```text
How much of the Product exists
and
Why that quantity changed
```

---

# 3. Catalog responsibility

Catalog owns the commercial identity and descriptive information of Products recognized by an Organization.

Catalog answers questions such as:

- What is this Product?
- What is it called?
- Is it currently active?
- How is it categorized?
- Is it stock-tracked?
- What current/default commercial metadata applies?
- Can it participate in a Sale or Purchase?

Catalog does not answer:

- How much stock exists?
- Why stock changed?
- Whether a stock mutation is valid?
- What inventory movement occurred?

Those belong to Inventory.

---

# 4. Inventory responsibility

Inventory owns the Organization's physical quantity state for stock-tracked Products.

Inventory answers:

- How much is physically on hand?
- Why did quantity increase?
- Why did quantity decrease?
- Is a requested stock change valid?
- Which business operation caused the change?
- What correction was made?
- What was the stock history?

Inventory does not own:

- Product identity;
- Product name;
- current sale pricing;
- Sale lifecycle;
- Purchase lifecycle;
- Payment;
- Receivable;
- Payable.

---

# 5. Product

A **Product** represents a good or service that an Organization recognizes commercially.

Product identity remains stable even when mutable catalog attributes change.

Examples of mutable catalog information may include:

```text
name
description
category
image
current/default sale price
current/default cost metadata
active state
inventory-tracking behavior
```

Changing those values does not create a new historical Product unless the Catalog domain explicitly determines that the business is dealing with a genuinely different offering.

---

# 6. Product is Organization-scoped

A Product belongs to one Organization.

Conceptually:

```text
Organization A
└── Product: Coca-Cola 500 ml

Organization B
└── Product: Coca-Cola 500 ml
```

These are separate Catalog records even if they describe the same real-world commercial product.

One Organization must not depend on another Organization's Product record.

---

# 7. Product identity is not Product name

Product identity must not depend on mutable descriptive information.

Renaming:

```text
Coca Cola Personal
```

to:

```text
Coca-Cola 500 ml
```

must not cause historical Sales, Purchases, or Inventory Movements to lose their relationship to the Product.

The canonical Product identifier remains stable.

---

# 8. Product identity is not current price

Current/default price is Catalog metadata.

Historical commercial values belong to the transaction in which they were established.

For example:

```text
January
Product current price = S/ 5

Sale Item
unit price = S/ 5
```

then later:

```text
March
Product current price = S/ 6
```

The January Sale Item remains:

```text
unit price = S/ 5
```

Catalog changes must not rewrite historical transaction values.

---

# 9. Product identity is not current cost

The same rule applies to purchasing.

Changing current/default cost metadata does not change the historical acquisition cost of previous Purchase Items.

Current Catalog data describes the present.

Transaction snapshots describe the past.

---

# 10. Product and stock are separate concepts

This is a foundational invariant:

```text
Product ≠ Stock Balance
```

Product describes the commercial offering.

Stock Balance describes the current physical quantity.

Therefore Product editing must not function as ordinary inventory mutation.

This Legacy behavior is explicitly rejected:

```text
Edit Product
└── stock = 42
```

without a recorded inventory reason.

---

# 11. Stock-tracked and non-stocked Products

Manasiness V1 must support commercial offerings that do not participate in physical inventory.

Conceptually, a Product may be:

```text
stock-tracked
```

or:

```text
non-stocked
```

This is a domain behavior distinction.

The exact implementation field or enum is deferred.

---

# 12. Stock-tracked Product

A stock-tracked Product participates in Inventory.

Examples:

- bottled drink;
- packaged food;
- replacement part;
- physical merchandise.

For these Products, quantity changes must occur through Inventory-owned behavior.

---

# 13. Non-stocked Product

A non-stocked Product does not maintain a physical Stock Balance.

Examples may include:

- service;
- installation work;
- delivery fee;
- non-inventory commercial charge;
- another offering that the business does not wish to track physically.

Selling a non-stocked Product does not create an Inventory Movement.

---

# 14. Services

V1 does not need a separate full Service domain merely to support services commercially.

A service may initially be represented conceptually as a Product that does not participate in Inventory.

Future requirements may justify richer service-specific behavior.

That evolution must not require pretending that every commercial Product has stock.

---

# 15. Changing inventory-tracking behavior

Changing an existing Product from stock-tracked to non-stocked, or vice versa, can affect historical and current inventory meaning.

Therefore this must not be treated as an unrestricted ordinary metadata edit.

M5 must define safe transition rules.

The V1 principle is:

> A Product's inventory behavior cannot be changed in a way that silently invalidates existing Inventory history.

---

# 16. Stock

**Stock** is the quantity of a stock-tracked Product physically or operationally held by an Organization.

In V1, when the product uses the unqualified term:

```text
stock
```

it means:

> current on-hand quantity.

Future concepts such as reservations may introduce more precise quantities.

---

# 17. On-hand Stock Balance

The canonical V1 Stock Balance represents **on-hand quantity**.

Conceptually:

```text
Stock Balance
=
current physical quantity recorded by Inventory
```

Example:

```text
Coca-Cola 500 ml
On-hand Stock = 24
```

This value is a current projection.

It is not by itself the historical explanation.

---

# 18. Available stock

V1 does not initially introduce a separate reservation system.

Therefore concepts such as:

```text
reserved stock
available stock
allocated stock
```

are deliberately deferred.

If future Sales/order workflows introduce reservation, then:

```text
available stock
```

may differ from:

```text
on-hand stock
```

The V1 model must not prevent that evolution.

---

# 19. Inventory Movement

An **Inventory Movement** is the canonical historical fact explaining a quantity change for a stock-tracked Product.

Conceptually:

```text
Inventory Movement
├── Product
├── direction / quantity effect
├── business reason
├── occurrence time
├── Organization context
├── Actor/source context where relevant
└── originating business operation where relevant
```

This is conceptual information, not a database schema.

---

# 20. Movement direction

A Movement changes quantity positively or negatively.

Conceptually:

```text
+10
```

means stock entered.

```text
-3
```

means stock left.

The exact representation may use signed quantity or another explicit model.

M0 does not decide the persistence encoding.

---

# 21. Every stock change requires a reason

This invariant is mandatory:

> Every meaningful Inventory quantity change must have an explainable business reason.

A balance must not change because a generic piece of code assigned a different number.

---

# 22. Minimum movement reasons

V1 must conceptually distinguish at least:

```text
Opening Balance
Purchase Receipt
Sale Fulfillment
Customer Return
Supplier Return
Adjustment
Loss / Damage
Correction / Reversal
```

The exact enum or taxonomy is deferred to M5.

These reasons describe business meaning, not UI labels.

---

# 23. Opening Balance

When an Organization begins using Inventory for an existing business, it may already possess merchandise.

The starting quantity should enter Inventory through an explicit **Opening Balance** operation.

Example:

```text
Opening Balance
Coca-Cola 500 ml
+50
```

This is preferable to silently setting:

```text
stock = 50
```

because the resulting balance remains explainable from the beginning.

---

# 24. Purchase Receipt

A **Purchase Receipt** Inventory effect represents merchandise physically received from a supplier.

Example:

```text
Purchase #P-100
received:
+24 Coca-Cola
```

Inventory changes when the goods are received according to Purchasing rules.

It does **not** wait for supplier Payment.

---

# 25. Purchase Receipt is not Payment

This distinction is mandatory:

```text
Purchase Receipt
≠
Supplier Payment
```

For example:

```text
September 1
24 units received

September 15
supplier paid
```

Inventory increased on September 1.

Payment on September 15 belongs to Finance and does not add the goods again.

---

# 26. Sale Fulfillment

A **Sale Fulfillment** Inventory effect represents stock leaving because the Organization provided stock-tracked goods as part of a Sale.

The detailed point in the Sale lifecycle that constitutes fulfillment belongs to Issue #8.

The important Inventory rule is:

> Payment status does not determine whether physical stock left.

---

# 27. Credit Sale example

This must be valid:

```text
Sale
├── goods delivered
├── Inventory: -2
└── Finance: customer still owes money
```

Legacy could not represent this cleanly because `paid` controlled stock.

V1 explicitly separates the two.

---

# 28. Customer Return

A Customer Return may cause previously sold stock to re-enter Inventory when the physical Product is actually accepted back into stock.

Conceptually:

```text
Customer Return
+1 Product
```

The Sales/refund semantics and Inventory consequence are related but separately owned.

A financial refund does not automatically prove that stock returned physically.

---

# 29. Supplier Return

A Supplier Return represents goods leaving Inventory because they are physically returned to the supplier.

Conceptually:

```text
Supplier Return
-5 Product
```

Finance and Purchasing may have related consequences.

Inventory owns the quantity effect.

---

# 30. Loss and damage

Inventory needs an explicit way to represent physical loss that is not a Sale.

Examples:

- broken merchandise;
- expired merchandise where later supported;
- theft;
- missing unit;
- unusable item.

Conceptually:

```text
Loss / Damage
-2 Product
Reason: damaged during storage
```

This history must not be disguised as a Sale or generic Product edit.

---

# 31. Inventory Adjustment

An **Inventory Adjustment** is a deliberate operation used when observed physical inventory differs from recorded inventory for a legitimate operational reason.

Example:

```text
Recorded balance: 20
Physical count: 18

Adjustment:
-2
```

The Adjustment must preserve an explanation.

---

# 32. Adjustment is not silent correction

An Adjustment does not rewrite the previous movement history.

It adds a new fact explaining why the current balance changed.

Conceptually:

```text
Previous history
    +
Adjustment -2
    =
new balance
```

not:

```text
edit old history until total equals 18
```

---

# 33. Correction

A **Correction** repairs an erroneous Inventory fact while preserving traceability.

If an earlier Movement was incorrect, the preferred conceptual approach is a compensating Movement rather than destructive modification.

Example:

Incorrect:

```text
Purchase Receipt +100
```

should have been:

```text
Purchase Receipt +10
```

Rather than silently rewriting history, Inventory may record:

```text
Correction -90
references original movement
```

The exact correction UX and persistence model belong to M5.

---

# 34. Reversal

A **Reversal** is a specific form of compensating operation that neutralizes a previous Movement.

Example:

```text
Original Movement
+20

Reversal
-20
```

The original remains visible.

The reversal explains why its effect was neutralized.

---

# 35. Destructive movement editing is prohibited

Once an Inventory Movement has become an authoritative historical fact, its quantity, reason, source, and occurrence semantics must not be silently modified merely to obtain a desired balance.

This is a core auditability invariant.

---

# 36. Movement lifecycle

The conceptual lifecycle is:

```text
Inventory change requested
        ↓
Validate Product / Organization / quantity / reason
        ↓
Validate Inventory invariants
        ↓
Commit Inventory Movement
        ↓
Update / derive Stock Balance
        ↓
Movement becomes historical fact
```

A committed Movement should not later be treated as a mutable draft.

Mistakes are corrected through explicit compensating behavior.

---

# 37. Current balance and movement history

Conceptually, current Stock Balance is the projection of Inventory Movement history.

For example:

```text
Opening Balance        +20
Purchase Receipt       +10
Sale Fulfillment        -4
Damage                  -1
Customer Return         +1
───────────────────────────
Current Stock Balance   26
```

This relationship must remain true regardless of implementation optimization.

---

# 38. Derived versus materialized balance

V1 conceptually uses:

```text
Movement history
+
current Stock Balance projection
```

The implementation may choose to materialize/store the current balance for efficient access.

That is expected and acceptable.

The architectural invariant is:

> A materialized balance must remain consistent with authoritative Inventory history.

M5 decides the implementation.

---

# 39. Movement history is authoritative for explanation

If the system displays:

```text
Stock = 26
```

it should be possible to explain the meaningful operations that produced 26.

The balance is optimized current state.

The Movement history provides traceability.

---

# 40. Inventory transaction integrity

Creating a Movement and changing its corresponding Stock Balance must behave as one consistent Inventory operation.

The system must not successfully create:

```text
Movement -2
```

while leaving the balance unchanged.

Likewise it must not update the balance without its corresponding historical fact.

The transaction mechanism is deferred to M5/M1.

The invariant is not.

---

# 41. Negative stock policy

For **stock-tracked Products**, Manasiness V1 will **not allow committed on-hand Stock Balance to become negative** through ordinary business operations.

This policy is not Organization-configurable in V1.

Example:

```text
Current stock = 2

Requested Sale effect = -3
```

must not produce:

```text
Stock = -1
```

---

# 42. Why V1 forbids negative stock

Allowing negative stock would weaken one of Manasiness's central promises:

> inventory should be trustworthy and explainable.

Negative stock often means at least one of these is missing:

- Purchase Receipt;
- Opening Balance;
- Inventory Adjustment;
- Return;
- previous correction.

Instead of hiding the inconsistency, V1 should surface it.

---

# 43. Correct response to incorrect recorded stock

If a business physically has merchandise that Manasiness does not know about, the operator should correct Inventory explicitly.

Example:

```text
System stock = 2
Physical stock = 10
```

The solution is not:

```text
allow Sale to create stock = -1
```

The solution is an appropriate:

```text
Inventory Adjustment +8
```

with reason.

Then the Sale can proceed.

---

# 44. Negative-stock policy and user experience

Forbidding negative stock must not produce an unhelpful dead end.

Future UI should explain:

- current quantity;
- requested quantity;
- why the operation cannot proceed;
- how authorized users can correct inventory if the recorded balance is wrong.

This preserves correctness without forcing users to understand internal architecture.

---

# 45. Future negative-stock policy

Some real businesses intentionally permit temporary negative stock.

Manasiness may support such a mode later if real customer evidence justifies it.

That capability would need explicit semantics for:

- reports;
- replenishment;
- corrections;
- valuation;
- concurrency;
- availability.

It is deliberately excluded from V1 rather than implemented as an unchecked boolean setting.

---

# 46. Quantity validity

An individual business operation should express a positive magnitude.

The Movement determines whether the stock effect increases or decreases.

For example:

```text
Sale quantity = 3
Inventory effect = -3
```

rather than treating a negative Sale quantity as ordinary input.

Detailed quantity/measurement rules belong to M5.

---

# 47. Fractional quantities

Some future Products may be measured in non-integer units:

- kilograms;
- meters;
- liters.

V1 Catalog/Inventory implementation should avoid an architectural assumption that all possible Products will forever require integer quantities.

However, the exact unit-of-measure model is intentionally deferred to M5/product discovery.

This issue does not introduce a full units system.

---

# 48. Product deactivation

Deactivating a Product prevents or restricts its use in new operations according to Catalog rules.

It must not:

- delete Inventory Movements;
- remove historical Sale Items;
- remove historical Purchase Items;
- make old reports uninterpretable.

---

# 49. Product deactivation with remaining stock

A Product may still have Stock Balance when it is being retired.

Therefore deactivation should not silently force inventory to zero.

M5 must define the exact workflow.

Possible legitimate choices may include:

- prevent deactivation until stock is resolved;
- allow deactivation but preserve remaining Inventory for controlled disposition.

This decision is intentionally deferred to M5 because it affects UX and lifecycle policy.

The fixed invariant is:

> Product deactivation must never invent or destroy Inventory.

---

# 50. Product deletion

A Product referenced by consequential historical records should not normally be hard-deleted.

The cross-cutting lifecycle policy applies.

Historical references must remain valid.

---

# 51. Catalog historical snapshots

Transactions own the historical commercial information required to understand themselves.

For example, a Sale Item may preserve:

```text
Product reference
Product description snapshot
unit price
quantity
```

where appropriate.

A Purchase Item may preserve:

```text
Product reference
Product description snapshot
unit cost
quantity
```

Exact snapshot fields belong to Sales/Purchasing issues.

---

# 52. Inventory and Product rename

An Inventory Movement continues to reference the same Product identity after a Product is renamed.

Historical displays may use:

- current Product name;
- source-transaction snapshot;
- Movement-specific historical display information;

depending on later UX requirements.

The canonical Product relationship remains stable.

---

# 53. Inventory ownership

Inventory is Organization-scoped.

Conceptually:

```text
Organization
└── Inventory
    ├── Product A balance
    ├── Product B balance
    └── Movement history
```

Stock from two Organizations must never be combined implicitly.

---

# 54. V1 inventory scope

V1 models one Organization-wide inventory scope from the user's perspective.

Conceptually:

```text
Organization
└── Inventory
```

The initial product does not require multiple warehouses or store locations.

---

# 55. Future inventory locations

The domain must preserve an evolution path toward:

```text
Organization
└── Inventory
    ├── Location A
    ├── Location B
    └── Location C
```

where each location may have its own balance and Movement history.

V1 does **not** implement this.

---

# 56. Avoiding future location dead ends

V1 should avoid domain assumptions such as:

> A Product intrinsically owns one stock integer forever.

Instead, the conceptual rule is:

> Stock belongs to Inventory within an inventory scope.

For V1, that scope is effectively the Organization.

Future versions may refine that scope to a Location.

---

# 57. Future transfers

A future multi-location model may introduce Transfers such as:

```text
Location A -5
Location B +5
```

A Transfer should preserve both sides of the movement.

Transfers are explicitly post-V1.

No Transfer functionality is required now.

---

# 58. Lots, serials, and expiry dates

V1 does not require:

- lot tracking;
- serial numbers;
- expiration batches;
- FEFO/FIFO picking;
- warehouse bins.

Those concepts may later refine Inventory identity/scope.

They must not be implemented speculatively in M5.

---

# 59. Inventory valuation

Inventory quantity and financial inventory valuation are different concerns.

V1 Inventory owns:

```text
quantity
movement
balance
```

It does not automatically own:

```text
accounting inventory valuation
COGS accounting
weighted-average accounting
FIFO accounting
```

Historical Purchase costs remain relevant to Purchasing/Finance/Reporting, but V1 does not become an accounting inventory engine.

---

# 60. Catalog current cost

Catalog may expose current/default cost metadata useful for operational workflows.

That value must not be treated as a canonical accounting valuation of existing Inventory.

For example:

```text
Product current default cost = S/ 4
```

does not mean:

```text
all 100 units currently on hand are financially valued at exactly S/ 4
```

unless a future finance/valuation domain explicitly establishes that policy.

---

# 61. Sales collaboration

Sales owns:

- Sale;
- Sale Items;
- Sale lifecycle;
- commercial facts.

Inventory owns:

- Stock Balance;
- Movement;
- stock validity.

Conceptually:

```text
Sales
│
│ requests fulfillment effect
▼
Inventory
│
├── validate stock
├── create Movement
└── update/project Balance
```

Sales must not directly mutate Inventory persistence.

---

# 62. Sales failure behavior

If Inventory rejects a required fulfillment effect, the surrounding business operation must not silently leave Sales in a state claiming successful fulfillment.

Example:

```text
Stock = 1
Sale requires 2
```

If negative stock is forbidden:

```text
Inventory rejects
```

The application use case must preserve transaction-level consistency.

Exact orchestration belongs to M7/M5.

---

# 63. Purchasing collaboration

Purchasing owns:

- Purchase;
- Purchase Items;
- commercial acquisition lifecycle.

Inventory owns physical receipt effects.

Conceptually:

```text
Purchasing
│
│ goods received
▼
Inventory
│
├── create Receipt Movement
└── update/project Balance
```

---

# 64. Purchasing is not allowed to mutate stock directly

Incorrect:

```text
PurchasingRepository
UPDATE product.stock
```

Correct conceptual direction:

```text
Receive Purchase
      │
      ▼
Inventory capability
      │
      ▼
Inventory-owned Movement
```

---

# 65. Finance does not control Inventory

Payment status must not create, remove, or reverse Inventory merely because money changed state.

This is invalid:

```text
Payment becomes paid
→ increase stock
```

and:

```text
Sale becomes paid
→ decrease stock
```

Inventory consequences follow physical/operational business events.

Finance consequences follow monetary events.

---

# 66. Returns may span several domains

A customer return may involve:

```text
Sales
Inventory
Finance
```

A supplier return may involve:

```text
Purchasing
Inventory
Finance
```

Each domain owns its part.

One domain's event must not be used as a shortcut to rewrite another domain's history.

---

# 67. Inventory Adjustment authorization

Inventory Adjustment is consequential because it changes trusted stock without an ordinary Sale/Purchase source.

Therefore it should eventually require an explicit authorization capability.

The exact permission belongs to M3/M5.

This issue establishes that Adjustment should not be universally available simply because a user can edit Products.

---

# 68. Adjustment auditability

Material Inventory Adjustments should preserve:

- Actor;
- Organization;
- Product;
- quantity effect;
- occurrence/recording time;
- reason.

The exact audit representation belongs to M5 and the cross-cutting audit infrastructure.

---

# 69. Source attribution

When a Movement is caused by another domain, Inventory should preserve enough conceptual linkage to understand the origin.

Examples:

```text
Purchase Receipt Movement
source → Purchase / receipt operation

Sale Fulfillment Movement
source → Sale / fulfillment operation

Customer Return Movement
source → return operation
```

The exact reference model is implementation-specific.

---

# 70. Idempotency of source-triggered Inventory effects

Retrying a business command must not accidentally apply the same stock effect twice.

For example:

```text
Receive Purchase
```

retried because of a timeout must not result in:

```text
+20
+20
```

for the same logical receipt.

The cross-cutting idempotency policy therefore applies to consequential Inventory commands.

Exact implementation belongs to M5.

---

# 71. Concurrency

Stock validity is concurrency-sensitive.

Example:

```text
Stock = 1

Sale A requests -1
Sale B requests -1
```

Both must not independently observe `1` and successfully produce:

```text
Stock = -1
```

under the V1 negative-stock policy.

M5 must implement a concurrency-safe strategy.

This issue intentionally does not select:

- row locks;
- optimistic concurrency;
- serializable transactions;
- atomic SQL updates.

---

# 72. Inventory Movement immutability

After becoming authoritative, a Movement should be considered historically immutable in its consequential business meaning.

This includes:

- Product identity;
- quantity effect;
- movement reason;
- source relationship;
- occurrence semantics.

Corrections add new history.

They do not rewrite the old fact to hide it.

---

# 73. Descriptive corrections

Minor non-consequential metadata, such as a typo in an explanatory note, may eventually have different correction rules.

M5 may distinguish descriptive annotation from consequential Movement semantics.

The important principle is:

> Editing explanatory metadata must never silently change stock.

---

# 74. Balance reconciliation

A system may eventually verify that a stored/materialized balance matches the Movement history.

Conceptually:

```text
expected balance from movements
vs
materialized balance
```

should agree.

Automated reconciliation tooling is not a V1 domain requirement, but the model should make such validation possible.

---

# 75. Physical count

A future stock-count workflow may compare:

```text
recorded balance
```

with:

```text
observed physical count
```

Any resulting difference should become an explicit Adjustment rather than destructive history rewriting.

Full cycle-count/stocktake workflow is not required in V1.

---

# 76. Zero stock

Zero is a valid Stock Balance.

A stock-tracked Product may exist with:

```text
Stock Balance = 0
```

without being deactivated or deleted.

Catalog availability and physical availability are related but distinct concepts.

---

# 77. No Inventory record for non-stocked Product

Conceptually, a non-stocked Product does not require a Stock Balance or Inventory Movement history merely to exist commercially.

The implementation may choose internal representations as needed.

The business semantics remain:

```text
non-stocked Product
→ Inventory quantity not applicable
```

rather than:

```text
stock = 0 forever
```

which could misleadingly imply that the Product is out of stock.

---

# 78. Inventory status and Product status

These concepts must not be conflated.

For example:

```text
Product active
Stock = 0
```

is valid.

```text
Product inactive
Stock > 0
```

may temporarily be valid depending on retirement workflow.

```text
Product active
Non-stocked
```

is also valid.

---

# 79. Catalog categories

Category remains a Catalog concern.

Changing Category must not affect:

- Stock Balance;
- Inventory Movement history;
- historical Sale/Purchase values.

Category helps classification, navigation, and reporting.

It does not define Inventory ownership.

---

# 80. Pricing does not trigger Inventory

Changing:

```text
current sale price
```

or:

```text
current/default cost
```

does not create an Inventory Movement.

Price changes are Catalog/commercial metadata changes.

Inventory changes require quantity reasons.

---

# 81. Catalog correction versus Inventory correction

If Product name is wrong:

```text
Catalog correction
```

If quantity is wrong:

```text
Inventory Adjustment / Correction
```

These should not be implemented as one generic "edit Product" operation.

---

# 82. Inventory source-of-truth model

The conceptual source-of-truth relationship is:

```text
Catalog Product
        │
        ▼
Inventory Movement History
        │
        ▼
Current Stock Balance
```

Catalog defines what is being tracked.

Movement history explains change.

Balance answers current quantity efficiently.

---

# 83. Example — initial setup

Business begins using Manasiness.

Physical count:

```text
Coca-Cola = 20
Water = 15
```

Correct conceptual initialization:

```text
Coca-Cola
Opening Balance +20

Water
Opening Balance +15
```

Balances become:

```text
Coca-Cola = 20
Water = 15
```

---

# 84. Example — purchase on credit

Current:

```text
Coca-Cola = 20
```

Supplier delivers:

```text
+24
```

Result:

```text
Inventory = 44
Finance = supplier Payable remains outstanding
```

Paying the supplier later does not affect stock.

---

# 85. Example — cash Sale

Current:

```text
Coca-Cola = 44
```

Sale fulfills:

```text
-2
```

Result:

```text
Inventory = 42
```

Customer Payment belongs to Finance.

---

# 86. Example — credit Sale

Current:

```text
Coca-Cola = 42
```

Goods leave:

```text
-3
```

Result:

```text
Inventory = 39

Finance:
Receivable > 0
```

Stock does not wait for Payment.

---

# 87. Example — damage

Current:

```text
Inventory = 39
```

Two bottles break.

Correct:

```text
Damage -2
```

Result:

```text
Inventory = 37
```

No fake Sale is created.

---

# 88. Example — physical discrepancy

Recorded:

```text
37
```

Physical count:

```text
36
```

Authorized user determines one unit is missing.

Correct:

```text
Adjustment -1
Reason: physical count discrepancy
```

Result:

```text
Inventory = 36
```

History remains explainable.

---

# 89. Example — erroneous receipt

Recorded incorrectly:

```text
Purchase Receipt +50
```

Real receipt:

```text
+5
```

Correct conceptual resolution:

```text
Original +50
Correction -45
```

rather than deleting or changing the historical `+50` without trace.

---

# 90. Example — insufficient stock

Current:

```text
2
```

Requested fulfillment:

```text
3
```

Inventory rejects the ordinary operation because:

```text
2 - 3 < 0
```

If physical quantity is really greater than 2, Inventory must first be corrected through an authorized explicit operation.

---

# 91. Example — non-stocked service

Catalog:

```text
Installation Service
inventory behavior = non-stocked
```

Sale:

```text
1 × Installation Service
```

Inventory:

```text
no Stock Balance mutation
no Inventory Movement
```

The Sale is still commercially valid.

---

# 92. Core Catalog invariants

Catalog must preserve these principles:

1. Product identity is stable.
2. Product belongs to one Organization.
3. Product metadata is separate from Inventory quantity.
4. Current pricing does not rewrite historical transaction values.
5. Deactivation does not erase historical references.
6. Non-stocked commercial offerings are legitimate.
7. Inventory-tracking behavior cannot change in a way that invalidates history.

---

# 93. Core Inventory invariants

Inventory must preserve these principles:

1. Inventory belongs to one Organization.
2. Only stock-tracked Products participate in quantity tracking.
3. Every meaningful quantity change has an explicit reason.
4. Every committed quantity effect produces historical Movement.
5. Current Stock Balance must remain consistent with Inventory history.
6. Ordinary Product editing cannot mutate stock.
7. Sales and Purchasing request Inventory effects but do not own Inventory invariants.
8. Finance settlement does not determine stock movement.
9. Committed on-hand stock may not become negative in V1.
10. Consequential historical Movements are not silently rewritten.
11. Corrections preserve the original fact and add compensating history.
12. Product deactivation does not destroy Inventory history.
13. Source-triggered Inventory effects must be retry-safe.
14. Concurrent operations must preserve stock invariants.

---

# 94. Catalog and Inventory ownership matrix

| Concern | Owner |
|---|---|
| Product identity | Catalog |
| Product name/description | Catalog |
| Category | Catalog |
| active/inactive Product lifecycle | Catalog |
| current/default sale price | Catalog |
| current/default cost metadata | Catalog |
| stock-tracking behavior | Catalog, constrained by Inventory history |
| Stock Balance | Inventory |
| Inventory Movement | Inventory |
| Inventory Adjustment | Inventory |
| negative-stock invariant | Inventory |
| inventory correction/reversal | Inventory |
| Product historical sale price | Sales |
| Product historical purchase cost | Purchasing |
| Payment | Finance |
| inventory valuation/accounting | Not part of V1 Inventory |

---

# 95. Integration contract with Sales

At the conceptual level:

```text
Sales owns:
Sale + Sale Item + commercial lifecycle

Inventory owns:
fulfillment quantity effect
```

Sales provides Inventory enough information to request the relevant stock effect.

Inventory validates and records the Movement.

Sales must not bypass Inventory.

---

# 96. Integration contract with Purchasing

At the conceptual level:

```text
Purchasing owns:
Purchase + Purchase Item + acquisition lifecycle

Inventory owns:
receipt quantity effect
```

Purchasing tells Inventory that goods were actually received.

Inventory records the physical quantity consequence.

Payable/Payment belongs to Finance.

---

# 97. Integration with Reporting

Reporting may consume:

- Stock Balances;
- Inventory Movements;
- low-stock projections;
- movement history;
- Catalog metadata.

Reporting does not define stock truth or mutate Inventory.

---

# 98. Integration with Operational Assistant

The Assistant may ask:

```text
"¿Cuántas Coca-Colas quedan?"
```

Conceptually:

```text
Assistant
→ resolve Product within Organization
→ call Inventory read capability
→ return Stock Balance
```

For:

```text
"Ajusta Coca-Cola a 20"
```

the Assistant must not directly overwrite a number.

A supported future Intent would have to:

- resolve Product;
- determine current quantity;
- derive an explicit Adjustment;
- require appropriate authorization;
- request confirmation if policy requires it;
- execute the Inventory application capability.

---

# 99. Deliberately deferred to M5

M5 will decide implementation details including:

- persistence model;
- exact Product structure;
- exact Movement taxonomy;
- quantity data type;
- unit-of-measure support;
- balance materialization;
- concurrency mechanism;
- inventory transaction implementation;
- adjustment permissions;
- product-deactivation workflow with remaining stock;
- implementation of source references;
- idempotency persistence;
- API contracts;
- database constraints;
- indexes.

---

# 100. Deliberately post-V1

The following capabilities are not required for V1:

- multiple warehouses;
- multiple stores/locations as inventory scopes;
- stock transfers;
- reservations;
- allocated stock;
- lot tracking;
- serial-number tracking;
- expiry tracking;
- warehouse bins;
- pick/pack workflows;
- advanced replenishment;
- inventory forecasting;
- accounting inventory valuation;
- FIFO/LIFO/weighted-average accounting;
- cycle-count management;
- barcode infrastructure beyond ordinary Catalog needs.

The V1 model should allow future evolution without implementing these capabilities speculatively.

---

# 101. Non-goals

This document does not:

- define tables;
- define columns;
- choose SQL constraints;
- choose transaction isolation;
- implement Catalog;
- implement Inventory;
- build warehouse management;
- define Sales lifecycle states;
- define Purchase lifecycle states;
- define Finance semantics;
- define accounting valuation.

---

# 102. Decision summary

Manasiness V1 adopts the following Catalog and Inventory model:

```text
Catalog
└── Product
    ├── stable commercial identity
    ├── descriptive metadata
    ├── current/default commercial metadata
    └── stock-tracked or non-stocked behavior


Inventory
├── Stock Balance
│   └── current on-hand quantity
│
└── Inventory Movement
    └── explainable history of every meaningful quantity change
```

Quantity effects may originate from:

```text
Opening Balance
Purchase Receipt
Sale Fulfillment
Customer Return
Supplier Return
Adjustment
Loss / Damage
Correction / Reversal
```

The fundamental rules are:

```text
Product ≠ Inventory

Stock Balance ≠ historical explanation

Payment ≠ physical inventory movement

Sales/Purchasing may cause stock effects
but Inventory owns stock rules

No ordinary negative stock in V1

Corrections add history
rather than erase history

V1 has one Organization-wide inventory scope
while preserving a path to future locations
```

The central invariant is:

> **If Manasiness says a stock-tracked Product has a quantity of N, the system should be able to explain the meaningful business operations that produced N.**