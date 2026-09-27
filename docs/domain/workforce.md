# Workforce Domain Foundation

## 1. Purpose

This document defines the Workforce domain foundation for Manasiness V2.

It establishes:

- what a Worker represents;
- what a Worker Relationship represents;
- how a Worker relates to a Party;
- why employment and authentication are separate concerns;
- how Identity linkage works when a worker receives application access;
- why Membership is not employment;
- why authorization roles are not employment roles;
- the Worker Relationship lifecycle;
- historical continuity after a worker leaves the Organization;
- actor attribution for authenticated operations;
- the boundary between Workforce and Finance;
- what belongs in V1 Workforce scope;
- what remains outside V1 as future HR or payroll functionality.

This document defines **domain semantics and ownership boundaries**.

It does not define:

- database tables;
- ORM models;
- API endpoints;
- UI screens;
- payroll calculations;
- tax withholding;
- attendance;
- time clocks;
- labor-law workflows;
- benefits administration;
- recruiting;
- performance management;
- a full HR information system.

Those concerns may be introduced later if product requirements justify them.

---

# 2. Core model

The central Workforce model is:

```text
Organization
    │
    │ employs / engages
    ▼
Worker Relationship
    │
    ▼
Person Party
```

A worker is therefore not fundamentally an authentication account.

A worker is:

> A person who has a Worker Relationship with an Organization.

Conceptually:

```text
Person Party: Juan Pérez
│
└── Worker Relationship
    ├── Organization: Empresa ABC
    ├── employment/work status
    ├── start date
    ├── optional end date
    ├── business role/title
    └── workforce metadata
```

The person and the work relationship are different concepts.

---

# 3. Domain ownership

The Workforce domain owns:

```text
Worker Relationship
Worker lifecycle
employment/business relationship status
employment/business role or title
work-related profile information
start/end semantics
worker operational references
workforce-specific metadata
```

It does not own:

```text
Person identity                 → Parties
authentication                  → Identity & Access
login credentials               → Identity & Access
Organization Membership         → Organizations
authorization permissions       → Identity & Access / Organizations
Payment                         → Finance
Financial Account               → Finance
Cash Movement                   → Finance
payroll engine                  → future scope
```

The boundaries are intentional.

---

# 4. Person, Worker, Identity, and Membership are different concepts

The following concepts must not be collapsed:

```text
Person Party
≠
Worker Relationship
≠
Identity
≠
Membership
≠
Authorization Role
```

They may refer to the same human being.

They still answer different questions.

---

# 5. Person Party

A **Person Party** represents a human person known to the business.

Examples:

```text
Juan Pérez
María López
Ana Torres
```

Parties owns the person's business identity.

A Person Party may participate in several business relationships.

For example:

```text
Person Party: Juan Pérez
├── Customer Relationship
├── Supplier Relationship
└── Worker Relationship
```

Manasiness must not force one person into exactly one permanent category.

---

# 6. Worker Relationship

A **Worker Relationship** represents the relationship through which a Person Party works for an Organization.

Conceptually:

```text
Worker Relationship
├── Organization
├── Person Party
├── lifecycle state
├── start date
├── optional end date
├── optional business role/title
└── workforce-specific information
```

The relationship belongs to a specific Organization.

It does not exist globally independent from the business for which the person works.

---

# 7. Worker as shorthand

`Worker` is convenient business language.

In the domain model:

```text
Worker
```

means approximately:

```text
Person Party
+
Worker Relationship with Organization
```

Worker should therefore not become another disconnected representation of a human being.

Manasiness should avoid models such as:

```text
Person
Worker
Customer
Supplier
User
```

all independently storing the same human identity.

Instead:

```text
Party
└── relationships
```

provides the stable human/business identity foundation.

---

# 8. Worker Relationship requires a Person Party

A Worker Relationship represents a human working relationship.

Therefore:

> A Worker Relationship must refer to a Person Party.

It must not refer to:

```text
Company Party
```

A company may provide services to another company, but that commercial relationship is not a Worker Relationship.

For example:

```text
Empresa de Seguridad SAC
```

contracted by the Organization is not itself a Worker.

Individual people assigned by that company may require separate future modeling depending on product requirements.

---

# 9. Worker Relationship is Organization-scoped

A person's Worker Relationship exists in relation to one Organization.

Example:

```text
Person Party: Juan Pérez

Organization A
└── Worker Relationship A

Organization B
└── Worker Relationship B
```

These relationships are independent.

Ending Juan's relationship with Organization A must not imply anything about his relationship with Organization B.

This matters in a multi-tenant product.

---

# 10. Worker is not Identity

An **Identity** answers:

> Who can authenticate into Manasiness?

A Worker Relationship answers:

> Who works for this Organization?

Those are different questions.

Therefore:

```text
Worker Relationship
```

does not require:

```text
Identity
```

