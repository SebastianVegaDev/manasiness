# Manasiness — Sales and Receivables Domain Foundation

> **Status:** Active  
> **Milestone:** M0 — Product & Domain Foundation  
> **Scope:** Manasiness V1  
> **Purpose:** Define the Sale aggregate, operational lifecycle, customer behavior, historical commercial facts, Inventory collaboration, Finance collaboration, receivable behavior, and post-confirmation correction semantics.

---

# 1. Purpose

Sales is one of the central operational domains in Manasiness.

A Sale must represent the commercial transaction that actually occurred.

Manasiness Legacy modeled each sold Product as an independent Sale row:

```text
Sale
├── Product
├── Customer
├── Quantity
├── Price
└── pending | paid | cancelled
```

That representation creates several problems:

- one real purchase containing several Products becomes several unrelated Sales;
- every Sale requires a Customer record;
- Payment state controls operational meaning;
- Payment state controls Inventory;
- partial Payment cannot be represented naturally;
- historical timestamps can be rewritten when Payment happens;
- returns and corrections become destructive status changes;
- customer debt becomes synonymous with generic pending Sales.

Manasiness V1 replaces that model with a real commercial aggregate.

Conceptually:

```text
Sale
├── Customer Relationship?   ← optional
├── Sale Item
├── Sale Item
├── Sale Item
├── historical totals
└── operational lifecycle
```

Inventory and Finance collaborate with Sales but retain ownership of their own rules.

This document defines those boundaries.

It intentionally does not define:

- database tables;
- API endpoints;
- Drizzle schemas;
- NestJS modules;
- POS screens;
- receipt/PDF layouts;
- tax documents;
- advanced promotions;
- SQL transaction implementation.

Those decisions belong to later milestones.

---

# 2. Sales responsibility

Sales owns the commercial truth of what the Organization sold.

Sales answers:

- What transaction occurred?
- Which items were sold?
- In what quantities?
- At what historical prices?
- Which discounts applied?
- What was the authoritative transaction total?
- Was an identified Customer involved?
- When did the Sale become authoritative?
- Was the Sale later cancelled, returned, or corrected?

Sales does not own:

- Customer identity;
- Product identity;
- Stock Balance;
- Inventory Movement rules;
- Payment;
- Receivable settlement;
- Financial Account balances.

---

# 3. Sale

A **Sale** represents one commercial transaction between the Organization and a buyer.

A Sale contains one or more Sale Items.

Example:

```text
Sale #1042
├── 2 × Coca-Cola
├── 1 × Bread
└── 3 × Chocolate
```

This is **one Sale**, not six Sales and not three unrelated Sale records.

---

# 4. Sale aggregate boundary

Conceptually:

```text
Sale
│
├── Organization
├── Customer Relationship?   ← optional
├── Sale Item[]
├── commercial totals
├── operational lifecycle
├── occurrence timestamps
└── historical commercial context
```

Sale Items belong to the Sale.

A Sale Item is not an independent commercial transaction.

---

# 5. Organization ownership

Every Sale belongs to exactly one Organization.

Every Product, Customer Relationship, Inventory effect, and financial consequence involved in the Sale must be valid within the same Organization context.

Cross-tenant references are invalid.

---

# 6. Draft Sale

A **Draft Sale** is a working transaction that has not yet become an authoritative business fact.

Draft may be used while an operator:

- adds Products;
- changes quantities;
- selects a Customer;
- adjusts permitted pricing;
- reviews totals;
- selects settlement behavior.

A Draft does not yet represent a completed commercial Sale.

---

# 7. Draft mutability

Draft Sales may be freely edited according to application rules.

For example:

```text
Draft
├── add item
├── remove item
├── change quantity
├── change Customer
└── change permitted price
```

Draft state exists precisely so the operator can prepare a transaction before committing business history.

---

# 8. Draft side effects

A Draft Sale must not create authoritative:

- Inventory Movements;
- Receivables;
- Payments;
- Customer debt;
- historical Sales reporting.

In V1 there is no stock reservation system.

Therefore Draft does not reserve Inventory.

---

# 9. Draft deletion

A Draft that has never become authoritative may be discarded.

Because it has produced no consequential business effects, hard deletion of abandoned Drafts may be acceptable according to the cross-cutting lifecycle policy.

Implementation details belong to M7.

---

# 10. Sale confirmation

**Confirmation** is the boundary at which a Draft becomes an authoritative Sale.

Conceptually:

```text
Draft
   │
   ▼
Confirm Sale
   │
   ▼
Confirmed Sale
```

Confirmation means:

> The Organization asserts that this commercial transaction actually occurred.

---

# 11. Confirmation requirements

Before confirmation, the Sale must satisfy its business invariants.

At minimum:

