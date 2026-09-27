# Manasiness — Purchasing and Payables Domain Foundation

> **Status:** Active  
> **Milestone:** M0 — Product & Domain Foundation  
> **Scope:** Manasiness V1  
> **Purpose:** Define the Purchase aggregate, supplier relationship, receipt lifecycle, historical acquisition facts, Inventory collaboration, Finance collaboration, Payable behavior, supplier returns, and post-confirmation correction semantics.

---

# 1. Purpose

Purchasing is the commercial process through which an Organization acquires merchandise from Suppliers.

Manasiness Legacy represented this through `orders`.

A Legacy order effectively combined:

```text
supplier acquisition
+
one Product
+
quantity
+
stock effect
+
supplier debt
+
payment state
```

into one record controlled primarily through:

```text
pending
paid
cancelled
```

This creates several false equivalences:

```text
Purchase = one Product

Goods received = Supplier paid

Purchase date = Payment date

Inventory receipt = Payment

Supplier debt = pending Order
```

Manasiness V1 replaces those assumptions with explicit concepts.

Conceptually:

```text
Purchase
├── Supplier Relationship
├── Purchase Item[]
├── historical commercial values
└── commercial lifecycle

Receipt progress
├── quantities actually received
└── Inventory effects

Finance
├── Payable
├── Payment
└── Outstanding Balance
```

These dimensions may progress together.

They do not have to.

This document establishes their boundaries without requiring a full enterprise procurement suite.

---

# 2. Purchasing responsibility

Purchasing owns the commercial truth of what the Organization acquires from Suppliers.

Purchasing answers:

- From which Supplier are goods being acquired?
- Which Products are included?
- In what quantities?
- At what historical unit costs?
- What commercial amount was agreed?
- When did the Purchase become authoritative?
- How much merchandise has actually been received?
- Has the Purchase been fully received?
- Was any merchandise returned to the Supplier?
- Was the Purchase later cancelled or corrected?

Purchasing does not own:

- Supplier identity;
- Product identity;
- Stock Balance;
- Inventory Movement rules;
- Payment;
- Payable settlement;
- Financial Account balances.

---

# 3. Purchase

A **Purchase** represents one commercial acquisition transaction between an Organization and a Supplier.

A Purchase may contain multiple Purchase Items.

Example:

```text
Purchase #301
├── 24 × Coca-Cola
├── 12 × Water
└── 10 × Chocolate
```

This is one Purchase.

It is not three unrelated purchasing records.

---

# 4. Purchase aggregate

Conceptually:

```text
Purchase
│
├── Organization
├── Supplier Relationship
├── Purchase Item[]
├── historical commercial totals
├── commercial lifecycle
└── occurrence timestamps
```

Purchase Items belong to the Purchase.

A Purchase Item is not an independent supplier transaction.

---

# 5. Organization ownership

Every Purchase belongs to exactly one Organization.

The Supplier Relationship, Products, Inventory effects, and Finance consequences associated with the Purchase must belong to or be valid within the same Organization context.

Cross-tenant references are prohibited.

---

# 6. Supplier is required

A confirmed Purchase requires an identified Supplier Relationship.

Unlike an anonymous Sale, there is no V1 concept of an anonymous Purchase.

Correct:

```text
Party
└── Supplier Relationship
        │
        ▼
     Purchase
```

Incorrect:

```text
Unknown Supplier
```

created solely to satisfy persistence.

---

# 7. Why Supplier is required

Purchasing creates long-lived business information such as:

- acquisition history;
- historical costs;
- Payables;
- Payments;
- supplier returns;
- commercial corrections.

Those facts require an attributable Supplier.

If the business acquires goods from a previously unknown vendor, it should create the appropriate Supplier Relationship rather than storing a synthetic placeholder.

---

# 8. Supplier ownership

Parties owns:

```text
Party
Supplier Relationship
```

Purchasing references the Supplier Relationship.

Purchasing must not create an independent competing representation of Supplier identity.

---

# 9. Supplier history

A Supplier's history should eventually allow the Organization to understand:

```text
Purchases
Receipts
Supplier Returns
Payables
Payments
Outstanding Balance
```

These facts may appear together in product UX.

Their domain ownership remains distinct.

---

# 10. Supplier relationship lifecycle

Ending or deactivating a Supplier Relationship must not destroy historical Purchases.

Example:

```text
2026
Supplier active
Purchase #301

2028
Supplier Relationship ended
```

Purchase #301 remains historically attributable to that Supplier.

---

# 11. Draft Purchase

A **Draft Purchase** is a working commercial transaction that has not yet become authoritative.

An operator may use Draft to:

- select Supplier;
- add Products;
- adjust expected quantities;
- establish costs;
- review totals;
- prepare the acquisition.

---

# 12. Draft mutability

Draft Purchase information may be edited according to application rules.

For example:

```text
Draft Purchase
├── change Supplier
├── add Product
├── remove Product
├── change quantity
└── change expected unit cost
```

Draft exists so preparation can occur before durable business history is created.

---

# 13. Draft side effects

Draft must not create authoritative:

- Inventory Movements;
- received stock;
- Payables;
- supplier debt;
- historical purchasing reporting.