A worker may never log into Manasiness.

Example:

```text
Person Party: Pedro
└── Worker Relationship: Active
```

with:

```text
Identity: absent
Membership: absent
```

is completely valid.

---

# 11. Identity is not Worker

The reverse is also true.

Having an Identity does not imply employment.

For example:

```text
Identity: external accountant
└── Membership in Organization
```

may allow the accountant to access Manasiness.

That does not automatically mean:

```text
Worker Relationship
```

exists.

Likewise:

```text
business owner
consultant
external administrator
auditor
```

could potentially have application access without being modeled as workers.

Therefore:

> Authentication access must never be used as the canonical test for whether someone is a Worker.

---

# 12. Optional Identity linkage

A Worker may later receive application access.

Conceptually:

```text
Person Party
├── Worker Relationship
│
└── optional Identity association
```

The Identity remains owned by Identity & Access.

The Worker Relationship remains owned by Workforce.

The association allows the system to understand that:

```text
authenticated Identity
```

and:

```text
Worker
```

represent the same human when that is intentionally established.

The association is optional.

---

# 13. Worker without login

A normal valid scenario is:

```text
Person Party
└── Worker Relationship
    ├── Active
    ├── role: Warehouse Assistant
    └── no Identity
```

The worker may still appear in:

- operational assignments;
- historical transactions;
- workforce lists;
- worker-related financial records;
- reports;
- business history.

No application account is required.

---

# 14. Worker with login

Another valid scenario is:

```text
Person Party
├── Worker Relationship
│   └── role: Cashier
│
└── Identity
    └── Membership
        └── authorization permissions
```

The same human participates in several domain concepts.

Each concept retains independent ownership.

---

# 15. Membership

A **Membership** represents an Identity's participation in an Organization for application-access purposes.

Conceptually:

```text
Identity
    │
    ▼
Membership
    │
    ▼
Organization
```

Membership answers questions such as:

```text
Can this Identity access this Organization?
What authorization scope does this Identity have here?
```

It does not answer:

```text
Does this person work here?
When did employment begin?
What job do they perform?
Has their employment ended?
```

Those belong to Workforce.

---

# 16. Membership is not employment

The following model is invalid:

```text
Membership exists
therefore
person is Worker
```

Likewise:

```text
Membership disabled
therefore
employment ended
```

is invalid.

The lifecycles are separate.

Conceptually:

```text
Worker Relationship lifecycle
≠
Membership lifecycle
```

This separation prevents authorization state from silently changing workforce history.

---

# 17. Worker does not require Membership

A worker may exist without Organization Membership.

Example:

```text
Worker: Delivery Assistant
Identity: absent
Membership: absent
```

This is valid because the worker does not use Manasiness directly.

Operational records may still reference the Worker.

---

# 18. Membership does not require Worker Relationship

An Identity may participate in an Organization without being a Worker.

Example:

```text
Identity: external accountant
Membership: active
Worker Relationship: absent
```

This is also valid.

Therefore:

```text
Worker does not imply Membership

Membership does not imply Worker
```

---

# 19. Identity does not imply Membership

An Identity may exist globally without access to a particular Organization.

Conceptually:

```text
Identity
```

does not itself grant:

```text
Organization access
```

Access to an Organization requires the appropriate authorization context, normally represented through Membership.

Therefore a worker linked to an Identity still does not automatically gain application access.

---

# 20. Granting application access to a Worker

Granting a Worker application access is an explicit operation.

Conceptually:

```text
Existing Person Party
└── Worker Relationship
        │
        │ optional linkage
        ▼
     Identity
        │
        ▼
     Membership
        │
        ▼
authorization
```

The system should not create authentication access merely because a Worker Relationship exists.

This protects the principle of least privilege.

---

# 21. Disabling login does not end employment

If a worker loses application access:

```text
Membership disabled
```

or:

```text
Identity access disabled
```

the Worker Relationship may remain:

```text
Active
```

Example:

```text
worker's tablet access removed
worker continues working physically
```

The system must support this without falsifying employment history.

---

# 22. Ending employment does not necessarily disable Identity globally

Likewise:

```text
Worker Relationship ended
```

does not automatically mean:

```text
Identity deleted
```

An Identity may:

- belong to another Organization;
- retain another legitimate Membership;
- represent historical actor attribution;
- later receive another authorized relationship.

Workforce may trigger or recommend access review.

Identity & Access remains responsible for authentication state.

---

# 23. Employment role is not authorization role

Manasiness must distinguish:

```text
business/employment role
```

from:

```text
authorization role
```

Example:

```text
Worker business role:
Warehouse Supervisor
```

may coexist with:

```text
Authorization role:
operator
```

They answer different questions.

---

# 24. Business role/title

A worker's business role or title describes the worker's operational relationship with the Organization.

Examples:

```text
Cashier
Warehouse Assistant
Salesperson
Store Manager
Technician
Administrative Assistant
```

This information belongs to Workforce.

It may eventually affect:

- assignments;
- reporting;
- operational filtering;
- workforce organization.

It must not automatically determine system permissions.

---

# 25. Authorization role

An authorization role describes what an authenticated Identity may do inside Manasiness.

Examples might include:

```text
owner
administrator
operator
viewer
```

Final authorization terminology belongs to Identity & Access.

An authorization role controls application capabilities.

It must not be treated as an employment title.

---

# 26. No permission inference from job title

The system must not assume:

```text
jobTitle = "Manager"
```

therefore:

```text
full administrative access
```

Similarly:

```text
jobTitle = "Cashier"
```

must not automatically encode a specific permission set unless an explicit authorization policy intentionally maps those concepts in the future.

Workforce describes the business relationship.

Authorization controls access.

---

# 27. No job-title inference from permissions

The reverse inference is also invalid.

For example:

```text
authorizationRole = administrator
```

does not mean:

```text
employmentRole = Administrator
```

An external implementation consultant may have broad temporary permissions without being an employee.

The system must not turn technical access configuration into workforce truth.

---

# 28. Worker lifecycle

The V1 conceptual lifecycle should remain intentionally simple.

The baseline states are:

```text
Active
Ended
```

with creation establishing the beginning of a Worker Relationship.

Conceptually:

```text
Worker Relationship created
        │
        ▼
      Active
        │
        ▼
       Ended
```

The exact persistence representation is deferred.

The semantic distinction is not.

---

# 29. Active Worker Relationship

An **Active Worker Relationship** means:

> The person currently has an ongoing work relationship with the Organization.

This does not imply:

- application login;
- active Membership;
- a particular authorization role;
- current shift attendance;
- payroll enrollment;
- that the person is physically at work now.

Those are different concerns.

---

# 30. Ended Worker Relationship

An **Ended Worker Relationship** means:

> The work relationship represented by this record has concluded.

Ending the relationship should preserve:

```text
Person Party
Organization
historical Worker Relationship
start information
end information
historical operational references
financial references
```

The Worker must not disappear from business history.

---

# 31. Why Workforce does not use `deleted` for leaving workers

A worker leaving the business is a real historical event.

Therefore:

```text
DELETE worker
```

is not an appropriate normal business operation.

The correct concept is:

```text
Worker Relationship
Active → Ended
```

The historical relationship continues to exist.

---

# 32. Historical continuity

After a worker leaves:

```text
past operations
```

must remain attributable to that worker.

Examples may include:

```text
Sale confirmed by worker
Purchase received by worker
Inventory adjustment performed by worker
financial operation initiated by worker
future assignment history
```

Ending the Worker Relationship must not null those historical references.

---

# 33. Former workers

A former worker is not a different Party type.

Conceptually:

```text
Person Party
└── Worker Relationship
    └── Ended
```

The system may present such a person as:

```text
Former worker
```

for user experience purposes.

Canonical history remains the ended Worker Relationship.

---

# 34. Rehiring

An ended work relationship should not be silently rewritten into one uninterrupted period.

If the same person later returns to work for the Organization, the model must preserve the fact that there were distinct work periods.

Conceptually:

```text
Person Party: Juan

Worker Relationship #1
├── started: 2025
└── ended:   2026

Worker Relationship #2
├── started: 2027
└── active
```

Whether implementation represents these as separate relationships or explicit employment periods may be refined later.

The invariant is:

> Rehiring must not erase the historical gap between work engagements.

---

# 35. Temporary absence is not employment termination

A person being:

```text
on vacation
sick
temporarily unavailable
off shift
```

does not necessarily mean:

```text
Worker Relationship = Ended
```

Those operational/HR states are outside the V1 baseline unless later requirements justify them.

V1 should avoid creating lifecycle states for hypothetical HR workflows.

---

# 36. Start information

A Worker Relationship should be capable of preserving when the work relationship began where that information is known and relevant.

Conceptually:

```text
startedAt / startDate
```

is a business fact.

It must not be confused with:

```text
database row creation time
```

A worker may be entered into Manasiness after they actually started working.

---

# 37. End information

When a Worker Relationship ends, the model should preserve the effective business end information.

Conceptually:

```text
endedAt / endDate
```

may differ from:

```text
updated_at
```

The business meaning must not depend solely on persistence timestamps.

---

# 38. End reason

A future model may allow optional context explaining why a Worker Relationship ended.

However, V1 should not attempt to model a comprehensive HR termination taxonomy.

If introduced, end context should be business information rather than authorization state.

---

# 39. Historical worker name

Person identity belongs to Parties.

Operational records may reference the Worker Relationship and Party.

Where long-term historical interpretation requires transaction-time display information, the owning operational domain may snapshot appropriate presentation facts according to its own historical-data policy.