- it belongs to one Organization;
- it contains at least one Sale Item;
- every quantity is valid and positive;
- every Product is valid for the Organization;
- every authoritative item price is determined;
- discounts are valid;
- totals are internally consistent;
- Customer requirements are satisfied;
- required Inventory effects are valid;
- settlement instructions are financially valid.

---

# 12. Confirmation is consequential

Confirmation may coordinate several domains:

```text
Sales
├── confirms commercial transaction
│
├── Inventory
│   └── records Sale Fulfillment movements
│
└── Finance
    ├── records immediate Payment(s)
    └── creates Receivable when required
```

These consequences must remain transactionally consistent.

---

# 13. Confirmation and atomicity

If a required consequence cannot succeed, the Sale must not appear successfully confirmed while another required domain remains inconsistent.

Example:

```text
Stock = 1
Sale requires 2
```

Inventory rejects fulfillment.

The system must not leave:

```text
Confirmed Sale
+
no valid Inventory effect
```

for an ordinary V1 stock-tracked Sale.

The concrete transaction mechanism belongs to M7/M5/M6.

---

# 14. Confirmed Sale

A **Confirmed Sale** is an authoritative historical commercial fact.

After confirmation:

- the transaction occurred;
- historical item values are fixed;
- Inventory consequences have been established where required;
- financial settlement/obligation has been established;
- the Sale participates in reporting.

---

# 15. V1 does not require a separate `Completed` state

V1 does not introduce a separate generic `Completed` Sale status.

For ordinary Manasiness V1 operation:

```text
Confirmed
```

means the commercial Sale has occurred.

This avoids creating another generic state that would overlap with:

- Inventory fulfillment;
- Payment settlement;
- Receivable settlement.

Those have their own domain semantics.

---

# 16. Why `Completed` is not another V1 status

A Sale can be:

```text
commercially confirmed
financially unpaid
```

or:

```text
commercially confirmed
financially partially settled
```

or:

```text
commercially confirmed
financially settled
```

Therefore a generic `completed` status would immediately raise ambiguity:

> Commercially complete or financially complete?

V1 uses explicit concepts instead.

---

# 17. Future Sales Order / fulfillment workflows

A future product may need:

```text
Sales Order
→ reservation
→ shipment
→ fulfillment
→ Sale
```

for businesses that sell before physically delivering goods.

That is intentionally outside the initial V1 model.

V1 confirmation represents the commercial/fulfillment point for ordinary direct Sales.

---

# 18. Operational lifecycle

The primary V1 Sale lifecycle is:

```text
Draft
  │
  ▼
Confirmed
```

From Confirmed state, history is not reopened for ordinary editing.

Later business changes use explicit operations such as:

```text
Cancellation / Void
Return
Correction
```

instead of mutating the Confirmed Sale as if it were still a Draft.

---

# 19. Anonymous Sale

A Sale may have no persistent Customer Relationship.

Example:

```text
Sale
├── Customer: absent
├── 2 × Water
└── Total S/ 6
```

This is a valid first-class Sale.

---

# 20. No fake Customer

Manasiness must not create:

```text
Unknown Customer
```

or an equivalent synthetic Party simply because a Sale has no identified buyer.

The correct model is:

```text
Sale.customer = absent
```

at the conceptual level.

---

# 21. Casual buyer

An ordinary walk-in customer does not need:

- Party;
- Customer Relationship;
- Identity;
- account;
- contact information.

The Organization should be able to sell quickly without CRM overhead.

---

# 22. Identified Customer Sale

A Sale may reference an existing Customer Relationship when the Organization needs continuity.

Examples include:

- recurring customer;
- customer purchasing on credit;
- customer needing identifiable transaction history;
- customer with Receivables;
- explicitly tracked commercial relationship.

---

# 23. Customer ownership

Parties owns:

```text
Party
Customer Relationship
```

Sales only references the Customer Relationship.

Sales must not recreate Customer identity inside the Sales domain.

---

# 24. Customer association becomes historical

Once a Sale is confirmed, its Customer association becomes part of the historical transaction context.

Changing the Party's current:

- phone;
- email;
- name;
- relationship status;

must not detach the Sale from that Customer history.

---

# 25. Customer Relationship deactivation

A Customer Relationship may later become inactive.

Historical Sales remain attributable.

Example:

```text
2026
Customer active
Sale #100

2027
Customer Relationship ended
```

Sale #100 remains part of that Party's historical commercial record.

---

# 26. Anonymous Sale cannot create customer debt

A Receivable requires an attributable debtor.

Therefore an anonymous Sale cannot remain financially unpaid in V1.

An anonymous Sale must be fully settled as part of confirmation.

This is an important invariant.

---

# 27. Why anonymous credit is prohibited

This would be invalid:

```text
Anonymous Sale
Total = S/ 100
Paid = S/ 20
Outstanding = S/ 80
Customer = nobody identifiable
```

