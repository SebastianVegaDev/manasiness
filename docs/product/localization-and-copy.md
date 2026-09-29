# Manasiness Localization, Product Copy, and Formatting Contract

> **Status:** Active
> **Milestone:** M2 — Product Experience Foundation
> **Issue:** #58
> **Scope:** Web presentation locale, message ownership, user-facing formatting, and product microcopy

## 1. Purpose

Manasiness must be able to evolve into a multilingual product without turning language, currency, timezone, or copy into accidental global state.

This contract defines the presentation boundary before feature-specific interfaces multiply. It establishes supported locales, pre-authentication locale resolution, message ownership, Server/Client Component access, presentation formatting, and product-copy conventions.

It does **not** define Organization currency, Organization timezone, tax/accounting rules, authenticated language persistence, or future screens that do not exist.

## 2. Core separation

These values have different owners:

| Concern | Example | Owner |
| --- | --- | --- |
| UI locale | `es-PE` | Web presentation / later user preference |
| Organization timezone | `America/Lima` | Organization/business settings |
| Transaction currency | `PEN` | Owning business/domain capability |
| Country/address | `PE` | Owning Party/Organization data |
| API error code | `inventory.insufficient_stock` | Backend/application contract |
| Product-facing error copy | localized operator message | Web feature message catalog |

Organization country, currency, timezone, or address must never be treated as proof of the operator's UI language. Likewise, UI locale must not select business currency, accounting behavior, or timezone policy.

## 3. Initial supported locales

M2 supports:

```text
en-US
es-PE
```

The explicit fallback is:

```text
en-US
```

This is a runtime fallback, not a permanent product-language statement. A real second locale exists in M2 so the architecture is exercised rather than remaining theoretical.

Adding another locale requires updating the supported-locale registry, supplying the owned catalogs, preserving catalog-surface parity, validating representative formatting, and reviewing layout consequences.

## 4. Locale resolution before M3

M3 owns authenticated Identity and preference persistence. Issue #58 therefore establishes only the pre-authentication baseline.

Current request resolution is:

```text
1. Read Accept-Language.
2. Prefer the highest-quality exact supported locale.
3. Otherwise map a supported language family:
      en-* → en-US
      es-* → es-PE
4. Ignore q=0 preferences.
5. Fall back to en-US.
```

Examples:

```text
es-PE,es;q=0.9,en-US;q=0.8 → es-PE
en-GB,en;q=0.9                → en-US
fr-FR,es-MX;q=0.8             → es-PE
fr-FR                          → en-US
```

Malformed tags fail closed to the supported fallback.

### Stable routes

Issue #55 defines stable product URLs such as:

```text
/app/[organizationId]/sales
/app/[organizationId]/inventory
```

UI language does not become route identity in #58. We do not introduce `/en-US/...` or `/es-PE/...` product routes. A copied business URL therefore preserves its Organization/product meaning regardless of presentation language.

### No preference cookie yet

M2 does not yet expose a locale switcher or M3 preference persistence. Creating a long-lived cookie with no owning preference UI would introduce state the operator cannot intentionally control.

A future explicit language selector may add browser preference state. Future authenticated resolution should conceptually become:

```text
authenticated user preference
        ↓
explicit browser preference, if introduced
        ↓
Accept-Language
        ↓
en-US fallback
```

Organization business settings stay outside this chain.

## 5. Runtime ownership

Localization infrastructure lives under:

```text
apps/web/src/platform/i18n/
```

It owns supported UI locales, request negotiation, message lookup/interpolation, browser-safe localization context, and standards-based presentation formatting.

It does not own feature rules, Organization settings, authentication, database persistence, API error semantics, currency selection, timezone selection, exchange rates, tax rules, or accounting calculations.

## 6. Message ownership

Messages stay close to the code that owns their meaning.

The current landing/readiness/diagnostic surface is platform-owned, so its small catalog lives in `platform/i18n/messages.ts`. That file is **not** the permanent home for every future product string.

Future feature copy should be feature-owned, for example:

```text
features/sales/messages/
features/inventory/messages/
features/relationships/messages/
```

A route/feature composition boundary should provide those messages through the same translation API instead of creating a second localization system.

Feature-dependent wording such as `Cancel sale`, `Reverse payment`, or `Stock adjustment` must not be moved into generic primitives merely because multiple screens use buttons or dialogs.

## 7. Message keys and sentences

Keys describe semantic purpose, not current English wording.

Prefer:

```text
sales.create.submit
inventory.empty.title
relationships.search.noResults
```

Avoid:

```text
clickHere
button2
areYouSure
```