Workforce itself should not duplicate Person identity unnecessarily.

---

# 40. Worker profile information

V1 Workforce may contain only information required to operate Manasiness effectively.

Possible workforce-specific information includes:

```text
business role/title
internal worker code
start date
end date
notes relevant to the work relationship
active/ended state
```

Exact fields belong to later implementation design.

The guiding rule is:

> Workforce stores information about the person's relationship with the Organization, not every possible fact about the person.

---

# 41. Personal information belongs to Parties where appropriate

General person identity data should remain owned by Parties.

Examples:

```text
name
general contact identity
person-level identification
```

should not be unnecessarily duplicated in Worker Relationship.

Workforce may use those facts.

Using them does not transfer ownership.

---

# 42. Employment information belongs to Workforce

Information whose meaning exists because the person works for the Organization belongs to Workforce.

Examples may include:

```text
worker code
business role/title
work relationship start
work relationship end
employment/work status
```

This provides a clean distinction:

```text
Who is this person?
→ Parties

How do they work for this Organization?
→ Workforce
```

---

# 43. Multiple business relationships

A Worker may simultaneously be another kind of Party relationship.

Example:

```text
Person Party: Ana
├── Worker Relationship
└── Customer Relationship
```

This is valid.

If Ana purchases something personally from the business:

```text
Sale
└── Customer Relationship
```

should represent the commercial relationship.

Her Worker Relationship does not replace her Customer Relationship.

---

# 44. Supplier and Worker at the same time

Similarly:

```text
Person Party
├── Worker Relationship
└── Supplier Relationship
```

may be valid if real business circumstances justify it.

Manasiness must not use one global enum such as:

```text
role = worker | customer | supplier
```

to force mutually exclusive categories.

---

# 45. Actor attribution

When an authenticated user performs a consequential operation, the system must attribute that action to the authenticated **Identity**.

Conceptually:

```text
Identity
    │
    ▼
authenticated action
    │
    ▼
audit / operational attribution
```

The primary actor is the Identity that actually authenticated.

---

# 46. Worker attribution and Identity attribution are related but different

If the authenticated Identity is linked to a Person Party with an active Worker Relationship, the application may also provide worker context where meaningful.

Conceptually:

```text
Identity
└── authenticated actor

Person Party
└── Worker Relationship
    └── workforce context
```

However:

```text
Identity attribution
```

must not be replaced by:

```text
Worker attribution
```

because not every authenticated actor is a Worker.

---

# 47. Why actor attribution uses Identity

Suppose:

```text
Worker Juan
```

has an application account.

Juan confirms a Sale.

The security/audit question is:

> Which authenticated principal performed this operation?

The answer is:

```text
Juan's Identity
```

The business context may additionally say:

```text
Worker Relationship: Juan / Cashier
```

These facts complement each other.

They are not substitutes.

---

# 48. Non-worker authenticated actor

Consider:

```text
external accountant
```

with authorized Membership.

The accountant performs a supported financial operation.

The action must still be attributable even though:

```text
Worker Relationship = absent
```

This demonstrates why audit attribution cannot depend on Worker existence.

---

# 49. Worker without Identity and operational attribution

Some operations may need to record that an offline or non-authenticated worker was involved even when another authenticated operator enters the information.

Example:

```text
Warehouse worker Pedro
has no application account.

Supervisor María
logs into Manasiness
and records an operation performed by Pedro.
```

Potentially relevant facts are:

```text
authenticated actor: María's Identity
business subject/worker: Pedro's Worker Relationship
```

These must not be collapsed.

The final implementation of such subject attribution depends on each operational domain.

---

# 50. Acting user versus referenced worker

The system must distinguish:

```text
who entered/performed the application action
```

from:

```text
which worker the business operation concerns
```

Example:

```text
Identity: manager
records
Worker-related payment for: technician
```

The manager is the actor.

The technician is the subject.

This distinction is fundamental for trustworthy audit history.

---

# 51. Workforce and Finance

Workforce may establish business context that leads to a worker-related financial obligation.

Finance owns the monetary consequence.

Conceptually:

```text
Workforce
└── Worker Relationship
        │
        │ business context
        ▼
Finance
├── obligation
├── Payment
├── Financial Account
└── Cash Movement
```

Workforce must not directly manipulate Finance-owned balances.

---

# 52. Worker-related payment

A **worker-related payment** means a financial operation whose business context relates to a Worker.

The term intentionally does not assume that every such operation is formal payroll salary.

Examples may eventually include:

```text
salary-like compensation
advance
reimbursement
bonus
commission
other supported worker payment
```

The exact supported categories must come from product requirements.

V1 should not prematurely implement a payroll taxonomy.

---

# 53. Payment belongs to Finance

Even when a payment concerns a Worker:

```text
Payment
```

is still owned by Finance.

Finance owns:

```text
amount
currency
financial account
cash consequence
payment lifecycle
reversal
settlement semantics
```

Workforce owns the Worker context.

---

# 54. Workforce must not become payroll by accident

A common design mistake would be to gradually add fields such as:

```text
base salary
tax
pension
insurance
overtime
deductions
payroll period
withholding
net salary
```

until Worker becomes an accidental payroll engine.

V1 must avoid this.

Those concepts require a dedicated payroll/product decision because they introduce:

- jurisdiction-specific rules;
- legal compliance;
- calculation engines;
- temporal compensation agreements;
- reporting obligations;
- significantly greater domain complexity.

---

# 55. Compensation information

If V1 later needs a simple compensation-related reference, it must be introduced only for a concrete product requirement.

A simple amount must not be presented as a complete payroll model.

For example:

```text
reference compensation
```

would still require explicit semantics before implementation.

This document intentionally does not define one.

---

# 56. Worker financial history

Financial operations concerning a Worker must remain traceable after the Worker Relationship ends.

Example:

```text
Worker Relationship
Active
    │
    ├── worker-related Payment #1
    ├── worker-related Payment #2
    │
    ▼
Ended
    │
    └── historical financial records remain
```

Ending employment must not detach or erase Finance history.

---

# 57. Financial correction

If a worker-related Payment was incorrect:

```text
Workforce does not rewrite Payment
```

Finance performs the appropriate:

```text
reversal
correction
replacement
```

according to Finance rules.

Historical financial truth must remain intact.

---

# 58. Ending a Worker does not settle Finance automatically

Ending employment must not silently:

```text
mark Payments settled
erase obligations
delete worker-related financial records
```

Workforce lifecycle and financial lifecycle remain separate.

Conceptually:

```text
Worker Relationship: Ended
```

may coexist with:

```text
financial obligation: Outstanding
```

if the business legitimately still owes the former worker money.

---

# 59. Finance does not control Worker lifecycle

Likewise, a worker-related obligation being paid does not mean:

```text
Worker Relationship = Ended
```

Payment status says nothing about whether the person still works for the Organization.

---

# 60. Historical operational references

Other domains may reference Worker Relationship when workforce context matters.

Potential examples include:

```text
operation assigned to Worker
inventory count performed by Worker
service handled by Worker
Sale associated with salesperson
Purchase received by Worker
```

Each owning domain decides whether Worker context is relevant.

Workforce owns the Worker Relationship being referenced.

---

# 61. Ending a Worker must not break references

Suppose an Inventory Adjustment records:

```text
responsible worker: Juan
```

Juan later leaves.

The adjustment must remain understandable.

Invalid behavior:

```text
Worker ended
→ historical worker reference becomes null
```

Correct principle:

```text
Worker ended
→ historical reference remains
```

---

# 62. Worker hard deletion

An established Worker Relationship should not normally be hard-deleted through ordinary business behavior.

The relationship may be historically significant.

Incorrect:

```text
worker leaves
→ DELETE worker
```

Correct:

```text
worker leaves
→ end Worker Relationship
```

Exceptional privacy or administrative deletion rules belong to the cross-cutting retention policy and applicable legal requirements.

---

# 63. Draft/incorrect Worker creation

A Worker Relationship created completely by mistake may eventually require an administrative correction path.

That is different from a real Worker leaving the Organization.

The system must not use one generic delete behavior for both cases.

Detailed correction semantics belong to later implementation work.

---

# 64. Worker lifecycle versus Party lifecycle

Ending the Worker Relationship must not deactivate or delete the Person Party automatically.

Example:

```text
Person Party: Juan
├── Worker Relationship: Ended
└── Customer Relationship: Active
```

is valid.

The person still exists in the business context.

Only one of their relationships ended.

---

# 65. Worker lifecycle versus Customer/Supplier relationships

Similarly:

```text
Worker Relationship: Ended
```

must not automatically terminate:

```text
Customer Relationship
Supplier Relationship
```

Those relationships belong to their respective domain semantics.

Cross-domain convenience must not create hidden coupling.

---

# 66. Worker lifecycle versus Membership lifecycle

The system may operationally coordinate:

```text
end Worker Relationship
+
review/disable Membership
```

when appropriate.

But they remain separate actions.

This distinction matters because:

```text
employment end
```

and:

```text
application-access revocation
```

have different security and business meanings.

---

# 67. Offboarding

A future offboarding workflow may orchestrate several capabilities:

```text
End Worker Relationship
Review Membership
Disable organization access
Reassign responsibilities
Resolve outstanding obligations
Preserve historical attribution
```

Such a workflow is an application-level orchestration.

It must not collapse the underlying domains into one state mutation.

---

# 68. Security-sensitive offboarding

Although employment and Membership are separate, a worker leaving may create a security need to revoke Organization access promptly.

Therefore future application logic may coordinate:

```text
Workforce
→ Worker ended

Organizations / Identity & Access
→ revoke or review Membership
```

The domains remain separate even if the product offers a single user-facing offboarding action.

---

# 69. Access revocation must be explicit

The product must avoid ambiguous behavior such as:

```text
end Worker
```

silently performing unknown authorization changes.

If an application flow coordinates access revocation, that consequence should be explicit and auditable.

This ensures administrators understand whether:

```text
employment
application access
```

were both changed.

---

# 70. Worker creation must not grant permissions

Creating:

```text
Worker Relationship
```

must never implicitly grant:

```text
Identity
Membership
authorization role
```

Granting access is security-sensitive and requires an explicit capability.

---

# 71. Linking an Identity must be deliberate

If a Worker is linked to an Identity, the system must establish that association intentionally.

It should not guess based solely on:

```text
same name
same phone number
similar email
```

Incorrect identity linkage could cause:

- incorrect attribution;
- privacy problems;
- authorization mistakes;
- historical corruption.

Identity resolution rules belong to later implementation.

---

# 72. One human, one coherent Party identity

Where Manasiness knows that the same human participates in several relationships, the preferred conceptual model is:

```text
one Person Party
├── Customer Relationship
├── Supplier Relationship
└── Worker Relationship
```

rather than duplicate person records for each role.

Record matching and deduplication mechanics are deferred.

---

# 73. Workforce capability examples

Future application capabilities may include concepts such as:

```text
CreateWorkerRelationship
UpdateWorkerProfile
EndWorkerRelationship
LinkWorkerIdentity
RecordWorkerBusinessRole
```

These names are illustrative.

They are not final API contracts.

The important principle is:

> Workforce mutations occur through Workforce-owned capabilities.

---

# 74. Identity capability examples

Security-related operations remain separate, for example:

```text
CreateIdentity
InviteIdentity
CreateMembership
ChangeAuthorization
DisableMembership
RevokeSession
```

Exact capabilities belong to Identity & Access and Organizations.

Workforce must not reproduce their rules.

---

# 75. Finance capability examples

Worker-related money movement may use Finance capabilities such as:

```text
RecordPayment
CreateObligation
ReversePayment
```

depending on the final Finance implementation.

Workforce provides business context.

Finance performs Finance-owned behavior.

---

# 76. V1 Workforce scope

The V1 Workforce domain should remain intentionally narrow.

Its purpose is to support operational business management rather than become a full HR platform.

V1 should be capable of representing:

```text
who works for the Organization
which Person Party they are
whether the work relationship is active
when the relationship began
when it ended
what business role/title they have
optional Identity association
historical operational references
worker-related financial context
```

This is enough to support Manasiness operational workflows without premature HR complexity.

---

# 77. V1 non-goals

The following are explicitly outside the V1 Workforce foundation:

```text
payroll engine
payroll periods
tax calculations
pension calculations
benefits management
attendance
time clock
shift scheduling
leave management
vacation accrual
recruiting
candidate tracking
onboarding document management
performance reviews
training management
disciplinary workflows
labor-law compliance engine
employment contracts
digital signatures
HR document vault
organizational chart engine
```

Some may become valuable later.

They should be introduced through product discovery rather than speculative architecture.

---

# 78. Future HR evolution

The current Worker Relationship model must leave room for future concepts.

Potential future domains or subdomains could include:

```text
Employment Agreement
Compensation Agreement
Shift
Attendance
Leave
Payroll Run
Payroll Item
Benefit Enrollment
Worker Assignment
```

The current model does not require those concepts.

It merely avoids architectural choices that would make them impossible to introduce cleanly later.

---

# 79. Future payroll evolution

If payroll becomes a product requirement, payroll should not be implemented by simply adding calculation fields to Worker.

A richer model may eventually require:

```text
Worker Relationship
      │
      ▼
Compensation Agreement
      │
      ▼
Payroll Period
      │
      ▼
Payroll Calculation
      │
      ▼
Finance obligation / Payment
```

That architecture is intentionally deferred.

---

# 80. Future assignment model

Operational needs may eventually require Worker assignments.

For example:

```text
Worker
├── Store A
├── Warehouse B
└── Service Team C
```

Assignments should become explicit concepts if needed.

They must not be confused with authorization Membership.

Physical/business assignment and application access remain separate.

---

# 81. Future organizational structure

The business may later require:

```text
departments
teams
supervisors
reporting lines
locations
```

Those requirements should be modeled from actual business semantics.

V1 should not introduce a speculative organization chart.

---

# 82. Example: worker without Manasiness access

```text
Organization: Minimarket ABC

Person Party:
Carlos Ramírez

Worker Relationship:
├── Active
├── role: Stock Assistant
└── start: 2026-02-01

Identity:
absent

Membership:
absent
```

Carlos is still a completely valid Worker.

---

# 83. Example: worker with application access