Manasiness would have no legitimate Party against whom the S/80 Receivable exists.

If credit is required, the buyer must first become an identified Customer Relationship.

---

# 28. Sale Item

A **Sale Item** represents one commercial line within a Sale.

Conceptually it preserves:

```text
Sale Item
├── Product reference
├── historical description
├── quantity
├── authoritative unit price
├── discount information
└── authoritative line total
```

This is conceptual information, not a persistence schema.

---

# 29. Sale Item quantity

Quantity must represent a valid positive commercial quantity.

Example:

```text
quantity = 3
```

not:

```text
quantity = -3
```

Returns use explicit return semantics rather than negative Sale Items inside the original Sale.

---

# 30. Sale Item Product reference

A Sale Item references the canonical Catalog Product.

That allows the Organization to understand what current Product identity the historical line corresponds to.

---

# 31. Historical description snapshot

A Sale Item should preserve enough Product description from confirmation time for the transaction to remain understandable later.

Example:

```text
Product current name:
Coca-Cola Zero 500 ml
```

may later become:

```text
Coca-Cola Zero Personal
```

The historical Sale should still be understandable as originally transacted.

The exact snapshot fields belong to M7.

---

# 32. Historical unit price

The authoritative Sale Item unit price is fixed at confirmation.

Example:

```text
Sale Item
unit price = S/ 5
```

Later:

```text
Catalog current price = S/ 6
```

does not change the historical Sale.

---

# 33. Catalog price versus transaction price

Catalog owns the current/default selling price.

Sales owns the actual historical price agreed for the transaction.

Conceptually:

```text
Catalog
default price = S/ 6
       │
       ▼
Sale
actual unit price = S/ 5.50
```

if the operator was legitimately allowed to sell at that price.

---

# 34. Price override

V1 may allow an authorized operator to override the current/default Catalog price.

Price override is a Sales capability.

It must eventually be subject to appropriate authorization and validation.

The exact permission belongs to M3/M7.

---

# 35. Discount

A **Discount** reduces the commercial amount charged for a Sale Item.

Discount is part of Sales commercial semantics.

It is not a Finance Payment concept.

---

# 36. V1 discount model

At the canonical transaction level, V1 should preserve discount effects at **Sale Item level**.

Conceptually:

```text
Sale Item
quantity         2
unit price       S/ 10
gross amount     S/ 20
discount         S/ 2
line total       S/ 18
```

This makes historical item value explicit.

---

# 37. Whole-Sale discount UX

A future UI may allow:

> Apply S/10 discount to the whole Sale.

Before confirmation, that discount should be converted into deterministic item-level commercial values according to a defined M7 allocation rule.

The confirmed transaction should remain item-accountable.

---

# 38. Why item-level discount history matters

If a customer later returns one item, Manasiness must know what that item actually contributed to the Sale.

A single opaque aggregate discount would make returns and reporting more ambiguous.

---

# 39. Promotions engine

V1 does not require:

- coupons;
- promotion campaigns;
- buy-one-get-one rules;
- customer segment pricing;
- dynamic pricing;
- loyalty points;
- complex price lists.

These may evolve later.

---

# 40. Sale subtotal

Conceptually, Sale subtotal represents the sum of item amounts before applicable transaction discounts according to Sales rules.

Exact calculation and rounding order belong to M7.

All calculations must follow Finance Money precision policy.

---

# 41. Sale discount total

Sale discount total is the sum of authoritative discount effects represented by Sale Items.

It is historical once the Sale is confirmed.

---

# 42. Sale total

The **Sale Total** is the authoritative Money amount the buyer owes for the confirmed commercial transaction before settlement.

Conceptually:

```text
Sale Total
=
sum(authoritative Sale Item totals)
```

according to defined rounding rules.

---

# 43. Total is not amount paid

This distinction is fundamental:

```text
Sale Total
≠
Amount Paid
```

Example:

```text
Sale Total = S/ 100
Payment = S/ 30
Outstanding = S/ 70
```

The Sale remains a S/100 Sale.

---

# 44. Historical totals

Once confirmed:

- subtotal;
- discount values;
- line totals;
- Sale Total;

are historical commercial facts.

They must not be recalculated from current Catalog prices.

---

# 45. Rounding

Sales follows the canonical Finance Money policy.

The exact M7 calculation order must define where rounding occurs.

It must be deterministic and tested.

A confirmed Sale must not contain totals whose individual components disagree.

---

# 46. Tax semantics

M0 does not introduce a statutory tax engine.

Tax invoices, IGV compliance, jurisdiction-specific fiscal documents, and tax calculation rules require separate product/legal scope.

Sales V1 commercial totals must not accidentally pretend to implement statutory accounting.

---

