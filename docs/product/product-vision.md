# Manasiness — Product Vision

> **Status:** Active  
> **Milestone:** M0 — Product & Domain Foundation  
> **Scope:** Manasiness V1  
> **Purpose:** Define the product direction, target users, V1 capability boundary, non-goals, and principles that guide future product and engineering decisions.

---

## 1. Why this document exists

Manasiness is being rebuilt as a new product.

The legacy application remains useful as evidence of previous workflows, user needs, successful ideas, and modeling mistakes, but it is not the product or architecture source of truth for the new system.

This document defines the product contract for Manasiness V1 before implementation details begin shaping the product accidentally.

It establishes:

- who Manasiness is for;
- which problems it intends to solve;
- which capabilities belong in V1;
- which capabilities are deliberately excluded or deferred;
- which principles should guide future trade-offs;
- what Manasiness must remain even as its technical implementation evolves.

This document intentionally does **not** define:

- database tables;
- API endpoints;
- framework choices;
- UI screen designs;
- module structures;
- detailed domain state machines.

Those decisions belong to later domain and engineering work.

---

# 2. Product vision

Manasiness is an operating system for small businesses that need one trustworthy place to manage and understand their daily commercial operation.

It connects the information around:

- products;
- inventory;
- sales;
- purchases;
- customers;
- suppliers;
- workers;
- payments;
- expenses;
- receivables;
- payables;
- and operational history.

Many small businesses currently operate through a combination of memory, notebooks, spreadsheets, messaging applications, informal debt records, disconnected tools, or software that introduces more complexity than the business actually needs.

The problem is not only that information is scattered.

The deeper problem is that the owner often cannot reliably answer simple operational questions:

- What did I sell today?
- How much money actually entered?
- Which customers still owe me?
- How much do I owe my suppliers?
- Why does the system say I have 14 units of a product?
- Who changed this information?
- When did this stock enter?
- Which supplier do I buy this product from most often?
- What happened to this sale after it was created?
- Which products are about to run out?

Manasiness should make these questions easy to answer without requiring the operator to understand accounting software, database concepts, or enterprise processes.

---

# 3. Product promise

The core Manasiness promise is:

> **Know what entered, what left, who was involved, what remains pending, and why.**

Manasiness should provide a reliable operational picture of the business while remaining simple enough to use every day.

It should not merely store current values.

Important business state should be explainable through its history.

For example, the product should not only know that a product has 14 units available.

When relevant, it should be able to explain that quantity through business events such as:

```text
+20 supplier purchase
 -4 customer sales
 -1 damaged item
 -1 manual correction
---------------
 14 available
```

The product should make the current state easy to use while keeping enough history to trust it.

---

# 4. Target businesses

## 4.1 Primary target

Manasiness V1 is primarily intended for small and growing commercial businesses where the owner or a small operational team is directly involved in daily activity.

Representative businesses include:

- neighborhood stores;
- independent retailers;
- specialized shops;
- small wholesalers;
- distributors;
- family businesses;
- businesses that regularly replenish merchandise;
- businesses that sell both immediately and on credit;
- businesses with recurring suppliers;
- businesses with recurring customers;
- businesses with workers who perform different operational responsibilities.

Manasiness is not restricted to a specific industry as long as the business fundamentally operates around commercial transactions, inventory, counterparties, and operational money movement.

---

## 4.2 Initial operating assumptions

V1 assumes organizations generally have:

- a small or medium operational team;
- one primary business operation;
- a manageable but meaningful product catalog;
- regular sales;
- regular purchases;
- recurring suppliers;
- anonymous and identified customers;
- workers with different responsibilities;
- operational expenses;
- customer or supplier balances that may remain pending;
- little or no dedicated IT staff.

These assumptions define the initial product focus.

They do not define permanent architectural limits.

The system should avoid decisions that make reasonable future growth unnecessarily expensive, while also avoiding enterprise complexity that has no demonstrated value for the initial product.