Do not compose translatable sentences from unrelated fragments. Prefer a complete message with named interpolation, for example `reviews.latestTitle = "Latest reviews for {productName}"`.

The current translator supports named interpolation. Grammar-specific plural/select behavior must not be hand-built inside features.

## 8. Server and Client Components

Server Components use:

```typescript
const t = await getTranslations('landing');
```

Request negotiation remains server-only. The root layout sets `<html lang="...">` from the resolved locale.

Client Components receive browser-safe `locale` and `messages` through `LocalizationProvider` and use:

```typescript
const t = useTranslations('health.api');
```

The provider must never become a channel for secrets, private credentials, backend-only settings, or authorization decisions.

## 9. Message engine boundary

The application-facing APIs are intentionally small:

```text
getTranslations(namespace)
useTranslations(namespace)
```

The current source-owned adapter supports nested keys, plain strings, named interpolation, and fail-fast missing keys/values. It deliberately does **not** implement a custom ICU/plural/rich-text language.

`next-intl` was evaluated for #58. Its current App Router integration supports Server Components, Client Components, ICU messages, and formatting. We do not add it yet because the current M2 consumer set does not require those advanced capabilities.

Re-evaluate a maintained localization engine before ad-hoc feature logic appears for:

```text
plural/select grammar
rich translated markup
large-scale compile-time catalog typing
message extraction/editor tooling
translation-management integration
```

A future engine should sit behind the same application-facing boundary.

## 10. Formatting boundary

Presentation formatting uses standards-based `Intl` APIs through:

```text
createPresentationFormatter(locale)
```

The formatter supports numbers, percentages, currencies, calendar dates, absolute timestamps, and relative time.

### Currency

Currency is always explicit:

```typescript
format.currency(amount, currencyCode)
```

The formatter never infers currency from UI locale, country, or browser settings and performs no monetary arithmetic, conversion, tax calculation, or accounting rounding policy.

### Calendar dates

Date-only values use canonical `YYYY-MM-DD` input and are formatted without accidental timezone shifting.

### Absolute timestamps

Timestamp display requires an explicit IANA timezone:

```typescript
format.timestamp(instant, timeZone)
```

The formatter does not decide which timezone is correct. That policy belongs to the owning business/account capability.

### Relative time

Relative presentation receives the already-selected value and unit. Rendering `yesterday` / `ayer` does not determine whether a business record is overdue.

## 11. Error presentation

Backend/application errors remain machine-readable at the API boundary.

Preferred flow:

```text
backend invariant
        ↓
machine-readable error code
        ↓
feature boundary
        ↓
localized operator-facing explanation/action
```

Do not expose raw technical exceptions as product copy and do not treat an English backend error string as the translation contract.

## 12. Product copy principles

Manasiness copy is written for operators performing real business work.

- Be direct and concise.
- Avoid unnecessary internal/technical jargon.
- Recoverable errors explain the next useful action when safely known.
- Destructive confirmations name the consequence instead of asking only `Are you sure?`.
- Empty states distinguish first-use absence from zero search/filter results and explain a useful next action when one exists.
- Financial, inventory, credit, destructive, and security contexts stay calm and non-playful.
- Do not pretend certainty when the system does not know something.

## 13. Reusable primitives and copy

Reusable primitives own interaction semantics, not business/product wording.

The composing shell/feature supplies user-facing and accessible wording such as:

```text
Dialog.closeLabel
Menu.triggerLabel
IconButton.label
```

Issue #58 removes English defaults from Dialog close controls so a shared primitive cannot silently introduce an English-only accessible name into another locale.

## 14. Testing expectations

Unit coverage includes supported locale negotiation, quality ordering, language-family matching, fallback behavior, catalog parity, namespaced lookup/interpolation, representative formatting, and invalid temporal input.

Browser E2E covers the default English document language, `es-PE` request negotiation, Server Component Spanish copy, Client Component Spanish copy, and stable URLs without locale prefixes.

Feature-specific translation tests belong with the feature once feature-owned catalogs exist.

## 15. M3 handoff

M3 may add authenticated user language preference. That integration must preserve these boundaries:

- user preference affects presentation locale;
- Organization country/currency/timezone does not become UI language;
- locale remains browser-safe presentation state;
- route identity remains governed by the product route contract unless explicitly revisited;
- authorization remains unrelated to localization.

M3 should extend locale resolution rather than replace feature translation APIs.

## 16. Durable contract

```text
presentation locale is explicit
        ↓
message ownership follows capability ownership
        ↓
Server and Client Components share one translation boundary
        ↓
Intl handles standards-based presentation formatting
        ↓
currency and timezone business semantics remain explicit inputs
        ↓
URLs do not change merely because UI language changes
```