# 47. Inventory integration

Sales does not own stock.

For stock-tracked Sale Items:

```text
Confirm Sale
      │
      ▼
Inventory
      │
      └── Sale Fulfillment Movement
```

Inventory validates quantity invariants and records the physical effect.

---

# 48. Inventory effect timing

For V1 direct Sales, the Inventory effect occurs as part of Sale confirmation.

Confirmation means the stock-tracked goods are considered sold/fulfilled from the Organization's current Inventory scope.

---

# 49. Non-stocked items

A Sale may contain non-stocked Products.

Example:

```text
Sale
├── 1 × Replacement Part      → stock-tracked
└── 1 × Installation Service  → non-stocked
```

Inventory changes only for the Replacement Part.

The complete Sale remains one aggregate.

---

# 50. Mixed Sale

Mixed stocked/non-stocked Sales are valid.

Inventory participation is determined per Sale Item according to Product inventory behavior.

---

# 51. Insufficient stock

Under the V1 Inventory policy, confirmation cannot cause negative on-hand stock.

Example:

```text
Stock = 2
Sale quantity = 3
```

The ordinary confirmation must fail unless Inventory is legitimately corrected first.

---

# 52. Sales must not edit stock

Incorrect:

```text
Confirm Sale
→ UPDATE product.stock
```

Conceptually correct:

```text
Confirm Sale
→ Inventory capability
→ Inventory validates
→ Sale Fulfillment Movement
```

Inventory remains the owner.

---

# 53. Payment integration

Sales does not own Payment.

Sales establishes the commercial amount.

Finance owns settlement.

Conceptually:

```text
Sale Total
      │
      ▼
Settlement decision
      │
      ├── Payment
      └── Receivable
```

---

# 54. Settlement at confirmation

At confirmation, the Sale's full commercial amount must be financially accounted for through supported settlement behavior.

The supported V1 possibilities are:

```text
Immediate full settlement
Partial settlement
Deferred settlement
```

---

# 55. Immediate full settlement

Example:

```text
Sale Total = S/ 100
Immediate Payment = S/ 100
Outstanding = S/ 0
```

Finance records the Payment and corresponding financial consequences.

The Sale itself remains a S/100 Sale.

---

# 56. Partial settlement

For an identified Customer:

```text
Sale Total = S/ 100
Immediate Payment = S/ 30
Remaining = S/ 70
```

Finance records:

```text
Incoming Payment = S/ 30
Receivable = S/ 70
```

at the conceptual V1 level.

---

# 57. Deferred settlement

For an identified Customer:

```text
Sale Total = S/ 100
Immediate Payment = S/ 0
Receivable = S/ 100
```

The Sale is commercially confirmed.

The customer owes the Organization S/100.

---

# 58. Credit Sale

A **Credit Sale** is a confirmed Sale whose full amount is not immediately settled.

Credit therefore describes financial settlement behavior.

It does not represent:

- another Sale type hierarchy;
- another Customer entity;
- another Product type.

---

# 59. Customer required for credit

Any Sale leaving an outstanding balance requires an identified Customer Relationship.

Therefore:

```text
Anonymous + outstanding debt
```

is invalid.

---

# 60. Receivable creation

At the V1 product level, Finance creates a Receivable when a confirmed identified-customer Sale leaves an outstanding amount.

Example:

```text
Sale Total = S/ 100
Immediate Payments = S/ 40
Outstanding = S/ 60

Receivable = S/ 60
```

---

# 61. Fully settled Sale

If confirmation fully settles the Sale:

```text
Sale Total = S/ 100
Immediate Payment = S/ 100
```

there is no open customer debt.

Finance may implement internal settlement records according to M6 architecture, but the product does not need to expose an open Receivable.

---

# 62. Receivable ownership

Finance owns:

- Receivable;
- Outstanding Balance;
- Payments;
- Payment Allocation;
- settlement status;
- reversals;
- financial adjustments.

Sales must not maintain a second mutable `customerDebt` value.

---

# 63. Receivable settlement

Later Payments settle the Finance-owned Receivable.

They do not update the Sale's historical commercial totals.

Example:

```text
Sale Total = S/ 100
Receivable created = S/ 70

Later Payment = S/ 20
Outstanding = S/ 50
```

Sale Total remains:

```text
S/ 100
```

---

# 64. Payment dates do not rewrite Sale dates

Example:

```text
Sale confirmed:
September 1

Payment:
September 10
```

The Sale remains a September 1 Sale.

September 10 is a Payment date.

This explicitly rejects the Legacy behavior of replacing Sale occurrence time when a pending Sale becomes paid.

---

# 65. Settlement status is not Sale status

A confirmed Sale may have Finance reporting:

```text
Unpaid
Partially Settled
Settled
```

without changing its commercial lifecycle from Confirmed.