---

# 5. Primary users

## 5.1 Business owner or operator

The primary Manasiness user is the person responsible for controlling or understanding the business.

This person needs to:

- understand current business activity;
- register or supervise operations;
- know what is available in inventory;
- know what was sold;
- know what was purchased;
- know what has been paid;
- know what remains pending;
- identify important customers and suppliers;
- inspect operational history;
- delegate work safely;
- detect discrepancies quickly;
- make day-to-day decisions from reliable information.

The product should optimize for clarity, speed, confidence, and control.

---

## 5.2 Authorized organization members

A business may allow other people to operate Manasiness.

Examples may include:

- cashier;
- salesperson;
- inventory operator;
- purchasing operator;
- supervisor;
- administrator.

Their access depends on their authorization within the organization.

An authenticated Manasiness user is not automatically a worker of the business.

Likewise, a worker does not automatically require Manasiness access.

---

## 5.3 Customers, suppliers, and workers

Customers, suppliers, and workers are business relationships.

They are **not authentication roles**.

A customer does not require a Manasiness account.

A supplier does not require a Manasiness account.

A worker does not require a Manasiness account.

If future functionality requires one of them to log in directly, access should be attachable without redefining or replacing their existing business identity and history.

---

# 6. Core jobs to be done

## 6.1 Understand the business

> When I operate my business, I want one place where I can understand what is happening without reconstructing information from multiple tools or from memory.

---

## 6.2 Record a normal sale quickly

> When somebody buys from me, I want to register the complete transaction quickly and accurately.

A sale should represent the real commercial transaction, not an artificial implementation detail.

One sale may contain multiple items.

---

## 6.3 Sell without creating unnecessary customer records

> When an occasional customer purchases something and I have no reason to track them individually, I want to complete the sale without creating a meaningless customer profile.

Anonymous commercial interactions must be legitimate first-class behavior.

The software should not require fake entities such as `Unknown Customer`.

---

## 6.4 Maintain history for meaningful customers

> When a customer buys regularly, makes orders, purchases on credit, owes money, or otherwise has an ongoing relationship with my business, I want their history to remain identifiable.

A customer profile exists because the business needs that relationship, not because every sale requires one.

---

## 6.5 Replenish merchandise

> When I buy merchandise from a supplier, I want to know what I purchased, what entered inventory, what it cost, and how much I still owe.

Purchasing and supplier payment are related but distinct business facts.

---

## 6.6 Understand inventory

> When stock changes, I want to know both the current quantity and the reason it changed.

Inventory should be explainable rather than represented only by an unexplained mutable number.

---

## 6.7 Track customer debt

> When a customer does not pay everything immediately, I want to know the original amount, the payments already made, and the remaining balance.

---

## 6.8 Track supplier debt

> When I receive merchandise before fully paying the supplier, I want to know what remains payable without changing the fact that the merchandise was already received.

---

## 6.9 Manage workers without forcing system accounts

> When somebody works for my business, I want to preserve their relevant operational history whether or not they ever need to log into Manasiness.

---

## 6.10 Delegate safely

> When another person uses Manasiness, I want them to access only the operations and information they are authorized to use.

---

## 6.11 Understand history

> When something looks incorrect, I want enough history to understand what happened instead of seeing only the current value.

---

## 6.12 Ask operational questions naturally

> When I need information, I want to ask Manasiness in natural language instead of manually navigating multiple reports.

Examples:

- How much did I sell today?
- How much does Juan owe me?
- How many Coca-Colas are left?
- What did I purchase from Gloria this month?
- Which products are running low?

---

# 7. Core conceptual model

The detailed domain model will be defined during M0.

However, the product establishes several foundational distinctions that later design must preserve.

---

## 7.1 Organization

An `Organization` represents a business operating within Manasiness.

It is the primary tenant and business-data boundary.

Operational information belongs to an organization unless a later domain explicitly defines otherwise.