Draft is preparation.

It is not receipt.

It is not settlement.

---

# 14. Draft deletion

An abandoned Draft that has produced no consequential effects may be discarded according to the cross-cutting lifecycle policy.

It is different from cancelling an authoritative Purchase.

---

# 15. Purchase confirmation

**Confirmation** is the boundary at which the Organization establishes the Purchase as an authoritative commercial transaction.

Conceptually:

```text
Draft
  │
  ▼
Confirm Purchase
  │
  ▼
Confirmed Purchase
```

Confirmation means:

> The Organization asserts that this supplier acquisition agreement/transaction is real and should be preserved as purchasing history.

---

# 16. Confirmation requirements

At minimum, a Purchase cannot be confirmed unless:

- Organization context is valid;
- Supplier Relationship is valid;
- at least one Purchase Item exists;
- item quantities are valid and positive;
- referenced Products are valid;
- authoritative unit costs are established;
- totals are internally consistent;
- currency semantics are valid.

Receipt and Payment are separate concerns.

---

# 17. Confirmation does not mean receipt

This distinction is fundamental:

```text
Purchase confirmed
≠
goods received
```

A confirmed Purchase may still have:

```text
Receipt Status = Not Received
```

---

# 18. Confirmation does not mean Payment

Likewise:

```text
Purchase confirmed
≠
Supplier paid
```

Payment belongs to Finance.

---

# 19. Purchase commercial lifecycle

The primary V1 commercial lifecycle is:

```text
Draft
  │
  ▼
Confirmed
```

Confirmed Purchase is the authoritative commercial acquisition record.

Later operational facts are represented separately through:

```text
Receipt progress
Supplier Return
Cancellation / Correction
```

---

# 20. V1 does not use generic `Paid` Purchase status

Purchasing must not contain:

```text
Purchase.status = paid
```

as the source of purchasing truth.

Financial settlement belongs to Finance.

A Purchase can remain:

```text
Confirmed
```

while Finance independently reports:

```text
Unpaid
Partially Settled
Settled
```

---

# 21. V1 does not require generic `Received` Purchase status

Receipt is its own operational dimension.

The Purchase remains the commercial transaction.

Receipt progress explains how much of that transaction has physically arrived.

This prevents one status field from mixing:

- commercial agreement;
- physical receipt;
- financial settlement.

---

# 22. Purchase Item

A **Purchase Item** represents one commercial line in a Purchase.

Conceptually:

```text
Purchase Item
├── Product reference
├── historical description
├── purchased quantity
├── authoritative unit cost
└── authoritative line total
```

This describes the agreed acquisition.

---

# 23. Multiple Purchase Items

One Purchase may contain many items.

Example:

```text
Supplier: Distribuidora X

Purchase
├── 20 × Product A
├── 10 × Product B
└── 5 × Product C
```

This remains one commercial supplier transaction.

---

# 24. Purchase Item quantity

Purchase Item quantity represents the authoritative quantity acquired/agreed through the Purchase.

The quantity must be positive.

Returns are not represented by negative Purchase Item quantities.

---

# 25. Product reference

Purchase Item references the canonical Catalog Product.

Catalog remains the owner of current Product identity and metadata.

---

# 26. Historical description

Purchase Item should preserve enough descriptive information from confirmation time for the historical transaction to remain understandable if Catalog information changes later.

Exact snapshot fields belong to M8.

---

# 27. Historical unit cost

The authoritative unit cost of a confirmed Purchase Item is a historical commercial fact.

Example:

```text
January Purchase
Product A
unit cost = S/ 4
```

Later:

```text
Catalog current/default cost = S/ 5
```

The January Purchase remains:

```text
S/ 4
```

---

# 28. Catalog cost versus Purchase cost

Catalog may provide current/default cost metadata.

Purchasing owns the actual historical acquisition cost.

Conceptually:

```text
Catalog default cost
        │
        ▼
Purchase actual unit cost
```

The latter becomes authoritative at confirmation.

---

# 29. Purchase totals

The Purchase total is the authoritative Money amount represented by the confirmed Purchase Items.

Conceptually:

```text
Purchase Total
=
sum(Purchase Item totals)
```

according to Finance Money and rounding rules.

---

# 30. Purchase total is not amount paid

This distinction is mandatory:

```text
Purchase Total
≠
Amount Paid
```

Example:

```text
Purchase Total = S/ 500
Payment = S/ 200
Outstanding = S/ 300
```

The Purchase remains a S/500 Purchase.

---

# 31. Purchase total is not received value

With partial receipt:

```text
Purchase Total = S/ 500
Received value so far = S/ 200
```

Both facts can legitimately coexist.

---

# 32. Confirmed commercial values are protected

Once confirmed, consequential Purchase facts must not be silently rewritten.

This includes:

- Supplier association;
- Products;
- purchased quantities;
- unit costs;
- historical descriptions;
- totals;
- commercial occurrence time.

Corrections require explicit behavior.

---

# 33. Ordering and receiving are conceptually separate

V1 intentionally distinguishes:

```text
Purchase
```

from:

```text
Receipt
```