---

# 66. Customer commercial history

For an identified Customer, history should distinguish:

```text
Sales history
```

from:

```text
financial debt/payment history
```

The detail experience may display them together.

Their domain ownership remains separate.

---

# 67. Customer purchase history

An identified Customer's commercial history includes confirmed Sales attributed to their Customer Relationship.

Historical Sales remain attributable even if the relationship later becomes inactive.

---

# 68. Customer debt history

Customer debt derives from Finance-owned outstanding Receivables.

Conceptually:

```text
Customer debt
=
sum(outstanding Receivables)
```

It is not:

```text
sum(Sales where status = pending)
```

---

# 69. Confirmed Sale immutability

After confirmation, consequential Sale facts must not be directly rewritten.

This includes:

- Customer association;
- Sale Items;
- quantities;
- authoritative prices;
- discounts;
- Sale Total;
- occurrence semantics.

Post-confirmation mistakes require explicit correction behavior.

---

# 70. Why confirmed Sales are locked

A confirmed Sale may already have caused:

- Inventory Movements;
- Payments;
- Receivables;
- customer history;
- reporting.

Silently modifying the Sale would make those facts inconsistent.

---

# 71. Correction principle

If a confirmed Sale is wrong, Manasiness should preserve:

```text
original fact
+
explicit corrective operation
```

rather than pretending the original transaction was always different.

---

# 72. Cancellation

**Sale Cancellation** represents explicit invalidation of the whole commercial transaction according to Sales rules.

Cancellation is not:

- deleting the Sale;
- reopening it as Draft;
- silently editing all items to zero.

The original Sale remains historically visible.

---

# 73. Draft cancellation versus confirmed cancellation

A Draft can simply be abandoned because it is not authoritative.

A Confirmed Sale requires consequential cancellation behavior.

These are different operations.

---

# 74. Confirmed Sale cancellation

Cancelling a confirmed Sale may require coordination with:

```text
Inventory
Finance
```

For example:

```text
Confirmed Sale
├── Inventory -2
└── Payment +S/ 20
```

A valid cancellation cannot merely set:

```text
sale.status = cancelled
```

while leaving those effects untouched.

---

# 75. Cancellation compensation

Depending on the business context, confirmed cancellation may require:

```text
Sales
→ mark historical cancellation

Inventory
→ compensating return/reversal where goods return

Finance
→ reverse Receivable / Payment effects as appropriate
```

Exact supported M7 workflows will determine the permitted conditions.

---

# 76. Cancellation is not Return

Cancellation invalidates the transaction as a whole according to its rules.

A **Return** represents merchandise or services being returned/reversed after a valid Sale.

They are different concepts.

---

# 77. Return

A **Return** is a post-Sale commercial operation that references one or more original Sale Items.

Example:

```text
Original Sale
├── 2 × Coca-Cola
└── 1 × Bread

Return
└── 1 × Coca-Cola
```

The original Sale remains unchanged.

---

# 78. Partial Return

A Return may involve only part of a Sale.

Therefore returns must not require cancelling the whole Sale.

---

# 79. Return quantity invariant

A Return cannot legitimately return more quantity than the original Sale Item's remaining returnable quantity.

Conceptually:

```text
Sold quantity
-
previous valid returns
=
maximum currently returnable
```

The precise implementation belongs to M7.

---

# 80. Return and Inventory

If physical stock is actually accepted back:

```text
Return
→ Inventory Customer Return Movement
```

Inventory owns whether/how quantity re-enters stock.

For example, damaged returned goods might not be returned to sellable on-hand stock under a future richer inventory model.

---

# 81. Return and Finance

A Return may require Finance consequences such as:

- Refund;
- reduction of outstanding Receivable;
- other supported adjustment.

Sales establishes the commercial Return.

Finance establishes the monetary consequence.

---

# 82. Return does not automatically mean Refund

The commercial and financial facts remain distinct.

Example:

```text
Item returned
```

does not by itself state:

```text
Cash refunded
```

Finance must represent what actually happened financially.

---

# 83. Refund

A **Refund** is Finance-owned money returned after a valid previous financial event.

Sales provides the commercial context.

Finance owns the actual monetary operation.

---

# 84. Refund is not cancellation

A Sale may remain historically valid while part of its value is later refunded because of a Return or other supported policy.

The original Sale is not rewritten.

---

# 85. Correction

A **Sale Correction** addresses an error in a confirmed Sale.

Examples could include:

- wrong Customer;
- wrong Product;
- wrong quantity;
- wrong historical price.

A confirmed Sale should not simply be edited.

---

# 86. Correction strategy

Depending on the error, M7 may implement correction through:

- explicit reversal/void and replacement;
- Return plus corrected Sale;
- another traceable compensating operation.

The precise UX is deferred.