---

## 7.2 Identity

An `Identity` represents a person capable of authenticating into Manasiness.

Identity answers:

> Who can log in?

It does not answer:

> What relationship does this person have with the business?

---

## 7.3 Organization membership

A `Membership` represents an Identity's authorization relationship with an Organization.

It answers questions such as:

- Which organization may this identity access?
- What are they allowed to do there?

Membership does not represent employment.

---

## 7.4 Party

A `Party` represents a real person or company with whom the organization maintains a meaningful business relationship.

A Party may participate in one or more relationships.

For example:

```text
Juan Pérez
└── Party
    ├── Customer
    └── Supplier
```

A Party does not require authentication access.

---

## 7.5 Business relationships

Customer, supplier, and worker are business relationships or profiles.

They should not be represented as authentication roles.

This allows reality to be modeled without forcing artificial restrictions.

---

# 8. V1 capability map

## 8.1 Identity and access

V1 must support secure authenticated access to Manasiness.

At the product level this includes:

- identities;
- sessions;
- organization membership;
- authorization;
- permission enforcement;
- organization isolation.

The specific authentication technology and permission implementation are not defined here.

---

## 8.2 Organizations

Organizations are the primary tenant boundary.

An identity may participate in multiple organizations without requiring separate user accounts.

Information belonging to different organizations must remain isolated.

Multi-tenancy is therefore a V1 product requirement, not a hypothetical future optimization.

---

## 8.3 Parties and business relationships

V1 must support the meaningful people and companies around an organization.

This includes:

- customers;
- suppliers;
- workers;
- contacts;
- relevant business identity information.

Persistent profiles should exist when the business needs persistent history.

They should not be required merely to satisfy the software model.

---

## 8.4 Catalog

Organizations must be able to define the products relevant to their operation.

Catalog information may include the attributes needed to identify, price, buy, sell, and understand products.

Product identity and inventory quantity are separate concepts.

---

## 8.5 Inventory

V1 must maintain trustworthy information about inventory.

The product should distinguish:

```text
Product
```

from:

```text
Current inventory state
```

and from:

```text
Why inventory changed
```

Meaningful inventory changes should preserve an explainable operational reason.

Examples include:

- purchase receipt;
- sale;
- return;
- correction;
- loss;
- damage;
- adjustment.

The exact inventory model belongs to later domain work.

---

## 8.6 Operational finance

V1 must model the financial information required for normal business operation.

This includes concepts such as:

- money;
- payment;
- payment method;
- operational expense;
- cash movement;
- receivable;
- payable.

Commercial state and settlement state must remain distinct.

For example:

```text
Sale confirmed
Payment partially settled
```

is a valid business condition.

Likewise:

```text
Purchase received
Supplier partially paid
```

is valid.

---

## 8.7 Sales and receivables

A Sale represents one commercial transaction.

A Sale may:

- contain multiple items;
- involve an identified customer;
- have no persistent customer;
- be paid immediately;
- be paid partially;
- remain unpaid;
- create a receivable;
- eventually be cancelled or corrected through explicit business behavior.

Historical transaction information must remain understandable even if current product information changes later.

---

## 8.8 Purchasing and payables

A Purchase represents merchandise or products acquired from a supplier.

A Purchase may:

- contain multiple items;
- reference a supplier;
- cause inventory to enter the organization;
- be paid immediately;
- be paid partially;
- remain payable.

Receiving merchandise and paying for merchandise are distinct facts.

V1 may use a simplified purchasing lifecycle while maintaining a reasonable evolution path toward richer concepts such as:

- purchase orders;
- goods receipts;
- supplier invoices.

These richer concepts are not automatically V1 requirements.

---

## 8.9 Workforce

V1 must support operational worker records.

A worker:

- may exist without login access;
- may optionally be linked to an authenticated identity;
- may optionally also have an organization membership;
- retains historical relevance after leaving the business.