even though V1 does not require a separate enterprise `Purchase Order` document.

The commercial Purchase states what is being acquired.

Receipt records what actually arrived.

---

# 34. Why receipt is separate

Real supplier behavior includes:

```text
Purchase 100 units
Receive 40 today
Receive 60 next week
```

or:

```text
Purchase 100 units
Receive only 90
Remaining 10 never arrive
```

A model where `Purchase = received` cannot represent these scenarios correctly.

---

# 35. Receipt

A **Receipt** is an authoritative operational fact that merchandise from a Purchase was physically accepted into the Organization.

Receipt is associated with one or more Purchase Items.

Conceptually:

```text
Receipt
├── Purchase reference
├── received item quantities
├── occurrence time
└── Actor/context
```

This is conceptual, not a database schema.

---

# 36. Receipt is not Payment

```text
Receipt
≠
Payment
```

Receiving merchandise changes Inventory.

Paying Supplier changes Finance.

They may happen together.

They do not have to.

---

# 37. Receipt affects Inventory

For stock-tracked Products:

```text
Record Receipt
       │
       ▼
Inventory
       │
       └── Purchase Receipt Movement
```

Inventory owns:

- quantity validation;
- Inventory Movement;
- Stock Balance.

Purchasing owns the fact that the receipt belongs to the Purchase.

---

# 38. Payment must not control Inventory

This Legacy behavior is explicitly rejected:

```text
Purchase becomes paid
→ stock increases
```

Correct:

```text
Goods physically received
→ stock increases
```

Payment can happen before, at, or after commercial acquisition in the real world, but V1 settlement behavior is constrained by supported Finance semantics.

---

# 39. Full receipt

A Purchase is **Fully Received** when all expected/purchased stock-tracked quantities have been received according to valid Receipt history.

Example:

```text
Purchased: 100
Received: 100

Receipt Status:
Fully Received
```

---

# 40. Not received

A confirmed Purchase is **Not Received** when no authoritative receipt quantity has yet been recorded.

Example:

```text
Purchased: 100
Received: 0
```

---

# 41. Partial receipt

V1 supports **Partial Receipt**.

Example:

```text
Purchased:
100 × Product A

Receipt 1:
40 × Product A

Current receipt position:
40 / 100
```

Inventory increases by 40.

The remaining 60 have not yet entered Inventory.

---

# 42. Subsequent receipt

Later:

```text
Receipt 2:
60 × Product A
```

Result:

```text
Total received:
100 / 100

Receipt Status:
Fully Received
```

Each receipt remains independently historical.

---

# 43. Receipt status is derived

At the product/domain level, receipt condition should preferably be derivable from authoritative receipt quantities.

Conceptually:

```text
received = 0
→ Not Received

0 < received < purchased
→ Partially Received

received = purchased
→ Fully Received
```

A materialized status may exist for efficient querying.

It must agree with the receipt history.

---

# 44. Receipt state exists per Purchase Item

A multi-item Purchase may have different progress for each item.

Example:

```text
Purchase

Product A
10 purchased
10 received

Product B
20 purchased
5 received
```

The Purchase as a whole is:

```text
Partially Received
```

because not all required item quantities have arrived.

---

# 45. Over-receipt

Ordinary V1 Receipt must not silently exceed the confirmed Purchase Item quantity.

Example:

```text
Purchased = 10
Already received = 8
Attempted receipt = 5
```

would result in:

```text
13 received
```

and should therefore be rejected unless the Purchase is explicitly corrected/amended first.

---

# 46. Why over-receipt is rejected

Accepting an unexplained quantity beyond the confirmed commercial transaction would create inconsistency between:

- Purchase quantity;
- Purchase total;
- historical cost;
- Inventory receipt;
- Payable.

The commercial fact should be corrected explicitly if the real transaction changed.

---

# 47. Receipt quantity is positive

A Receipt uses positive received quantities.

Supplier Returns use separate semantics.

Do not represent returns as:

```text
Receipt quantity = -5
```

---

# 48. Receipt timestamps

Each Receipt preserves its actual operational occurrence time.

Example:

```text
Purchase confirmed:
September 1

Receipt 1:
September 3

Receipt 2:
September 10

Supplier Payment:
September 20
```

These timestamps represent separate facts.

---

# 49. Receipt history is not rewritten

A later receipt does not change when an earlier receipt occurred.

Likewise, Supplier Payment does not rewrite Purchase or Receipt timestamps.

---

# 50. Inventory transaction integrity

Recording a Receipt and creating the corresponding Inventory effects must remain consistent.

The system must not successfully record:

```text
Receipt +20
```

while failing to create the required:

```text
Inventory Movement +20
```

for stock-tracked Products.

The concrete transaction mechanism belongs to M8/M5.

---

# 51. Receipt idempotency

Retrying the same logical Receipt must not create duplicate stock.

Example:

```text
Receive 20 units
request times out
client retries
```

must not create:

```text
+20
+20
```

for one real receipt.

M8 must implement retry-safe receipt behavior.

---

# 52. Receipt concurrency

Concurrent receipt operations must preserve the confirmed quantity constraint.

Example:

```text
Purchased = 100
Received = 80

Operator A receives 20
Operator B receives 20
```

both must not independently succeed and produce:

```text
120 received
```

without an explicit Purchase correction.

---

# 53. Payable

A **Payable** represents money the Organization owes to the Supplier.

Finance owns Payable semantics.

Purchasing provides the commercial context that causes the financial obligation.

---

# 54. V1 Payable recognition rule

For merchandise Purchases, V1 recognizes supplier obligation as merchandise is authoritatively received.

Conceptually:

```text
Receipt
   │
   ├── Inventory consequence
   │
   └── Finance consequence
       └── recognized Payable amount
```

This means V1 does not treat a merely confirmed but completely unreceived Purchase as supplier debt.

---

# 55. Why Payable follows receipt in V1

V1 deliberately avoids requiring a separate Supplier Invoice domain.

Without Supplier Invoice semantics, recognizing debt from received merchandise provides a simple operational rule:

> The Organization owes for the merchandise it has accepted.

This supports:

- full immediate receipts;
- partial receipts;
- partial supplier debt;
- deferred settlement;

without pretending to implement enterprise accounts payable.

---

# 56. Partial receipt and Payable

Example:

```text
Purchase:
100 × Product A @ S/ 5
Total = S/ 500

Receipt:
40 units
```

Inventory:

```text
+40
```

Recognized supplier obligation:

```text
S/ 200
```

The remaining S/300 is not yet recognized as V1 Payable until the corresponding merchandise is received.

---

# 57. Second partial receipt

Later:

```text
Receipt:
60 units
```

Additional recognized obligation:

```text
S/ 300
```

Total recognized Purchase obligation:

```text
S/ 500
```

The exact Finance persistence strategy is deferred.

---

# 58. Payable representation is a Finance decision

Finance may eventually represent receipt-driven obligations as:

- one Payable whose recognized amount increases through valid adjustments;
- several obligations associated with Receipt events;
- another coherent Finance representation.

Purchasing only establishes the source commercial facts.

M6/M8 determine persistence.

---

# 59. Full receipt

If the full Purchase is received at once:

```text
Purchase Total = S/ 500
Receipt = all items
```

Finance can recognize:

```text
Payable = S/ 500
```

subject to any immediate settlement.

---

# 60. Immediate supplier payment

A fully or partially received amount may be settled immediately.

Example:

```text
Received value = S/ 500
Immediate Payment = S/ 500
Outstanding = S/ 0
```

Purchasing remains independent from Payment ownership.

---

# 61. Partial supplier payment

Example:

```text
Recognized Payable = S/ 500
Payment now = S/ 200
Outstanding = S/ 300
```

The Purchase and receipt history remain unchanged.

---

# 62. Deferred supplier payment

Example:

```text
Recognized Payable = S/ 500
Payment now = S/ 0
Outstanding = S/ 500
```

The Inventory already contains the received merchandise.

---

# 63. Payment after partial receipt

Example:

```text
Purchase Total = S/ 500
Received value = S/ 200
Payable recognized = S/ 200
Payment = S/ 100
Outstanding = S/ 100
```

The unreceived S/300 does not enter Inventory or the V1 Payable yet.

---

# 64. Supplier prepayment

Paying a Supplier before merchandise is received is economically possible.

However, that requires an explicit concept such as:

```text
Supplier Advance
```

because there is no V1 recognized Payable yet under the receipt-based model.

Supplier advances are deliberately deferred beyond initial V1.

V1 must not fake a Receipt merely to record a prepayment.

---

# 65. Why prepayment is deferred

Supporting Supplier Advances correctly requires rules for:

- future allocation;
- cancellation;
- Supplier credit;
- refunds;
- Purchase matching.

Those are useful capabilities but unnecessary for the first operational Finance/Purchasing model.

---

# 66. Payable settlement

Finance owns:

- outgoing Payment;
- Payment Allocation;
- Outstanding Balance;
- settlement status;
- Payment reversal;
- financial adjustments.

Purchasing must not maintain its own mutable:

```text
supplierDebt
```

field.

---

# 67. Supplier debt

Supplier debt is:

```text
sum(outstanding Finance Payables for Supplier)
```

It is not:

```text
sum(Purchases where status = pending)
```

---

# 68. Payment does not rewrite Purchase history

Example:

```text
Purchase confirmed:
September 1

Receipt:
September 2

Supplier Payment:
September 15
```

The Purchase remains a September 1 commercial fact.

The Receipt remains a September 2 Inventory fact.

The Payment remains a September 15 Finance fact.

---

# 69. Historical Supplier cost

Purchase Item cost remains stable after confirmation.

Changing:

```text
Catalog current cost
```

or:

```text
Supplier's future quoted cost
```

must not modify previous Purchase Items.

---

# 70. Purchase correction

A confirmed Purchase must not be treated like a mutable Draft.

Consequential Purchase facts require explicit correction.

Examples include:

- wrong Supplier;
- wrong Product;
- wrong quantity;
- wrong historical unit cost.

---

# 71. Correction before any receipt

A confirmed Purchase that has not produced:

- Receipt;
- Inventory effects;
- Payable;
- Payment;

