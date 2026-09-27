# Manasiness — Finance Domain Foundation

> **Status:** Active  
> **Milestone:** M0 — Product & Domain Foundation  
> **Scope:** Manasiness V1  
> **Purpose:** Define canonical monetary, payment, credit, receivable, payable, expense, cash-management, settlement, and correction semantics before Sales, Purchasing, Workforce, and Finance implementation begin.

---

# 1. Purpose

Money participates in almost every important Manasiness workflow.

Sales creates commercial amounts.

Purchasing creates supplier obligations.

Workers may create supported payment obligations.

Expenses consume money.

Payments settle obligations.

Cash and bank accounts answer where money currently exists.

Reporting needs to distinguish:

- what was sold;
- what was purchased;
- what is owed;
- what was paid;
- what money entered;
- what money left.

Manasiness Legacy largely represented these concepts through generic states such as:

```text
pending
paid
canceled
```

That creates several false equivalences:

```text
Sale complete = Sale paid

Purchase received = Supplier paid

Revenue = Cash received

Purchase = Expense

Payment = Commercial transaction
```

Manasiness V1 explicitly rejects those equivalences.

This document defines Finance as an independent domain with clear collaboration boundaries.

It intentionally does not define:

- database tables;
- Drizzle schemas;
- API endpoints;
- accounting journal entries;
- payment gateways;
- tax rules;
- statutory accounting;
- concrete UI screens.

Those concerns belong to later milestones.

---

# 2. Finance responsibility

Finance owns the operational monetary concepts required to answer questions such as:

- How much does this customer still owe?
- How much do we still owe this supplier?
- Which Payments have been recorded?
- How much money entered today?
- How much money left today?
- Which Financial Account received the money?
- Which Expense remains unpaid?
- What was reversed or corrected?
- Why is the current cash balance this amount?

Finance owns concepts such as:

```text
Money
Payment
Payment Allocation
Receivable
Payable
Outstanding Balance
Expense
Financial Account
Cash Movement
Financial Transfer
financial reversal/correction
```

Finance does not own:

- Sale lifecycle;
- Purchase lifecycle;
- Product;
- Inventory quantity;
- Customer identity;
- Supplier identity;
- Worker identity.

---

# 3. Foundational separation

The central financial model is:

```text
Commercial fact
      │
      ▼
Financial obligation
      │
      ▼
Settlement
      │
      ▼
Payment
      │
      ▼
Cash Movement
```

These facts may happen simultaneously.

They do not have to.

For example:

```text
Sale today
Payment next week
```

is valid.

Likewise:

```text
Purchase received today
Supplier paid next month
```

is valid.

---

# 4. Money

**Money** represents an exact monetary amount together with the currency required to interpret it.

Conceptually:

```text
Money
├── amount
└── currency
```

For example:

```text
10.50 PEN
```

The currency is part of the meaning of the amount.

```text
10.50 PEN
```

is not equivalent to:

```text
10.50 USD
```

---

# 5. Money must use exact decimal semantics

Financial calculations must not rely on binary floating-point semantics.

Values such as:

```text
0.1 + 0.2
```

must never produce monetary uncertainty because of implementation representation.

The exact implementation belongs to M6/M1.

The domain requirement is:

> Authoritative monetary calculations use exact decimal semantics.

---

# 6. V1 currency model

Each Organization has one **operating currency** in Manasiness V1.

Examples:

```text
PEN
USD
```

All authoritative V1 commercial and financial operations within that Organization use that operating currency.

Therefore, in V1:

```text
Organization operating currency = PEN

Sale total      → PEN
Purchase total  → PEN
Receivable      → PEN
Payable         → PEN
Payment         → PEN
Expense         → PEN
```

---

# 7. Money still carries currency

Even though one Organization uses one operating currency in V1, monetary values should conceptually remain currency-aware.

The domain should not assume:

```text
number = money
```

The correct concept remains:

```text
amount + currency
```

This preserves explicit meaning and a future evolution path.

---

# 8. Multi-currency is deferred

V1 does not implement:

- foreign-currency Sales;
- foreign-currency Purchases;
- exchange-rate management;
- realized exchange gains/losses;
- multi-currency Financial Accounts;
- currency conversion;
- FX revaluation.

These capabilities require substantial additional financial semantics.

They are deliberately deferred until real product demand justifies them.

---

# 9. Organization currency changes

Changing the operating currency after financial history exists is not an ordinary settings edit.

Doing so could invalidate the interpretation of:

- Sales;
- Purchases;
- Payments;
- Receivables;
- Payables;
- Expenses;
- Financial Account balances.

M6 must define the implementation policy.

The domain principle is:

> Existing historical monetary values must never silently change currency meaning.

---

# 10. Monetary precision

Authoritative monetary amounts must support the precision required by their currency.

For normal V1 operations, amounts that represent actual settled or outstanding money are normalized to the currency's supported minor-unit precision.

For example, PEN normally represents amounts to:

```text
0.01 PEN
```

The implementation must not assume every possible currency forever uses exactly two decimal places.

---

# 11. Calculation precision

Intermediate calculations may require greater precision than the final authoritative Money amount.

Examples include:

- quantity × unit price;
- discounts;
- percentage calculations;
- derived unit costs.

Intermediate calculation precision must not be reduced prematurely.

The final authoritative monetary result is rounded according to explicit domain rules.

---

# 12. Rounding rule

Unless a future domain has a justified different rule, V1 monetary rounding uses deterministic **round-half-up** semantics at the point an authoritative Money amount must be produced.

Rounding must be:

- deterministic;
- centralized or consistently reusable;
- explicitly tested;
- independent from JavaScript floating-point behavior.

Sales and Purchasing will define exactly where transaction-level rounding occurs.

---

# 13. Historical Money is immutable

Once a commercial or financial amount becomes an authoritative historical fact, later changes to current metadata must not rewrite it.

For example:

```text
January Sale Item
unit price = S/ 5.00
```

remains:

```text
S/ 5.00
```

even if:

```text
Current Product price = S/ 6.00
```

Likewise, historical Purchase cost does not change when current Product cost metadata changes.

---

# 14. Payment

A **Payment** is an authoritative record that money was received or paid as part of settling a financial obligation or supported financial operation.

Payment answers:

> What money was actually transferred or accepted as settled?

Payment does not answer:

> What was sold?

or:

> What merchandise was received?

Those are commercial/operational facts.

---

# 15. Payment ownership

Payment belongs to **Finance**.

Sales may cause the need to collect money.

Purchasing may cause the need to pay money.

Workforce may cause supported worker-related obligations.

But those domains do not define Payment semantics independently.

---

# 16. Payment direction

A Payment has a financial direction.

Conceptually:

```text
Incoming Payment
```

means money received by the Organization.

```text
Outgoing Payment
```

means money paid by the Organization.

The amount itself should conceptually remain a positive Money magnitude.

Direction supplies the flow meaning.

This avoids mixing:

```text
-50
```

with:

```text
Outgoing 50
```

as competing conventions.

---

# 17. Payment is a successful financial fact

V1 uses `Payment` to represent money that has actually been accepted as transferred/recorded.

A failed attempt to pay is not the same thing as a Payment.

Future payment-gateway integration may introduce concepts such as:

```text
Payment Attempt
Authorization
Capture
Failure
```

Those are outside V1.

---

# 18. Payment occurrence time

A Payment has its own financial occurrence time.

Conceptually:

```text
paidAt
```

means when that monetary settlement occurred.

It must not rewrite:

```text
Sale.occurredAt
Purchase.receivedAt
Expense.incurredAt
```

---

# 19. Payment Method

A **Payment Method** describes **how** money was transferred.

Examples may include:

```text
Cash
Bank Transfer
Card
Digital Wallet
Other
```

Payment Method describes the transfer mechanism.

It does not necessarily identify where the Organization's money is stored.

---

# 20. Financial Account

A **Financial Account** represents an operational place or container where Manasiness tracks Organization money.

Examples:

```text
Caja principal
BCP soles
Yape negocio
Plin negocio
```

The exact V1 account taxonomy belongs to M6.

---

# 21. Payment Method is not Financial Account

This distinction is important.

Example:

```text
Payment Method:
Bank Transfer

Financial Account:
BCP Business Account
```

or:

```text
Payment Method:
Digital Wallet

Financial Account:
Yape negocio
```

The method answers:

> How did the money move?

The account answers:

> Where did the Organization's tracked money enter or leave?

---

# 22. Cash

`Cash` may be both:

- a Payment Method;
- money held in a cash Financial Account.

For example:

```text
Payment Method = Cash
Financial Account = Main Cash Drawer
```

The conceptual distinction remains useful even where the names appear similar.

---

# 23. Receivable

A **Receivable** represents a valid monetary obligation owed **to the Organization**.

Conceptually:

```text
Another Party
owes
Organization
```

A common source is an identified customer Sale that is not fully settled immediately.

---

# 24. Receivable creation

Sales establishes the commercial fact that may require customer payment.

Finance owns the resulting financial obligation.

Conceptually:

```text
Sales
└── Sale total = S/ 100
        │
        ▼
Finance
└── Receivable = S/ 100
```

The precise point in the Sale lifecycle that creates the Receivable belongs to Issue #8.

---

# 25. Receivable principal amount

A Receivable has an authoritative amount representing the obligation established by its source and valid financial adjustments.

That original obligation must remain historically understandable.

The system should not simply mutate:

```text
debt = current number
```

without preserving how it reached that amount.

---

# 26. Receivable settlement

A Receivable can be settled through one or more Payments.

Example:

```text
Receivable = S/ 100

Payment 1 = S/ 30
Payment 2 = S/ 50
Payment 3 = S/ 20
```

Result:

```text
Outstanding Balance = S/ 0
```

---

# 27. Receivable lifecycle

At a high level, a Receivable may conceptually be:

```text
Open
Partially Settled
Settled
Adjusted / Cancelled through explicit correction
```

These labels are conceptual.

M6/M7 will define exact implementation states if explicit stored state is necessary.

---

# 28. Settlement state should preferably be derivable

A Receivable's financial condition is primarily determined by authoritative amounts.

Conceptually:

```text
Outstanding = 100
→ Open

Outstanding = 70
→ Partially Settled

Outstanding = 0
→ Settled
```

A stored/materialized status may exist for performance or querying.

It must remain consistent with the financial facts.

---

# 29. Payable

A **Payable** represents a valid monetary obligation owed **by the Organization**.

Conceptually:

```text
Organization
owes
another Party
```

A common source is a supplier Purchase that has been received or otherwise creates an obligation before being fully paid.

---

# 30. Purchase and Payable are separate

This must be representable:

```text
Purchase merchandise received
        │
        ├── Inventory already increased
        │
        └── Payable still outstanding
```

Supplier Payment may happen later.

---

# 31. Payable settlement

A Payable can be settled through one or more outgoing Payments.

Example:

```text
Payable = S/ 500

Payment 1 = S/ 200
Payment 2 = S/ 300
```

Result:

```text
Outstanding Balance = S/ 0
```

---

# 32. Payable lifecycle

At a high level:

```text
Open
Partially Settled
Settled
Adjusted / Cancelled through explicit correction
```

The exact persistence/status representation is deferred to M6/M8.

---

# 33. Outstanding Balance

**Outstanding Balance** is the remaining unsettled amount of an obligation.

Conceptually:

```text
Outstanding Balance
=
Obligation Amount
+ valid increases
- valid reductions
- applied settlement
```

The exact adjustment taxonomy is defined later.

---

# 34. Outstanding Balance is non-negative

Ordinary settlement of a Receivable or Payable must not produce a negative Outstanding Balance.

Example:

```text
Outstanding = S/ 20
Payment application = S/ 30
```

must not result in:

```text
Outstanding = -S/ 10
```

The extra amount requires explicit treatment.

---

# 35. Balances are projections

Outstanding Balance should conceptually be derivable from authoritative obligation and settlement history.

It may be materialized/stored for efficient access.

The rule is:

> Materialized balance must agree with the authoritative financial history.

This follows the same pattern used by Inventory.

---

# 36. Partial Payment

A **Partial Payment** is an ordinary Payment whose applied amount settles only part of an outstanding obligation.

Example:

```text
Receivable = S/ 100
Payment = S/ 30
Outstanding = S/ 70
```

No special "partial Sale" is required.

The commercial Sale remains the same Sale.

---

# 37. Multiple partial Payments

An obligation may receive multiple partial settlements.

Example:

```text
S/ 100 Receivable

Day 1   + Payment S/ 20
Day 5   + Payment S/ 30
Day 10  + Payment S/ 50
```

Each Payment remains independently historical.

---

# 38. Payment Allocation

A **Payment Allocation** represents the amount of a Payment applied toward a specific financial obligation.

Conceptually:

```text
Payment
    │
    └── Allocation
            │
            ▼
      Receivable / Payable
```

This distinction prevents Payment from becoming structurally identical to the obligation it settles.

---

# 39. Why Allocation matters

A customer may eventually make one Payment covering several obligations.

Example:

```text
Payment received = S/ 150

Allocation:
├── Receivable A = S/ 100
└── Receivable B = S/ 50
```

Likewise, one supplier Payment might cover several Payables.

The V1 UI may initially emphasize simple one-obligation Payments.

The domain should not require Payment and obligation to be permanently one-to-one.

---

# 40. Allocation cannot exceed Payment

For one Payment:

```text
sum(allocations)
```

must not exceed:

```text
Payment amount
```

unless a future explicit concept explains the difference.

---

# 41. Allocation cannot over-settle an obligation

A Payment Allocation must not ordinarily exceed the target obligation's current Outstanding Balance.

This protects exact settlement.

---

# 42. Unallocated Payment

V1 should avoid creating unexplained unallocated customer/supplier money by default.

If money is intentionally received in advance or retained beyond existing obligations, that requires a separate explicit concept such as:

```text
Customer Advance
Customer Credit Balance
Supplier Advance
```

Those concepts are not required for initial V1.

---

# 43. Overpayment policy

V1 does **not** silently convert overpayment into negative debt.

Attempting to apply more than the Outstanding Balance should be rejected unless a supported explicit advance/credit workflow exists.

Example:

```text
Outstanding = S/ 50
Attempted allocation = S/ 60
```

Ordinary result:

```text
Rejected
```

not:

```text
Customer debt = -S/ 10
```

---

# 44. Cash tender and change

Physical cash tender is a user-interaction concern distinct from settlement amount.

Example:

```text
Sale total = S/ 15
Customer gives S/ 20
Change = S/ 5
```

The amount settling the Sale is:

```text
S/ 15
```

not an S/20 overpayment.

M6/M7 UI may capture tendered amount to calculate change.

That does not create a S/5 customer credit.

---

# 45. Customer credit

`Customer credit` is an ambiguous phrase.

In Manasiness V1, the primary meaning is:

> The Organization permits a customer to complete a Sale without immediate full settlement, creating a Receivable.

Conceptually:

```text
Credit Sale
→ Receivable
```

---

# 46. Customer debt

Customer debt is not an independent mutable number.

It is the financial position represented by one or more outstanding Receivables.

Conceptually:

```text
Customer outstanding debt
=
sum(outstanding customer Receivables)
```

where applicable.

---

# 47. Customer credit limit

A future Customer Relationship may have a policy such as:

```text
Credit Limit = S/ 500
```

This would be a commercial risk/control policy, not the financial debt itself.

Credit-limit enforcement is not required by this M0 issue and may be introduced in M4/M7 if useful for V1.

---

# 48. Customer advance balance

Money intentionally received from a customer before an obligation exists is conceptually different from a Receivable settlement.

A future product may support:

```text
Customer Advance / Credit Balance
```

V1 does not need this capability to support ordinary credit Sales and partial Payments.

---

# 49. Supplier debt

Supplier debt means the Organization's outstanding financial obligations to a Supplier.

Conceptually:

```text
Supplier outstanding debt
=
sum(outstanding Payables to supplier)
```

It is not determined by whether inventory has been received.

---

# 50. Expense

An **Expense** represents an operational economic cost recognized by Manasiness that is not already better represented by another supported commercial domain concept.

Examples may eventually include:

- rent;
- electricity;
- internet;
- transportation;
- cleaning;
- professional services;
- miscellaneous operating cost.

---

# 51. Expense is not Payment

This is valid:

```text
Expense incurred today
Payment next week
```

Therefore:

```text
Expense ≠ Payment
```

An Expense describes why the Organization incurred a cost.

Payment describes money settlement.

---

# 52. Expense may be paid immediately

Example:

```text
Taxi expense = S/ 20
paid immediately in cash
```

Conceptually:

```text
Expense
+
Outgoing Payment
+
Cash Movement
```

These may be created through one user workflow while remaining distinct concepts.

---

# 53. Expense may remain payable

Example:

```text
Electricity bill = S/ 300
due next week
```

Conceptually:

```text
Expense
+
Payable
```

Later:

```text
Payment
→ settles Payable
```

The exact V1 expense/payable workflow belongs to M6.

---

# 54. Purchase is not automatically Expense

Purchasing inventory and recognizing an operating Expense are different concepts.

Example:

```text
Buy 100 bottles for resale
```

is a Purchase.

Manasiness V1 must not automatically describe that as an Expense merely because money eventually leaves the business.

Full inventory accounting/COGS treatment is outside V1.

---

# 55. Revenue

At the product level, **Revenue** represents value generated by supported commercial Sales according to the reporting definition adopted by Manasiness.

Revenue is not synonymous with cash collection.

Example:

```text
Credit Sale = S/ 100
Cash received today = S/ 0
```

Yet the business still completed a Sale worth S/100.

---

# 56. Cash received is not Revenue

Receiving money can occur without new Revenue.

Example:

```text
Customer pays an old Receivable today
```

Today's cash increases.

The original Sale did not happen today.

Therefore:

```text
Cash received today
≠
Sales today
```

---

# 57. Cash paid is not Expense

Paying money can occur without creating a new Expense at that moment.

Example:

```text
Supplier Payable created last week
Payment made today
```

Today's cash decreases.

That does not mean a new Purchase or Expense happened today.

---

# 58. Revenue, Expense, and Cash Movement

These three concepts must remain distinct.

```text
Revenue
→ economic/commercial value generated

Expense
→ operational economic cost recognized

Cash Movement
→ tracked money physically/financially moved
```

They may correlate.

They are not synonyms.

---

# 59. Profit

Manasiness V1 should not display a metric called:

```text
Profit
```

unless its calculation is explicitly and correctly defined.

The Legacy metric:

```text
paid sales - paid purchases
```

must not return under a misleading label.

V1 may provide operational metrics such as:

- Sales amount;
- Expenses;
- cash in;
- cash out;
- Receivables;
- Payables.

More advanced profitability semantics belong to later reporting/product work.

---

# 60. Cash Movement

A **Cash Movement** represents a change in money tracked by a Financial Account.

Conceptually:

```text
Financial Account
        │
        └── Cash Movement
```

Examples:

- incoming customer Payment;
- outgoing supplier Payment;
- outgoing Expense Payment;
- opening balance;
- explicit cash adjustment;
- transfer between Organization accounts.

---

# 61. Payment normally creates Cash Movement

An incoming Payment applied to a tracked Financial Account creates an incoming Cash Movement.

An outgoing Payment creates an outgoing Cash Movement.

Conceptually:

```text
Payment
→ Cash Movement
→ Financial Account Balance
```

---

# 62. Cash Movement is not always Payment

Moving money between the Organization's own accounts is not an external Payment.

Example:

```text
Main Cash Drawer -S/ 500
BCP Account      +S/ 500
```

This is an internal Financial Transfer.

No Revenue or Expense is created merely by moving money.

---

# 63. Financial Transfer

A **Financial Transfer** represents movement of money between two Organization-owned Financial Accounts.

Conceptually:

```text
Source Account
      -500
        │
        ▼
Financial Transfer
        │
        ▼
Destination Account
      +500
```

The Organization's total money has not increased or decreased because of the Transfer itself.

---

# 64. Financial Account Balance

A Financial Account may expose a current Balance.

Conceptually, that balance is derived from:

```text
Opening Balance
+
incoming Cash Movements
-
outgoing Cash Movements
```

The implementation may materialize it.

The history remains the explanation.

---

# 65. Financial Account balance is not manually overwritten

Ordinary editing of a Financial Account must not silently change its Balance.

If actual cash differs from recorded cash, the system should use an explicit financial adjustment/reconciliation operation with an explanation.

The detailed workflow belongs to M6.

---

# 66. Opening financial balance

An existing business adopting Manasiness may already have money in tracked accounts.

An explicit Opening Balance can establish that starting point.

Example:

```text
Main Cash Drawer
Opening Balance +S/ 200
```

This preserves explainability from the beginning.

---

# 67. Payment correction principle

An authoritative Payment should not be silently modified or deleted when the financial fact was recorded incorrectly.

Correction should preserve:

- original Payment;
- corrective action;
- Actor;
- time;
- relationship between them.

---

# 68. Payment reversal

A **Payment Reversal** neutralizes the settlement effect of a previous Payment or Payment Allocation while preserving the original historical record.

Example:

```text
Payment +S/ 100
recorded incorrectly

Reversal
-S/ 100 settlement effect
```

The original Payment remains visible as reversed.

---

# 69. Payment recorded in error

If an operator accidentally records:

```text
S/ 100
```

instead of:

```text
S/ 10
```

the preferred conceptual correction is:

```text
Original Payment S/ 100
→ Reverse

New Payment S/ 10
→ Record
```

not silently changing the historical amount from 100 to 10.

---

# 70. Duplicate Payment

If the same real Payment is recorded twice:

```text
Payment A = S/ 50
Payment B = S/ 50
```

one erroneous duplicate should be explicitly reversed.

It should not simply disappear from history.

---

# 71. Refund

A **Refund** represents money intentionally returned after a valid prior commercial/payment event.

A Refund is not the same thing as correcting an erroneous Payment record.

Example:

```text
Customer legitimately paid S/ 100
Later business returns S/ 20
```

That may create an outgoing Refund Payment of S/20.

The original S/100 Payment remains historically valid.

---

# 72. Refund and Inventory are independent

Returning money does not prove merchandise returned physically.

Example:

```text
Refund S/ 20
```

does not automatically mean:

```text
Inventory +1
```

Sales defines the commercial return/refund context.

Inventory independently records physical return where applicable.

Finance records the monetary consequence.

---

# 73. Reversal versus Refund

Use the concepts differently:

```text
Reversal
→ original financial record was erroneous, voided, or neutralized

Refund
→ original financial event was valid, but money is intentionally returned later
```

This distinction preserves history.

---

# 74. Adjustment

A **Financial Adjustment** explicitly changes an obligation or balance where an ordinary Payment is not the correct explanation.

Examples might eventually include:

- correcting an incorrectly established obligation;
- authorized debt forgiveness;
- specific reconciliation.

Adjustments must preserve an explicit reason.

The detailed taxonomy belongs to M6.

---

# 75. Debt forgiveness

If an Organization intentionally decides not to collect part of a legitimate Receivable, that is not a Payment.

Conceptually:

```text
Receivable outstanding = S/ 100

Authorized forgiveness = S/ 20

Outstanding = S/ 80
```

A specific financial adjustment is required.

The system must not fabricate an incoming Payment of S/20.

---

# 76. Supplier forgiveness/adjustment

Likewise, if a Supplier formally reduces an outstanding Payable, that is not an outgoing Payment.

It requires an explicit Payable adjustment/correction according to Finance rules.

---

# 77. Cancellation of source transaction

If a Sale or Purchase is legitimately cancelled before or after creating financial obligations, the owning commercial domain determines the business cancellation.

Finance then performs the required financial correction.

Finance must not independently rewrite the Sale/Purchase to make its own balances match.

---

# 78. Historical settlement is immutable

An authoritative financial history should answer:

- what obligation existed;
- which Payments occurred;
- how each Payment was applied;
- what was reversed;
- what was refunded;
- what adjustments were made;
- what remains outstanding.

Current Balance must not be obtained by hiding prior mistakes.

---

# 79. Settlement status

At the product level, settlement can be described as:

```text
Unpaid
Partially Settled
Settled
```

and, where relevant:

```text
Corrected / Reversed
```

Exact stored status values are deferred.

The authoritative condition comes from financial facts.

---

# 80. Sale operational status versus settlement status

These are independent.

Examples:

```text
Sale operationally completed
Settlement = Unpaid
```

```text
Sale operationally completed
Settlement = Partially Settled
```

```text
Sale operationally completed
Settlement = Settled
```

A Sale is not operationally invalid merely because the customer still owes money.

---

# 81. Purchase receipt versus settlement status

These are also independent.

Examples:

```text
Purchase merchandise received
Settlement = Unpaid
```

```text
Purchase merchandise received
Settlement = Partially Settled
```

```text
Purchase merchandise received
Settlement = Settled
```

Payment does not determine whether the merchandise exists in Inventory.

---

# 82. Customer history

Finance should allow Customer history to eventually show:

```text
Sales
Receivables
Payments
Outstanding Balance
Refunds
Adjustments
```