Employment relationship and system authorization are different concepts.

---

## 8.10 Operational Assistant

V1 should provide a conversational operational interface over trusted Manasiness capabilities.

The assistant should initially use a deterministic intent-based model.

Conceptually:

```text
User message
    ↓
Intent recognition
    ↓
Entity / slot resolution
    ↓
Validation
    ↓
Authorization
    ↓
Application capability
    ↓
Result
```

Representative queries include:

- "¿Cuánto vendí hoy?"
- "¿Cuánto me debe Juan?"
- "¿Cuántas Coca-Colas quedan?"
- "Muéstrame las compras a Gloria del último mes."

Controlled commands may include interactions such as:

- "Registra 2 Coca-Colas a Juan."

The assistant must not become an independent implementation of business rules.

It should execute the same trusted capabilities available to other product interfaces.

Generative AI is not required for V1.

A future NLU or LLM system may improve language interpretation while remaining constrained by:

- supported intents;
- validation;
- authorization;
- confirmations;
- existing application capabilities.

---

## 8.11 Reporting and business insights

V1 should transform operational information into useful business understanding.

Reporting should help users understand:

- sales;
- purchasing;
- inventory;
- customers;
- suppliers;
- receivables;
- payables;
- cash movement;
- operational expenses;
- trends and changes over time.

Reports should consume canonical domain information rather than recreate separate versions of business rules.

---

# 9. Multi-tenant direction

Manasiness is designed as a multi-tenant SaaS from the beginning.

The primary tenant boundary is the Organization.

A single Identity may eventually participate in:

```text
Identity
├── Organization A
├── Organization B
└── Organization C
```

without requiring three independent accounts.

Business data must remain isolated between organizations.

V1 does not require:

- subsidiaries;
- legal-entity hierarchies;
- consolidated accounting;
- complex organization trees;
- inter-company transactions.

Those capabilities may be considered later if real product needs justify them.

---

# 10. Operational Assistant role

The Operational Assistant is an interface into Manasiness.

It is not an independent source of truth.

The assistant must therefore follow several product-level expectations.

It must:

- respect organization boundaries;
- respect permissions;
- use trusted application capabilities;
- avoid bypassing business invariants;
- clarify consequential ambiguity;
- distinguish read operations from state-changing operations;
- require confirmation according to the risk of the action;
- preserve attribution of actions;
- fail clearly when a request cannot be interpreted safely.

For example, if a user says:

> Registra dos Coca-Colas a Juan.

and the organization contains:

```text
Juan Pérez
Juan Torres
```

the assistant should not arbitrarily select one.

It should request clarification.

The value of the assistant comes from reducing operational friction, not from pretending to understand uncertain requests.

---

# 11. Product principles

## 11.1 Correctness before convenience when business history is at risk

Convenience must not silently corrupt important operational history.

When history matters, correctness takes priority.

---

## 11.2 Simple for the operator, structured internally

The user should not need to understand Manasiness's internal domain model.

Necessary complexity belongs inside the product.

---

## 11.3 Traceability over unexplained state

Important state should be explainable.

A current value is less trustworthy when the product cannot explain how it reached that value.

---

## 11.4 Model reality instead of inventing fake entities

The system should not create artificial business records simply because implementation becomes easier.

Therefore:

- casual sales do not require fake customers;
- workers do not require login accounts;
- suppliers do not become application users merely because they exist;
- authentication roles do not represent commercial relationships.

---

## 11.5 Separate concepts with different lifecycles

If two concepts can change independently, they should not be unnecessarily collapsed into the same state.

Important examples include:

```text
Identity ≠ Worker

Membership ≠ Employment

Product ≠ Inventory

Sale lifecycle ≠ Payment lifecycle

Purchase receipt ≠ Supplier payment

Current price ≠ Historical sale price
```

---

## 11.6 Historical facts remain understandable

Changes to current master data must not make historical transactions misleading or impossible to interpret.