The invariant is already fixed:

> Consequential confirmed history is not silently rewritten.

---

# 87. Incorrect Customer

If a Sale was confirmed against the wrong Customer, Sales must not simply overwrite `customerId`.

That could corrupt:

- customer purchase history;
- Receivables;
- Payment attribution.

The correction must be explicit and preserve history.

---

# 88. Incorrect price

If a confirmed Sale used the wrong price, changing the current Catalog price cannot fix the Sale.

Likewise, the historical Sale Item price should not simply be overwritten.

An explicit corrective workflow is required.

---

# 89. Cancellation after settlement

A Sale that has already received Payment is more consequential than an unpaid Sale.

Cancellation may require:

- Refund;
- Payment reversal where the original Payment was actually erroneous;
- Receivable correction;
- Inventory compensation.

M7/M6 will define allowed operations.

---

# 90. Cancellation after partial settlement

A partially settled Sale requires the same principle.

The cancellation workflow must reconcile:

```text
commercial transaction
Inventory effects
already-received money
remaining Receivable
```

as one coherent business operation.

---

# 91. Full Return

A fully returned Sale does not require deleting or rewriting the original Sale.

History may conceptually show:

```text
Original Sale
+
full Return
+
Inventory consequences
+
financial consequences
```

This preserves what actually happened.

---

# 92. Idempotency

Confirming a Sale is consequential.

Retrying one logical confirmation must not produce:

- duplicate Sale;
- duplicate Inventory Movement;
- duplicate Payment;
- duplicate Receivable.

M7 must implement idempotent command behavior according to the cross-cutting policy.

---

# 93. Concurrent stock mutation

Sale confirmation must respect Inventory concurrency guarantees.

Example:

```text
Stock = 1

Sale A requests 1
Sale B requests 1
```

Both cannot successfully fulfill the same single unit.

Inventory owns the concurrency invariant.

---

# 94. Concurrent Payment/Receivable mutation

Where Sale confirmation includes financial settlement, Finance must also preserve its concurrency and idempotency invariants.

Sales should not attempt to solve Finance consistency independently.

---

# 95. Sale occurrence time

A confirmed Sale has a business occurrence/confirmation time representing when the commercial transaction became authoritative.

That time is independent from:

- record creation time;
- later Payment time;
- later Return time;
- later Refund time.

---

# 96. Backdated Sales

Whether authorized operators may create a Sale effective in the past is an implementation/product decision deferred to M7.

If supported, business-effective time and record-creation time must remain distinct according to cross-cutting time policy.

---

# 97. Sale business reference

A future Sale may expose a human-readable Organization-scoped reference such as:

```text
SALE-001042
```

This is distinct from its canonical opaque internal identifier.

The numbering policy belongs to M7.

---

# 98. Sale deletion

A confirmed Sale should not normally be hard-deleted.

It is consequential historical business data.

Drafts that never became authoritative may follow different retention rules.

---

# 99. Sale reporting

Reporting may derive metrics such as:

- number of Sales;
- Sales amount;
- units sold;
- Products sold;
- Sales by Customer;
- Sales by period.

Reporting does not own Sale validity or commercial totals.

---

# 100. Sales versus cash reporting

A Sale belongs to the period in which the Sale occurred.

A Payment belongs to the period in which money moved.

Example:

```text
September 1
Sale = S/ 100

September 10
Payment = S/ 100
```

September 1 Sales reporting:

```text
+S/ 100 Sales
```

September 10 cash reporting:

```text
+S/ 100 cash received
```

Those are intentionally different reports.

---

# 101. Sales and Revenue terminology

Sales reporting can safely describe:

```text
Sales amount
```

based on confirmed commercial Sales.

If Manasiness uses the term `Revenue`, Reporting/Finance must define it precisely.

Sales must not assume:

```text
cash received = Sale revenue period
```

---

# 102. Sales and Parties boundary

Parties owns:

```text
Party
Customer Relationship
```

Sales owns:

```text
Sale
Sale Item
```

Sales references Customer.

It does not maintain Customer identity independently.

---

# 103. Sales and Catalog boundary

Catalog owns:

```text
Product
current/default price metadata
```

Sales owns:

```text
historical transaction Product reference
historical description snapshot
actual unit price
discount
quantity
line total
```

---

# 104. Sales and Inventory boundary

Sales determines:

> Which stock-tracked goods were sold in the confirmed transaction?

Inventory determines:

> Whether the quantity change is valid and how it is recorded.

---

# 105. Sales and Finance boundary

Sales determines:

```text
commercial amount
Customer context
commercial occurrence
```

Finance determines:

```text
Payment
Receivable
Outstanding Balance
Refund
financial correction
Cash Movement
```

---

# 106. Sales and Assistant boundary

The Operational Assistant may eventually handle:

```text
"Registra 2 Coca-Colas a Juan."
```

Conceptually:

```text
Assistant
├── resolve Product
├── resolve Customer
├── clarify ambiguity
├── collect settlement information
├── authorize
├── confirm if required
└── call Sales application capability
```

The Assistant does not:

- insert Sale rows directly;
- reduce stock directly;
- edit debt directly.

---

# 107. Assistant and anonymous Sale

A request such as:

```text
"Registra 2 aguas en efectivo."
```

may result in an anonymous fully settled Sale if all required information is unambiguous and the Intent supports it.

No fake Customer is created.

---

# 108. Assistant and credit Sale

A request such as:

```text
"Véndele a crédito 2 Coca-Colas a Juan."
```

requires:

- identified Customer Relationship;
- unambiguous Juan resolution;
- authorization;
- valid stock;
- commercial totals;
- Receivable behavior.

The Assistant routes through normal Sales/Finance capabilities.

---

# 109. Sale authorization

Future authorization should distinguish consequential capabilities such as:

- create/confirm Sale;
- override price;
- apply discount;
- cancel Sale;
- process Return;
- perform Sale correction.

The exact permission matrix belongs to M3/M7.

---

# 110. Auditability

Consequential Sales operations should be attributable.

Examples include:

```text
Sale confirmed
Sale cancelled
Return recorded
Sale corrected
price overridden
material discount applied
```

Exact Audit Event representation belongs to cross-cutting architecture/M7.

---

# 111. Example — anonymous cash Sale

```text
Sale
├── Customer: absent
├── 2 × Water @ S/ 2
└── Total S/ 4
```

Confirmation:

```text
Sales
→ Confirm Sale

Inventory
→ Water -2

Finance
→ Incoming Payment S/ 4
→ Cash Movement S/ 4
```

Outstanding:

```text
S/ 0
```

No Customer Party is created.

---

# 112. Example — identified fully paid Sale

```text
Customer: Juan
Sale Total = S/ 100
Immediate Payment = S/ 100
```

Result:

```text
Sales
→ Confirmed Sale attributed to Juan

Inventory
→ required fulfillment Movements

Finance
→ Payment S/ 100
→ no open customer debt
```

---

# 113. Example — identified partial-payment Sale

```text
Customer: Juan
Sale Total = S/ 100
Payment now = S/ 40
```

Result:

```text
Sales
→ Confirmed S/ 100 Sale

Inventory
→ fulfillment effects

Finance
├── Incoming Payment S/ 40
└── Receivable S/ 60
```

Later:

```text
Payment S/ 20
Outstanding = S/ 40
```

Sale Total remains S/100.

---

# 114. Example — full credit Sale

```text
Customer: Juan
Sale Total = S/ 100
Payment now = S/ 0
```

Result:

```text
Confirmed Sale = S/ 100
Receivable = S/ 100
```

Inventory has already followed fulfillment semantics.

---

# 115. Example — invalid anonymous credit Sale

Attempt:

```text
Customer: absent
Total = S/ 100
Payment = S/ 20
Remaining = S/ 80
```

Result:

```text
reject confirmation
```

The operator must identify/create the Customer Relationship if credit is required.

---

# 116. Example — Catalog price changes later

At confirmation:

```text
Product current price = S/ 5
Sale Item price = S/ 5
```

Later:

```text
Product current price = S/ 6
```

Historical Sale:

```text
S/ 5
```

remains unchanged.

---

# 117. Example — price override

Catalog:

```text
default price = S/ 10
```

Authorized Sale:

```text
actual unit price = S/ 9
```

Confirmed history preserves:

```text
S/ 9
```

and should preserve relevant override/discount context according to M7 policy.

---

# 118. Example — mixed Sale

```text
Sale
├── 1 × Replacement Part   S/ 50
└── 1 × Installation       S/ 30
```

Result:

```text
Sale Total = S/ 80

Inventory
→ Replacement Part -1
→ Installation: no movement

Finance
→ settlement of S/ 80
```

---

# 119. Example — Return

Original:

```text
Sale
2 × Product A
Total = S/ 20
```

Later:

```text
Return
1 × Product A
```

Potential coordinated result:

```text
Sales
→ Return recorded

Inventory
→ Customer Return +1

Finance
→ Refund or Receivable adjustment as actually applicable
```

Original Sale remains intact.

---

# 120. Example — incorrect confirmed Sale

Operator confirms:

```text
3 × Product A
```

but real transaction was:

```text
2 × Product A
```

Incorrect:

```text
edit quantity 3 → 2
```

Correct direction:

```text
preserve original confirmed Sale
+
explicit corrective flow
```

The exact M7 correction mechanism will determine whether that uses partial Return, reversal/reissue, or another controlled operation.

---

# 121. Core Sale invariants