```text
Person Party:
María Torres

Worker Relationship:
├── Active
└── role: Cashier

Identity:
└── maria@example.com

Membership:
└── Organization ABC

Authorization:
└── sales operations
```

The same person participates in Workforce and Identity/Access.

Those domains remain conceptually separate.

---

# 84. Example: external accountant

```text
Person Party:
Pedro López

Identity:
└── pedro@example.com

Membership:
└── Organization ABC

Authorization:
└── finance access

Worker Relationship:
absent
```

Pedro may use Manasiness.

Pedro is not necessarily a Worker.

---

# 85. Example: worker loses system access but remains employed

Initial state:

```text
Worker Relationship: Active
Identity: active
Membership: active
```

Application access is removed:

```text
Worker Relationship: Active
Membership: disabled
```

The person continues working.

This is valid.

---

# 86. Example: worker leaves the business

Before:

```text
Worker Relationship: Active
Membership: active
```

Offboarding may result in:

```text
Worker Relationship: Ended
Membership: disabled
Identity: preserved
```

Historical operations remain attributable.

---

# 87. Example: former worker still owed money

```text
Worker Relationship:
Ended
```

Finance:

```text
Outstanding worker-related obligation:
S/ 500
```

This is valid.

Ending employment does not erase Finance obligations.

---

# 88. Example: payment after employment ended

```text
Worker Relationship
└── Ended

Finance
└── Payment
    ├── amount: S/ 500
    └── worker context: historical Worker Relationship
```

The Payment remains traceable to the former worker.

No Worker reactivation is required.

---

# 89. Example: worker performs an operation

```text
Person Party: María
├── Worker Relationship: Cashier
└── Identity
    └── Membership
```

María confirms a Sale.

Conceptually the system may retain:

```text
authenticated actor:
María's Identity

business context:
María's Worker Relationship, where useful
```

Identity answers who authenticated.

Worker Relationship explains the workforce context.

---

# 90. Example: manager records another worker's activity

```text
Worker Pedro
└── no Identity

Manager Ana
└── authenticated Identity
```

Ana enters an operation concerning Pedro.

The record may distinguish:

```text
actor:
Ana's Identity

subject/responsible worker:
Pedro's Worker Relationship
```

This prevents false attribution.

---

# 91. Example: worker is also customer

```text
Person Party: Carlos
├── Worker Relationship
│   └── Active
│
└── Customer Relationship
    └── Active
```

Carlos buys merchandise personally.

The Sale references:

```text
Customer Relationship
```

not Worker Relationship.

His employment role does not redefine the commercial transaction.

---

# 92. Example: worker rehired

First engagement:

```text
Worker Relationship #1
2024-01-10 → 2025-05-20
```

Second engagement:

```text
Worker Relationship #2
2026-03-01 → active
```

The system preserves both periods.

It must not rewrite the first relationship as if employment had never ended.

---

# 93. Required invariants

The following invariants are foundational.

## 93.1 Worker Party invariant

```text
Worker Relationship
→ Person Party
```

A Company Party cannot be a Worker.

## 93.2 Login independence invariant

```text
Worker Relationship
```

does not require:

```text
Identity
```

## 93.3 Membership independence invariant

```text
Worker Relationship
```

does not require:

```text
Membership
```

## 93.4 Reverse independence invariant

```text
Identity or Membership
```

does not imply:

```text
Worker Relationship
```

## 93.5 Authorization separation invariant

```text
authorization role
≠
employment/business role
```

## 93.6 Lifecycle independence invariant

```text
Worker lifecycle
≠
Identity lifecycle
≠
Membership lifecycle
```

## 93.7 Historical continuity invariant

Ending a Worker Relationship must not erase historical operational references.

## 93.8 Party continuity invariant

Ending a Worker Relationship must not delete the Person Party.

## 93.9 Relationship independence invariant

Ending a Worker Relationship must not automatically end Customer or Supplier Relationships.

## 93.10 Finance ownership invariant

Workforce must not directly mutate canonical Payment, account, balance, or cash-movement state.

## 93.11 Financial traceability invariant

Worker-related financial history must remain attributable after employment ends.

## 93.12 Actor attribution invariant

Authenticated actions remain attributable to Identity even when Worker context also exists.

## 93.13 Access grant invariant

Creating a Worker Relationship must not automatically grant application access.

## 93.14 Historical correction invariant

Real historical Worker Relationships must not be silently rewritten or deleted to represent later changes.

---

# 94. Responsibility matrix