---

## 11.7 One source of business truth

Different interfaces should not implement independent versions of the same rule.

The web application, Operational Assistant, future integrations, and future clients should operate through the same trusted business capabilities.

---

## 11.8 Ambiguity should be explicit

When Manasiness cannot determine the user's intention confidently enough for a consequential operation, it should ask rather than guess.

---

## 11.9 Extensible does not mean over-engineered

Manasiness should avoid obvious architectural dead ends.

It should also avoid infrastructure, abstractions, and complexity justified only by hypothetical future scale.

---

## 11.10 Architecture should match domain complexity

Complex business rules deserve explicit boundaries.

Simple capabilities should remain simple.

Professional engineering means appropriate structure rather than maximum structure.

---

## 11.11 Consequential automation remains understandable

Automation may reduce repetitive work.

It must not make important business changes invisible or inexplicable.

The operator should remain able to understand what Manasiness changed and why.

---

## 11.12 Tenant isolation is product correctness

Cross-organization information leakage is not merely an infrastructure problem.

It represents a fundamental product failure.

Organization isolation must therefore be treated as part of core correctness from the beginning.

---

# 12. V1 non-goals

V1 intentionally does not attempt to solve every business problem.

---

## 12.1 Full accounting system

V1 will not implement:

- complete double-entry accounting;
- general ledger;
- statutory bookkeeping;
- complete financial statements;
- jurisdiction-specific tax accounting.

Manasiness may later integrate with accounting systems.

---

## 12.2 Full payroll or HRIS

V1 will not attempt to provide:

- payroll calculation;
- payroll taxes;
- employee benefits;
- recruiting;
- performance management;
- complete legal labor compliance;
- enterprise HR functionality.

Workforce capabilities serve operational business needs.

---

## 12.3 Enterprise procurement

V1 does not require an enterprise procurement suite containing every possible stage such as:

```text
Requisition
→ Approval
→ Purchase Order
→ Goods Receipt
→ Supplier Invoice
→ Matching
→ Payment
```

The initial purchasing model should remain useful and correct while allowing future evolution where justified.

---

## 12.4 Advanced warehouse management

V1 does not aim to provide:

- warehouse topology optimization;
- pick/pack workflows;
- routing;
- automated replenishment planning;
- material-handling automation;
- enterprise warehouse orchestration.

---

## 12.5 Manufacturing

V1 does not include:

- bills of materials;
- manufacturing execution;
- production planning;
- production scheduling.

---

## 12.6 E-commerce platform

V1 is not a storefront builder or marketplace.

Customer-facing online commerce may later integrate with Manasiness but is not part of its initial operating-system scope.

---

## 12.7 Full CRM

Customer history belongs in Manasiness where relevant to operation.

V1 does not attempt to provide a complete:

- sales pipeline;
- marketing automation system;
- campaign platform;
- enterprise CRM.

---

## 12.8 Generative AI dependency

No critical V1 capability should require an external generative AI service.

Future AI functionality may augment the Operational Assistant but should not become necessary for trusted business execution.

---

## 12.9 Enterprise organizational structures

V1 does not initially target:

- corporate groups;
- subsidiaries;
- matrix organizations;
- complex inter-company relationships;
- consolidated financial management.

---

# 13. Deliberately deferred capabilities

The following capabilities may provide future value but should not increase V1 complexity before their need is demonstrated:

- customer portal;
- supplier portal;
- worker self-service;
- multiple inventory locations;
- warehouse transfers;
- lots;
- expiration tracking;
- serial-number tracking;
- advanced return flows;
- purchase-order workflows;
- dedicated goods receipts;
- supplier invoice matching;
- advanced pricing;
- promotions;
- loyalty systems;
- accounting integrations;
- payment-provider integrations;
- e-commerce integrations;
- dedicated mobile applications;
- offline-first operation;
- advanced workflow automation;
- LLM-assisted intent interpretation;
- predictive analytics;
- demand forecasting.