Parties owns Customer identity.

Sales owns Sales.

Finance owns the financial history.

---

# 83. Supplier history

Supplier history may eventually show:

```text
Purchases
Payables
Payments
Outstanding Balance
Adjustments
```

Purchasing owns Purchase facts.

Finance owns settlement.

---

# 84. Workforce collaboration

Workforce may establish supported worker-related financial obligations.

Finance owns any Payment/Payable semantics used to settle them.

Workforce must not invent a second money model.

V1 does not become a payroll system.

---

# 85. Payment authorization

Recording, reversing, refunding, or materially adjusting money is consequential.

These actions should eventually require explicit authorization capabilities.

The exact permission model belongs to M3/M6.

---

# 86. Payment auditability

Material financial actions should preserve appropriate attribution.

Examples:

```text
Payment recorded
Payment reversed
Refund issued
Receivable adjusted
Payable adjusted
Financial Account adjustment
```

Auditability should preserve Actor and Organization context.

---

# 87. Payment idempotency

Recording the same logical Payment twice can corrupt:

- outstanding debt;
- cash balances;
- reporting.

Retryable Payment commands therefore require idempotency protection.

Example:

```text
Client sends RecordPayment
network times out
client retries
```

must not automatically create:

```text
Payment #1
Payment #2
```

for one real payment.

Exact implementation belongs to M6.

---

# 88. Payment Allocation transaction integrity

Applying a Payment must preserve consistency between:

```text
Payment
Allocation
Obligation Outstanding Balance
Cash Movement
Financial Account Balance
```

where all are part of the same authoritative financial operation.

Partial success must not create contradictory money state.

Exact transaction implementation is deferred.

---

# 89. Concurrency

Settlement is concurrency-sensitive.

Example:

```text
Receivable Outstanding = S/ 100

Operator A applies S/ 70
Operator B applies S/ 70
```

Both operations cannot independently succeed if that produces over-settlement.

M6 must implement concurrency-safe settlement.

This issue does not choose the locking strategy.

---

# 90. Financial Accounts are Organization-scoped

Financial Accounts belong to one Organization.

Conceptually:

```text
Organization A
├── Caja
└── BCP

Organization B
├── Caja
└── BBVA
```

Balances must never cross tenants.

---

# 91. Party-scoped debt is Organization-scoped

The same real-world person may exist as a Party in two Organizations.

Their debt remains isolated.

Example:

```text
Organization A
Juan owes S/ 100

Organization B
Juan owes S/ 20
```

These balances must never be automatically merged.

---

# 92. Reporting semantics

Reporting must use precise metric names.

Prefer:

```text
Sales amount
Cash received
Cash paid
Outstanding Receivables
Outstanding Payables
Operational Expenses
```

over vague:

```text
Income
```

when the underlying calculation mixes unrelated financial concepts.

---

# 93. Sales report versus cash report

A Sales report answers:

> What commercial Sales happened?

A cash report answers:

> What money actually entered or left Financial Accounts?

They may differ substantially when credit exists.

---

# 94. Receivables report

Receivables reporting should answer questions such as:

- total outstanding;
- outstanding by Customer;
- partially settled obligations;
- overdue obligations where due-date support exists;
- recent Payments.

Due-date semantics are refined in M6/M7.

---

# 95. Payables report

Payables reporting should answer:

- total owed to Suppliers;
- outstanding by Supplier;
- partial settlements;
- due obligations where applicable;
- recent outgoing Payments.

---

# 96. Cash report

Cash-management reporting may answer:

- current Financial Account balances;
- incoming Payments;
- outgoing Payments;
- Transfers;
- explicit adjustments.

It must not label all incoming Cash Movement as Revenue.

---

# 97. V1 accounting boundary

Manasiness V1 is an **operational finance system**, not a general accounting ledger.

It manages business information needed for day-to-day operation.

It does not implement full double-entry accounting.

---

# 98. Explicitly outside V1

V1 does not require:

```text
General Ledger
Chart of Accounts
Journal Entries
Debit / Credit bookkeeping engine
Balance Sheet
Income Statement under accounting standards
Tax accounting
Bank reconciliation engine
Accounts aging under statutory rules
Accrual accounting engine
Inventory valuation accounting
Foreign-exchange accounting
```

Some operational reports may resemble parts of accounting.

That does not make Manasiness the statutory accounting source of truth.

---

# 99. Integration with future accounting systems

The domain should preserve high-quality historical data so future integrations can export relevant facts to dedicated accounting systems.

Manasiness should not recreate those systems prematurely.

---

# 100. Example — immediate cash Sale

Commercial fact:

```text
Sale = S/ 50
```

Settlement:

```text
Incoming Payment = S/ 50
```

Cash:

```text
Main Cash Drawer +S/ 50
```

Receivable:

```text
none / immediately settled according to Sales-Finance orchestration
```

All of this may happen through one user action.

The concepts remain distinct.

---

# 101. Example — credit Sale

Day 1:

```text
Sale = S/ 100
Receivable = S/ 100
Cash received = S/ 0
Outstanding = S/ 100
```

Day 5:

```text
Payment = S/ 30
Outstanding = S/ 70
```