is easier to cancel or replace.

M8 may allow a controlled cancellation/reissue workflow.

Even then, the original confirmed fact should remain traceable if it was authoritative.

---

# 72. Correction after receipt

Once goods have been received, direct editing becomes dangerous.

Changing:

```text
Purchase quantity
```

or:

```text
unit cost
```

may invalidate:

- Receipt history;
- Inventory;
- Payables;
- Payments.

Therefore correction must use an explicit flow.

---

# 73. Remaining quantity correction

Suppose:

```text
Purchased = 100
Received = 40
```

and Supplier confirms only 80 will ever be delivered.

The system needs to distinguish:

```text
40 already received
40 still expected
20 no longer expected
```

M8 may implement an explicit adjustment/cancellation of the remaining unreceived quantity.

It must not rewrite the already received 40.

---

# 74. Confirmed quantity cannot drop below net received

A Purchase correction must never reduce expected quantity below the quantity already authoritatively received minus valid Supplier Returns.

Historical physical facts cannot be invalidated by editing a commercial target.

---

# 75. Purchase cancellation

**Purchase Cancellation** explicitly terminates a Purchase according to its current consequences.

Cancellation is not deletion.

---

# 76. Draft cancellation

A Draft can be discarded because it has not produced authoritative consequences.

---

# 77. Confirmed Purchase with no consequences

If a confirmed Purchase has:

```text
no Receipt
no Payable
no Payment
```

cancellation can conceptually terminate the entire acquisition.

The confirmed history remains traceable according to M8 implementation policy.

---

# 78. Purchase with partial receipt

If part of the Purchase has already been received:

```text
Purchased = 100
Received = 40
```

"Cancel Purchase" cannot mean pretending the 40 never arrived.

Instead, cancellation may mean:

```text
stop expecting remaining 60
```

while preserving the received history.

If the 40 are physically returned, that is a Supplier Return.

---

# 79. Purchase with Finance consequences

If Payables or Payments already exist, cancellation must coordinate with Finance.

Changing Purchasing state alone cannot remove financial history.

---

# 80. Supplier Return

A **Supplier Return** represents merchandise previously received from a Supplier that physically leaves the Organization and is returned to that Supplier.

It references prior Purchase/Receipt context.

---

# 81. Supplier Return affects Inventory

Conceptually:

```text
Supplier Return
       │
       ▼
Inventory
       │
       └── Supplier Return Movement
```

Inventory owns the physical quantity effect.

---

# 82. Supplier Return quantity invariant

The business must not return more than the net quantity actually available from the relevant received Purchase history.

Conceptually:

```text
received
-
already returned
=
maximum returnable
```

subject to Inventory availability and M8 rules.

---

# 83. Supplier Return does not rewrite Receipt

Original:

```text
Receipt +20
```

Later:

```text
Supplier Return -5
```

The historical Receipt remains +20.

The Return explains the later -5.

---

# 84. Supplier Return and Finance

A Supplier Return may require a financial consequence.

For example:

```text
reduce outstanding Payable
```

or, if already paid:

```text
Supplier refund
```

Finance owns the monetary behavior.

---

# 85. Supplier Return before Payment

Example:

```text
Received value = S/ 100
Payable = S/ 100

Return value = S/ 20
```

Finance may reduce the valid obligation to:

```text
S/ 80
```

through an explicit adjustment linked to the Return.

No fake Payment of S/20 occurred.

---

# 86. Supplier Return after Payment

Example:

```text
Purchase received = S/ 100
Supplier paid = S/ 100
Return value = S/ 20
```

If Supplier actually gives money back:

```text
Incoming Supplier Refund = S/ 20
```

Finance records the monetary fact.

---

# 87. Supplier credit balance

A Supplier might provide credit for a future Purchase rather than refund money.

That would require a concept such as:

```text
Supplier Credit Balance
```

This is deliberately deferred beyond initial V1.

V1 should not silently represent it as a Payment that did not occur.

---

# 88. Payment reversal

If a Supplier Payment itself was recorded incorrectly, Finance owns Payment reversal.

Purchasing does not modify the Purchase merely to correct the Payment.

---

# 89. Return is not Payment reversal

These mean different things:

```text
Supplier Return
→ merchandise physically returned

Payment Reversal
→ monetary record was incorrect/neutralized
```

One may happen without the other.

---

# 90. Return is not Purchase cancellation

A valid Purchase may remain historically real even when some or all of its merchandise is later returned.

The original Purchase should remain visible.

---

# 91. Historical correction principle

The general rule is:

```text
Original authoritative Purchase/Receipt
+
explicit correction/return/reversal
=
current truthful state
```

not:

```text
rewrite old Purchase until history looks clean
```

---

# 92. Receipt correction

If a Receipt was recorded incorrectly, its historical effect must be corrected explicitly.

Example:

```text
Receipt recorded +50
Actual receipt +5
```

Preferred direction:

```text
Original Receipt +50
Corrective Inventory/Purchasing operation -45
```

rather than silently changing the original Receipt.

Exact implementation belongs to M8/M5.

---

# 93. Purchase Supplier cannot be silently changed