Deferred means:

> preserve a reasonable path where appropriate, but do not pay the implementation cost today.

---

# 14. Definition of a coherent V1

Manasiness V1 is coherent when an organization can perform its central commercial workflow without relying on disconnected manual records for the information Manasiness claims to manage.

An authorized operator should be able to:

1. authenticate;
2. access the correct organization;
3. manage meaningful customers, suppliers, and workers;
4. avoid creating profiles for anonymous customers unnecessarily;
5. maintain the product catalog;
6. understand current inventory;
7. understand why inventory changed;
8. register purchases;
9. receive merchandise;
10. track supplier balances;
11. register multi-item sales;
12. support anonymous and identified customers;
13. record immediate and partial payments;
14. track customer balances;
15. record relevant operational expenses and money movements;
16. inspect important operational history;
17. obtain meaningful business summaries;
18. use the Operational Assistant for a controlled set of supported operations;
19. operate without gaining access to another organization's information.

V1 does not need to contain every future capability.

Its supported capabilities must work together as one coherent product.

---

# 15. Product trade-off framework

When future requirements conflict, decisions should generally prioritize:

1. domain correctness and tenant isolation;
2. preservation of important historical facts;
3. operational clarity for the user;
4. consistency between capabilities;
5. product simplicity;
6. maintainability;
7. reasonable extensibility;
8. implementation convenience.

This ordering is guidance rather than an absolute algorithm.

Its purpose is to prevent short-term implementation convenience from silently defining long-term product behavior.

Any substantial decision that intentionally violates a core principle should be explicit and justified.

---

# 16. Relationship with Manasiness Legacy

`manasiness-legacy` is evidence, not authority.

It may be used to discover:

- valuable workflows;
- useful UX behavior;
- previous user needs;
- terminology;
- missing capabilities;
- accidental complexity;
- incorrect modeling decisions.

The new product should not preserve a behavior solely because the legacy implementation contains it.

Relevant legacy behavior will be evaluated separately and classified as:

- preserve;
- redesign;
- replace;
- remove.

That classification belongs to the dedicated M0 legacy audit.

---

# 17. Product versus implementation

This document defines product intent.

It intentionally does not determine whether Manasiness ultimately uses:

- one table or several tables;
- REST or another API style;
- one framework or another;
- one deployment process or another;
- specific UI components;
- specific caching technology;
- specific background-processing technology.

Those are implementation choices.

They must support the product model rather than redefine it.

For example:

Product requirement:

> A casual customer can complete a sale without having a persistent customer profile.

Implementation question:

> How is the optional customer relationship represented in persistence?

Product requirement:

> Inventory changes must be explainable.

Implementation question:

> How are inventory balances and movements stored and calculated?

Product requirement:

> A worker may exist without application access.

Implementation question:

> How are worker records associated with identities when access is later granted?

Keeping these levels separate prevents technical convenience from becoming accidental business policy.

---

# 18. Source-of-truth hierarchy

For Manasiness V1, product and engineering decisions should follow this hierarchy:

```text
Product vision
    ↓
Domain definitions and invariants
    ↓
Architectural decisions
    ↓
Milestone / issue requirements
    ↓
Implementation
```

Therefore:

- this document defines product direction and V1 scope;
- domain documentation defines precise business semantics;
- ADRs define consequential technical and architectural choices;
- issues define bounded delivery work;
- implementation must conform to these decisions.

Implementation should not silently redefine product behavior.

---

# 19. Evolution policy

This document is not immutable.

Manasiness will evolve as real product knowledge improves.

However, material changes to:

- target users;
- V1 scope;
- product promise;
- multi-tenant direction;
- foundational product distinctions;
- major non-goals;
- core product principles;

must be deliberate decisions.

They should not enter the product accidentally through an implementation PR.

A significant change to this contract should therefore update this document explicitly and include the rationale for the change.