Day 15:

```text
Payment = S/ 70
Outstanding = S/ 0
```

The Sale occurred on Day 1 throughout the entire history.

---

# 102. Example — Purchase on supplier credit

Day 1:

```text
Purchase = S/ 500
Goods received
Inventory increases
Payable = S/ 500
Cash paid = S/ 0
```

Day 10:

```text
Outgoing Payment = S/ 200
Outstanding Payable = S/ 300
```

Day 30:

```text
Outgoing Payment = S/ 300
Outstanding Payable = S/ 0
```

Inventory does not wait for Payment.

---

# 103. Example — Expense paid immediately

```text
Electricity Expense = S/ 150
Outgoing Payment = S/ 150
BCP Account = -S/ 150 Cash Movement
```

Expense and Payment happen together.

They remain separately meaningful.

---

# 104. Example — Expense paid later

Day 1:

```text
Internet Expense = S/ 120
Payable = S/ 120
Cash Movement = none
```

Day 7:

```text
Outgoing Payment = S/ 120
Payable Outstanding = S/ 0
Cash Movement = -S/ 120
```

---

# 105. Example — Payment error

Operator records:

```text
S/ 500
```

but actual Payment was:

```text
S/ 50
```

Correct history:

```text
Payment S/ 500
Reversal of S/ 500
Payment S/ 50
```

Incorrect history:

```text
edit original Payment from 500 → 50
```

---

# 106. Example — Refund

Original:

```text
Sale = S/ 100
Incoming Payment = S/ 100
```

Later valid Refund:

```text
Outgoing Refund = S/ 30
```

Original Payment remains valid.

Sales determines the commercial reason.

Finance records the monetary consequence.

Inventory only changes if physical goods also return.

---

# 107. Example — financial transfer

```text
Cash Drawer = -S/ 300
BCP Account = +S/ 300
```

Organization total money:

```text
unchanged
```

No Sale.

No Purchase.

No Revenue.

No Expense.

---

# 108. Example — customer pays two debts

Before:

```text
Receivable A = S/ 100
Receivable B = S/ 50
```

Customer pays:

```text
Payment = S/ 150
```

Allocations:

```text
A = S/ 100
B = S/ 50
```

Result:

```text
A Outstanding = S/ 0
B Outstanding = S/ 0
```

One Payment can therefore participate in settling multiple obligations.

---

# 109. Example — attempted over-settlement

Outstanding:

```text
S/ 80
```

Attempted allocation:

```text
S/ 100
```

Without an explicit advance-credit capability:

```text
reject
```

Do not create:

```text
Outstanding = -S/ 20
```

---

# 110. Example — debt forgiveness

Customer legitimately owes:

```text
S/ 100
```

Business decides to forgive:

```text
S/ 25
```

Correct:

```text
Financial Adjustment / Forgiveness = S/ 25
Outstanding = S/ 75
```

Incorrect:

```text
Fake Payment = S/ 25
```

because no money was actually received.

---

# 111. Core Money invariants

1. Money always has currency meaning.
2. Financial arithmetic uses exact decimal semantics.
3. Authoritative monetary rounding is deterministic.
4. V1 uses one operating currency per Organization.
5. Historical Money values are not rewritten by later Catalog changes.
6. Changing Organization currency must not reinterpret historical records.

---

# 112. Core Payment invariants

1. Payment is owned by Finance.
2. Payment represents an authoritative monetary transfer/settlement fact.
3. Payment has its own occurrence time.
4. Payment does not determine Sale/Purchase operational lifecycle.
5. Payment Method and Financial Account are distinct.
6. Payment corrections preserve the original historical record.
7. Retryable Payment commands must be idempotent.
8. Payment application cannot silently over-settle an obligation.

---

# 113. Core Receivable invariants

1. Receivable represents money owed to the Organization.
2. Receivable is not the Sale itself.
3. Receivable may be partially settled.
4. Outstanding Balance must remain exact.
5. Ordinary settlement cannot make Outstanding Balance negative.
6. Customer debt derives from outstanding Receivables.
7. Forgiveness/corrections are not fabricated Payments.
8. Historical settlement remains traceable.

---

# 114. Core Payable invariants

1. Payable represents money owed by the Organization.
2. Payable is not the Purchase itself.
3. Merchandise may be received while Payable remains open.
4. Payable may be partially settled.
5. Supplier debt derives from outstanding Payables.
6. Settlement does not affect Inventory receipt timing.
7. Corrections remain explicit.

---

# 115. Core Expense invariants

1. Expense is not synonymous with Payment.
2. Expense may be immediately paid or remain payable.
3. Inventory Purchase is not automatically an operational Expense.
4. Expense history must remain understandable after settlement.
5. Expense reporting and cash reporting remain separate.

---

# 116. Core cash-management invariants

1. Financial Account belongs to one Organization.
2. Cash Movement explains tracked account balance changes.
3. Payments normally create corresponding Cash Movements.
4. Internal Transfers do not create Revenue or Expense.
5. Financial Account balances are projections of financial history.
6. Balance corrections require explicit adjustments rather than silent editing.

---

# 117. Ownership matrix