1. Every Sale belongs to one Organization.
2. One Sale contains one or more Sale Items.
3. Sale Item quantity is positive.
4. Anonymous Sales are valid.
5. Anonymous Sales cannot leave a Receivable in V1.
6. Identified credit Sales require a Customer Relationship.
7. Catalog current prices do not rewrite historical Sale prices.
8. Confirmed Sale totals are historical facts.
9. Draft Sales create no authoritative Inventory or Finance effects.
10. Confirmation is the authoritative commercial boundary.
11. Confirmed Sales are not silently edited.
12. Stock-tracked Sale Items use Inventory-owned fulfillment behavior.
13. Payment does not determine whether Inventory leaves.
14. Settlement is Finance-owned.
15. Partial settlement does not change Sale Total.
16. Payment dates do not rewrite Sale occurrence dates.
17. Returns do not rewrite original Sale Items.
18. Refunds do not automatically imply Inventory return.
19. Retry must not duplicate consequential Sale effects.
20. Historical Customer attribution remains stable.

---

# 122. Sale Item invariants

1. Every authoritative Sale Item belongs to exactly one Sale.
2. Every item references a Product valid within the Organization.
3. Quantity is a valid positive amount.
4. Unit price has Money semantics.
5. Discount cannot produce an invalid negative line value.
6. Authoritative line total follows deterministic calculation rules.
7. Historical item values do not depend on future Catalog state.
8. Returns reference original items rather than editing them.

---

# 123. Ownership matrix

| Concern | Owner |
|---|---|
| Sale | Sales |
| Sale Item | Sales |
| Sale lifecycle | Sales |
| historical unit price | Sales |
| Sale discount | Sales |
| historical Sale totals | Sales |
| Customer identity | Parties |
| Customer Relationship | Parties |
| Product identity | Catalog |
| current/default Product price | Catalog |
| Stock Balance | Inventory |
| Sale Fulfillment Movement | Inventory |
| Receivable | Finance |
| Payment | Finance |
| Payment Allocation | Finance |
| Outstanding Balance | Finance |
| Refund Payment | Finance |
| customer debt calculation | Finance |
| Reporting projections | Reporting |

---

# 124. Deliberately deferred to M7

M7 will define implementation details including:

- Sale persistence model;
- Draft persistence policy;
- exact confirmation command;
- Sale numbering;
- exact item snapshot fields;
- price override representation;
- item discount representation;
- whole-Sale discount allocation if exposed;
- calculation/rounding order;
- transaction orchestration;
- idempotency persistence;
- concurrency behavior;
- cancellation workflow;
- Return representation;
- Return quantity enforcement;
- correction mechanics;
- authorization;
- APIs;
- queries;
- UI/POS workflows.

---

# 125. Deferred beyond initial V1

The following should not be implemented speculatively:

- quotations as part of this Sale lifecycle;
- customer Sales Orders;
- reservations;
- shipping;
- fulfillment centers;
- backorders;
- advanced promotions;
- coupons;
- loyalty points;
- subscriptions;
- recurring billing;
- installment financing engine;
- gift cards;
- customer advance balances;
- sophisticated tax engines;
- statutory e-invoicing unless separately scoped;
- complex exchange/refund policies.

These capabilities can evolve from the existing boundaries when real product requirements justify them.

---

# 126. Non-goals

This document does not:

- implement POS;
- design SQL tables;
- design REST endpoints;
- define Drizzle schemas;
- design a promotions engine;
- implement tax accounting;
- implement Inventory;
- implement Finance;
- define customer portals;
- define full refund/returns UI;
- implement accounting Revenue recognition.

---

# 127. Decision summary

Manasiness V1 models Sales as:

```text
Sale
├── Organization
├── optional Customer Relationship
├── Sale Item[]
├── historical commercial values
├── authoritative Sale Total
└── operational lifecycle
```

The primary lifecycle is:

```text
Draft
  │
  ▼
Confirmed
```

`Confirmed` is the authoritative commercial boundary.

There is no ambiguous generic `Completed` state in V1.

After confirmation:

```text
Commercial history
→ locked

Inventory
→ records physical fulfillment effects

Finance
→ records immediate Payment and/or Receivable
```

Anonymous Sales are valid:

```text
Customer = absent
```

but:

```text
anonymous credit debt
```

is invalid because a Receivable requires an attributable Customer.

Settlement may be:

```text
Immediate
Partial
Deferred
```

without changing the historical Sale.

Post-confirmation changes use explicit concepts:

```text
Cancellation
Return
Refund
Correction
```

rather than destructive editing.

The central Sales invariant is:

> **A confirmed Sale is the immutable commercial record of what the Organization sold; Inventory explains what physically moved, Finance explains what money moved or remains owed, and neither concern is hidden inside a generic Sale status.**