If a confirmed Purchase references the wrong Supplier, changing `supplierId` directly would corrupt:

- Supplier history;
- Payables;
- Payments;
- reporting.

An explicit correction is required.

---

# 94. Purchase Item Product cannot be silently changed

Likewise, replacing one Product reference with another after confirmation could corrupt:

- Receipt history;
- Inventory Movements;
- historical costs.

Correction must be explicit.

---

# 95. Purchase cost cannot be silently changed

Once confirmed, an authoritative Purchase Item cost is historical.

A cost error must use a traceable correction process rather than direct overwrite.

---

# 96. Supplier history

For a Supplier, Purchasing should eventually provide historical visibility into:

```text
Purchase
Receipt progress
Supplier Return
```

Finance contributes:

```text
Payables
Payments
Outstanding Balance
Refunds / adjustments
```

The UI may combine them.

The domains remain distinct.

---

# 97. Purchasing and Inventory boundary

Purchasing determines:

> Which merchandise was received under this Purchase?

Inventory determines:

> How that receipt affects stock and whether the quantity operation is valid.

---

# 98. Purchasing must not edit Inventory directly

Incorrect:

```text
Receive Purchase
→ UPDATE Product.stock
```

Correct:

```text
Receive Purchase
→ Inventory capability
→ Purchase Receipt Movement
```

---

# 99. Purchasing and Finance boundary

Purchasing determines:

- Supplier;
- acquired items;
- historical costs;
- Receipt facts.

Finance determines:

- Payable;
- Payment;
- Payment Allocation;
- Outstanding Balance;
- Refund;
- financial correction.

---

# 100. Purchasing and Parties boundary

Parties owns Supplier identity and Supplier Relationship.

Purchasing references the Supplier.

Ending the Supplier Relationship does not erase historical Purchases.

---

# 101. Purchasing and Catalog boundary

Catalog owns:

```text
Product
current/default cost metadata
```

Purchasing owns:

```text
historical Purchase Item Product reference
historical description
actual unit cost
purchased quantity
line total
```

---

# 102. Purchasing and Reporting boundary

Reporting may calculate:

- Purchase amount by period;
- quantities acquired;
- supplier purchasing history;
- purchase frequency;
- cost trends;
- received versus outstanding quantities.

Reporting does not redefine Purchase or Receipt validity.

---

# 103. Purchasing and Assistant boundary

The Operational Assistant may eventually interpret:

```text
"Registra una compra de 20 Coca-Colas a Distribuidora X."
```

It must:

- resolve Supplier;
- resolve Product;
- determine quantity/cost;
- clarify ambiguity;
- authorize;
- call Purchasing capability.

It must not directly:

- increase stock;
- create supplier debt;
- write database rows independently.

---

# 104. Assistant and Receipt

A future command:

```text
"Recibimos 10 de las 20 Coca-Colas de Distribuidora X."
```

may route through Purchasing receipt behavior.

Purchasing validates the Purchase context.

Inventory records the physical effect.

Finance recognizes the corresponding supported obligation.

---

# 105. Authorization

Future authorization should distinguish capabilities such as:

- create/confirm Purchase;
- modify Draft Purchase;
- record Receipt;
- cancel Purchase;
- record Supplier Return;
- perform Purchase correction.

The exact permission model belongs to M3/M8.

---

# 106. Auditability

Consequential operations should remain attributable.

Examples:

```text
Purchase confirmed
Receipt recorded
Purchase cancelled
Supplier Return recorded
Purchase corrected
historical cost overridden
```

The Actor and Organization context should remain observable according to cross-cutting audit policy.

---

# 107. Purchase idempotency

Confirming one logical Purchase must not accidentally create duplicate:

- Purchase;
- Payable;
- other consequential state.

Retry-safe command behavior is required where appropriate.

---

# 108. Receipt idempotency

Each logical Receipt must be protected from duplicate execution.

This is especially important because duplicate Receipt means duplicate stock.

---

# 109. Payment idempotency

Supplier Payment remains Finance-owned and follows Finance idempotency rules.

Purchasing must not attempt to independently deduplicate Finance records.

---

# 110. Example — full cash Purchase

Purchase:

```text
Supplier: Distribuidora X

20 × Product A @ S/ 5

Purchase Total = S/ 100
```

Receipt:

```text
20 / 20 received
```

Inventory:

```text
+20 Product A
```

Finance:

```text
Payable recognized = S/ 100
Outgoing Payment = S/ 100
Outstanding = S/ 0
```

Commercial, physical, and financial facts may happen through one operator flow while remaining independently modeled.

---

# 111. Example — full Purchase on supplier credit

Purchase:

```text
Total = S/ 500
```

Full Receipt:

```text
Inventory + merchandise
```

Finance:

```text
Payable = S/ 500
Payment = S/ 0
Outstanding = S/ 500
```

Supplier Payment may happen later.

---

# 112. Example — partial supplier Payment

```text
Payable = S/ 500

Payment 1 = S/ 200
Outstanding = S/ 300
```

Later:

```text
Payment 2 = S/ 300
Outstanding = S/ 0
```

Receipt history remains unchanged.