| Concern | Owner |
|---|---|
| Person Party | Parties |
| Human identity/business identity | Parties |
| Customer Relationship | Parties |
| Supplier Relationship | Parties |
| Worker Relationship | Workforce |
| Worker lifecycle | Workforce |
| Employment/work status | Workforce |
| Business role/title | Workforce |
| Worker start/end semantics | Workforce |
| Identity | Identity & Access |
| Authentication | Identity & Access |
| Credentials | Identity & Access |
| Sessions | Identity & Access |
| Membership | Organizations |
| Organization participation for access | Organizations |
| Authorization policy | Identity & Access / Organizations |
| Authorization role | Identity & Access / Organizations |
| Payment | Finance |
| Financial Account | Finance |
| Cash Movement | Finance |
| Payment reversal | Finance |
| Worker-related financial settlement | Finance |
| Payroll engine | Future scope |
| Attendance | Future scope |
| HR compliance | Future scope |

---

# 95. Conceptual relationship map

The complete conceptual relationship is:

```text
                        ┌───────────────────────┐
                        │      Identity         │
                        │ authentication actor  │
                        └──────────┬────────────┘
                                   │
                                   │ optional human association
                                   ▼
┌───────────────────────┐    ┌───────────────────────┐
│     Organization      │    │     Person Party      │
└──────────┬────────────┘    └──────────┬────────────┘
           │                            │
           │                            │
           │       Worker Relationship  │
           └──────────────┬─────────────┘
                          │
                          ▼
                       Workforce
```

Application access is modeled separately:

```text
Identity
   │
   ▼
Membership
   │
   ▼
Organization
   │
   ▼
Authorization
```

The same Organization appears in both views.

The relationships mean different things.

---

# 96. Operational mental model

When thinking about a person in Manasiness, ask separate questions.

```text
Who is the human?
→ Person Party

Do they work for this business?
→ Worker Relationship

Can they authenticate?
→ Identity

Can they access this Organization?
→ Membership

What can they do in the application?
→ Authorization

What job do they perform for the business?
→ Workforce role/title

Was money paid to them?
→ Finance
```

If these questions can be answered independently, the domain boundaries are working correctly.

---

# 97. Cross-domain creation flow

Creating a normal worker may conceptually require only:

```text
Parties
└── establish/find Person Party

Workforce
└── create Worker Relationship
```

It does not automatically require:

```text
Identity
Membership
Authorization
```

Those are additional capabilities only when application access is needed.

---

# 98. Cross-domain access flow

Granting an existing Worker application access may conceptually involve:

```text
Worker Relationship
        │
        ▼
identify associated Person Party
        │
        ▼
Identity & Access
├── establish Identity
└── authenticate principal

Organizations
└── establish Membership

Authorization
└── assign appropriate permissions
```

This is an orchestration across domains.

No single domain becomes owner of all concepts.

---

# 99. Cross-domain offboarding flow

A future offboarding flow may conceptually coordinate:

```text
Workforce
└── end Worker Relationship

Organizations / Identity & Access
└── review or revoke Organization access

Operational domains
└── preserve historical references

Finance
└── preserve and settle remaining obligations
```

The workflow may appear unified to the user.

Its canonical state remains distributed across the owning domains.

---

# 100. Decisions intentionally deferred

This document intentionally does not decide:

- database schema;
- API shape;
- aggregate persistence structure;
- whether Worker Relationship has a separate surrogate ID;
- exact worker-code format;
- exact state enum representation;
- detailed compensation model;
- worker scheduling;
- shift management;
- attendance;
- leave;
- payroll;
- payroll taxation;
- benefits;
- recruiting;
- employment contracts;
- organizational hierarchy;
- departments;
- worker locations;
- assignment models;
- detailed offboarding workflow;
- identity-matching algorithm;
- whether every actor-facing UI displays Worker context;
- jurisdiction-specific HR requirements.

Those decisions should be made when concrete product requirements exist.

---

# 101. V1 conceptual baseline

The V1 mental model is:

```text
Person Party
    │
    ▼
Worker Relationship
├── Organization
├── Active / Ended
├── start information
├── optional end information
└── business role/title

Optional:
Person Party
    │
    ▼
Identity
    │
    ▼
Membership
    │
    ▼
Authorization

Worker-related money:
Worker Relationship
    │
    ▼
Finance
└── Payment / obligation / financial history
```

This model supports workers who:

- never log in;
- have application access;
- lose access while remaining employed;
- leave the Organization;
- return later;
- remain referenced historically;
- receive worker-related payments;
- are also customers or suppliers.

---

# 102. Final domain rule

The core Workforce rule is:

> A Worker Relationship describes how a Person Party works for an Organization. Identity describes who can authenticate. Membership describes application participation in an Organization. Authorization describes what that Identity may do. Finance describes money.

These concepts may belong to the same human.

They must not become the same record.

Keeping them separate allows Manasiness to support real workforce operations without recreating the Legacy model where:

```text
user
+
role
+
worker
+
authentication
+
business relationship
```

were treated as one concept.

That separation provides a stable foundation for M3, M4, M9, future authorization work, future worker-related financial operations, and eventual HR or payroll capabilities without requiring those larger systems in V1.