| Concept | Owner |
|---|---|
| Money semantics | Finance |
| Organization operating currency | Organizations + Finance policy |
| Payment | Finance |
| Payment Method | Finance |
| Payment Allocation | Finance |
| Receivable | Finance |
| Payable | Finance |
| Outstanding Balance | Finance |
| Expense | Finance |
| Financial Account | Finance |
| Cash Movement | Finance |
| Financial Transfer | Finance |
| financial reversal/correction | Finance |
| Sale | Sales |
| Purchase | Purchasing |
| Customer identity | Parties |
| Supplier identity | Parties |
| Worker identity/relationship | Parties / Workforce |
| Inventory quantity | Inventory |

---

# 118. Sales collaboration

Sales owns:

```text
Sale
Sale Item
commercial lifecycle
historical commercial amounts
```

Finance owns:

```text
Receivable
Payment
settlement
cash consequence
```

Conceptually:

```text
Sale
   │
   └── establishes financial obligation
            │
            ▼
          Finance
```

---

# 119. Purchasing collaboration

Purchasing owns:

```text
Purchase
Purchase Item
receipt/commercial lifecycle
historical acquisition amounts
```

Finance owns:

```text
Payable
Payment
settlement
cash consequence
```

---

# 120. Inventory collaboration

Finance must not directly mutate Inventory.

Likewise, Inventory must not determine whether financial settlement occurred.

Example:

```text
Supplier Payment
```

does not create Inventory.

```text
Purchase Receipt
```

does not automatically create a Payment.

---

# 121. Operational Assistant collaboration

The Assistant may support queries such as:

```text
"¿Cuánto me debe Juan?"
```

Conceptually:

```text
Assistant
→ resolve Juan within Organization
→ Finance capability
→ Customer outstanding Receivables
```

For:

```text
"Registra un pago de 50 soles de Juan"
```

the Assistant must:

- resolve the correct Party;
- determine relevant outstanding obligation(s);
- clarify ambiguity;
- validate amount;
- obtain authorization;
- confirm where required;
- call the Finance application capability.

It must not directly edit a debt balance.

---

# 122. Reporting collaboration

Reporting consumes canonical Finance facts.

It must not independently reconstruct different definitions of:

- Receivable;
- Payable;
- Payment;
- Account Balance;
- Expense.

If Reporting needs a financial metric, the metric must have an explicit definition.

---

# 123. Deliberately deferred to M6

M6 will define implementation behavior including:

- concrete Money representation;
- supported currency metadata;
- Financial Account types;
- Payment Method configuration;
- Payment persistence;
- Payment Allocation persistence;
- balance materialization;
- Expense workflow;
- opening balances;
- financial adjustments;
- reversal mechanics;
- due dates;
- authorization;
- concurrency;
- transaction boundaries;
- idempotency persistence;
- API contracts;
- reporting projections.

---

# 124. Deferred to Sales/Purchasing milestones

M7 defines:

- when a Sale creates a Receivable;
- immediate settlement orchestration;
- Sale cancellation/refund interaction;
- customer credit UX;
- historical Sale totals.

M8 defines:

- when a Purchase creates a Payable;
- receipt versus invoice/obligation semantics;
- supplier settlement UX;
- Purchase correction interaction.

---

# 125. Post-V1 / future finance capabilities

The following should not be implemented speculatively:

- foreign currencies;
- exchange rates;
- customer advance balances;
- supplier advances;
- payment gateway orchestration;
- card authorization/capture lifecycle;
- automated bank feeds;
- automated reconciliation;
- interest calculation;
- loans;
- installment financing engine;
- general ledger;
- tax accounting;
- statutory accounting;
- formal accounts receivable aging standards;
- accounting inventory valuation.

---

# 126. Non-goals

This document does not define:

- database schema;
- accounting journal entries;
- chart of accounts;
- tax treatment;
- payment gateway provider;
- bank integration;
- invoice legality;
- statutory bookkeeping;
- double-entry accounting.

---

# 127. Decision summary

Manasiness V1 adopts the following Finance model:

```text
Commercial operation
      │
      ▼
Financial obligation
      │
      ├── Receivable
      └── Payable
             │
             ▼
          Payment
             │
             ▼
        Allocation
             │
             ▼
      Outstanding Balance
```

Money movement is modeled separately:

```text
Payment
   │
   ▼
Cash Movement
   │
   ▼
Financial Account
```

The key distinctions are:

```text
Sale ≠ Payment
Purchase ≠ Payment
Receipt ≠ Supplier Payment

Revenue ≠ Cash Received
Expense ≠ Cash Paid
Purchase ≠ Expense

Payment Method ≠ Financial Account

Customer debt
= outstanding Receivables

Supplier debt
= outstanding Payables
```

V1 supports:

```text
Immediate settlement
Partial settlement
Deferred settlement
Receivables
Payables
Payments
Expenses
Financial Accounts
Cash Movements
Transfers
Explicit reversals/corrections
```

while deliberately remaining below the complexity of a full accounting platform.

The central Finance invariant is:

> **Manasiness must be able to explain separately what commercial obligation existed, what money actually moved, how that money was applied, and what remains outstanding.**