---

# 113. Example — partial Receipt

Purchase:

```text
100 × Product A @ S/ 5
Total = S/ 500
```

Receipt 1:

```text
40 × Product A
```

Result:

```text
Inventory +40

Receipt progress
40 / 100

Recognized obligation
S/ 200
```

---

# 114. Example — completing partial Receipt

Receipt 2:

```text
60 × Product A
```

Result:

```text
Inventory +60

Total Receipt
100 / 100

Additional recognized obligation
S/ 300

Total recognized Purchase obligation
S/ 500
```

---

# 115. Example — mixed receipt progress

Purchase:

```text
10 × Product A
20 × Product B
```

Receipt:

```text
10 × Product A
5 × Product B
```

Status:

```text
Product A → Fully Received
Product B → Partially Received
Purchase  → Partially Received
```

Inventory reflects only quantities actually received.

---

# 116. Example — short shipment

Purchase:

```text
100 units
```

Received:

```text
80 units
```

Supplier confirms remaining 20 will not arrive.

The correct outcome is not:

```text
edit historical received quantity
```

Instead M8 should provide an explicit way to close/correct the unreceived remainder while preserving:

```text
Purchase originally confirmed for 100
Receipt history = 80
```

---

# 117. Example — Supplier Return before settlement

Received:

```text
20 units @ S/ 5
Payable = S/ 100
```

Return:

```text
4 units
```

Inventory:

```text
-4
```

Finance:

```text
valid obligation reduced by S/ 20
Outstanding reflects correction
```

No fake outgoing/incoming Payment is created unless money actually moved.

---

# 118. Example — Supplier Return after settlement

Original:

```text
Received value = S/ 100
Paid = S/ 100
```

Return:

```text
value = S/ 20
```

Inventory:

```text
returned quantity leaves stock
```

If Supplier refunds cash:

```text
Finance
→ Incoming Supplier Refund S/ 20
```

Original Purchase and Payment remain visible.

---

# 119. Example — incorrect Supplier Payment

Purchase and Receipt are correct.

Operator accidentally records:

```text
Payment = S/ 500
```

instead of:

```text
Payment = S/ 50
```

Correction belongs to Finance:

```text
Reverse S/ 500 Payment
Record S/ 50 Payment
```

Do not modify Purchase or Receipt.

---

# 120. Example — Catalog cost changes

Confirmed Purchase:

```text
Product A
unit cost = S/ 4
```

Later:

```text
Catalog default cost = S/ 5
```

Historical Purchase remains:

```text
S/ 4
```

---

# 121. Example — confirmed Purchase with no receipt

```text
Purchase confirmed:
100 units

Receipt:
0

Inventory:
unchanged

Payable:
none under V1 receipt-based recognition
```

The business knows what it expects to acquire without claiming it already owns or owes for merchandise it has not accepted.

---

# 122. Evolution toward richer procurement

The V1 model intentionally keeps three important facts distinct:

```text
commercial acquisition
physical receipt
financial obligation/settlement
```

That creates a clean evolution path toward:

```text
Purchase Order
        ↓
Goods Receipt
        ↓
Supplier Invoice
        ↓
Payment
```

without requiring all four concepts now.

---

# 123. Future Purchase Order

A future **Purchase Order** may represent an explicit order/commitment sent to a Supplier before a commercial Purchase or invoice exists.

V1 does not require a separate Purchase Order aggregate.

The current confirmed Purchase already preserves expected quantities sufficiently for the initial product.

---

# 124. Future Goods Receipt

A richer future procurement model may promote Receipt into a dedicated Goods Receipt aggregate/document with:

- supplier delivery references;
- warehouse/location;
- receiver;
- discrepancies;
- inspection status.

V1 only needs the receipt semantics necessary for quantity history and Inventory.

---

# 125. Future Supplier Invoice

A future **Supplier Invoice** may represent the Supplier's formal financial claim independently from:

- Purchase Order;
- physical Receipt.

This would allow sophisticated scenarios such as:

- invoice before delivery;
- invoice after delivery;
- partial invoice;
- invoice mismatch;
- three-way matching.

V1 explicitly avoids this complexity.

---

# 126. Why V1 does not require the full procurement stack

The target small business primarily needs to answer:

- What am I buying?
- From whom?
- What actually arrived?
- How much did it cost?
- How much do I owe?
- How much have I paid?

Requiring:

```text
Purchase Requisition
Purchase Order
Goods Receipt
Supplier Invoice
Three-Way Match
Approval Workflow
```

for every small-business purchase would create enterprise ceremony without equivalent V1 value.

---

# 127. Evolution without redesign

The current concepts preserve the important separations:

```text
Purchase
≠
Receipt
≠
Payable
≠
Payment
```

Therefore future procurement concepts can be inserted between these boundaries rather than requiring a domain rewrite.

---

# 128. Core Purchase invariants

1. Every Purchase belongs to one Organization.
2. Every confirmed Purchase has one identified Supplier Relationship.
3. A Purchase contains one or more Purchase Items.
4. Purchase Item quantities are positive.
5. Purchase Item costs use canonical Money semantics.
6. Confirmed Purchase commercial values are historical facts.
7. Catalog cost changes do not rewrite Purchase history.
8. Drafts create no Inventory or Finance effects.
9. Confirmation is separate from Receipt.
10. Confirmation is separate from Payment.
11. Confirmed Purchases are not silently rewritten.
12. Supplier identity remains historically attributable.

---

# 129. Core Receipt invariants

1. Receipt is separate from Purchase confirmation.
2. Receipt is separate from Payment.
3. V1 supports multiple partial Receipts.
4. Receipt quantity is positive.
5. Cumulative ordinary Receipt cannot exceed confirmed Purchase quantity.
6. Receipt timestamps remain historical.
7. Stock changes only when merchandise is received.
8. Inventory owns Stock Balance and Inventory Movement.
9. Receipt and corresponding Inventory effect must remain consistent.
10. Receipt commands must be idempotent.
11. Concurrent Receipts must preserve quantity invariants.
12. Supplier Returns do not rewrite prior Receipt history.

---

# 130. Core Payable invariants

1. Payable belongs to Finance.
2. V1 recognizes supplier obligation as merchandise is received.
3. Unreceived Purchase quantity does not yet become V1 Payable.
4. Payable may be partially settled.
5. Payment does not affect Receipt status.
6. Supplier debt derives from outstanding Payables.
7. Ordinary settlement cannot create negative outstanding balance.
8. Financial corrections preserve history.
9. Supplier Return may reduce valid obligation but is not itself Payment.
10. Supplier Payment timestamps do not rewrite Purchase/Receipt timestamps.

---

# 131. Ownership matrix

| Concern | Owner |
|---|---|
| Purchase | Purchasing |
| Purchase Item | Purchasing |
| Purchase commercial lifecycle | Purchasing |
| historical unit cost | Purchasing |
| historical Purchase total | Purchasing |
| Receipt / receipt progress | Purchasing |
| Supplier Return commercial context | Purchasing |
| Supplier identity | Parties |
| Supplier Relationship | Parties |
| Product identity | Catalog |
| current/default Product cost | Catalog |
| Stock Balance | Inventory |
| Purchase Receipt Inventory Movement | Inventory |
| Supplier Return Inventory Movement | Inventory |
| Payable | Finance |
| Payment | Finance |
| Payment Allocation | Finance |
| Outstanding Balance | Finance |
| Supplier refund | Finance |
| Payment reversal | Finance |
| supplier debt calculation | Finance |
| purchasing projections | Reporting |

---

# 132. Deliberately deferred to M8

M8 will define implementation details including:

- Purchase persistence;
- Draft persistence;
- Purchase numbering;
- confirmation command;
- exact Purchase Item snapshots;
- Receipt persistence;
- partial Receipt commands;
- receipt status projection;
- closing unreceived remainder;
- Supplier Return representation;
- cancellation;
- correction workflow;
- transaction orchestration;
- Finance integration;
- idempotency;
- concurrency;
- authorization;
- API contracts;
- purchasing UI.

---

# 133. Deferred beyond initial V1

The following should not be implemented speculatively:

- Purchase Requisitions;
- approval chains;
- dedicated Purchase Order aggregate;
- Supplier Invoice aggregate;
- three-way matching;
- supplier advances;
- supplier credit balances;
- automated procurement;
- replenishment planning;
- contract purchasing;
- supplier catalogs;
- EDI;
- supplier portal;
- receiving inspection;
- warehouse receiving workflows;
- landed-cost accounting;
- foreign-currency purchasing.

---

# 134. Non-goals

This document does not:

- implement Purchasing;
- design database tables;
- design REST endpoints;
- require enterprise procurement documents;
- build supplier portal functionality;
- define accounting inventory valuation;
- implement tax invoices;
- choose transaction/locking primitives;
- implement Finance or Inventory.

---

# 135. Decision summary

Manasiness V1 models supplier acquisition through three independent dimensions.

## Commercial

```text
Purchase
├── Supplier
├── Purchase Item[]
├── historical quantities
├── historical costs
└── Purchase Total
```

Primary commercial lifecycle:

```text
Draft
  │
  ▼
Confirmed
```

## Physical

```text
Receipt
├── Not Received
├── Partially Received
└── Fully Received
```

Receipt may happen through multiple operations.

Only received stock enters Inventory.

## Financial

```text
Receipt-recognized obligation
        │
        ▼
      Payable
        │
        ├── Payment
        └── Outstanding Balance
```

Therefore:

```text
Purchase ≠ Receipt
Receipt ≠ Payment
Purchase ≠ Payment
```

and:

```text
Confirmed Purchase
+
Not Received
+
No Payable yet
```

is valid in the V1 model.

Likewise:

```text
Confirmed Purchase
+
Fully Received
+
Partially Settled
```

is valid.

Partial Receipt is supported without introducing a full procurement stack.

Historical Purchases and Receipts are never silently rewritten to represent later corrections.

The central Purchasing invariant is:

> **Manasiness must preserve separately what the Organization agreed to acquire, what merchandise actually arrived, what Inventory changed because of that receipt, what financial obligation was recognized, and what money was eventually paid.**