# ADR 0016: Web localization runtime boundary

- **Status:** Accepted
- **Date:** 2026-09-29
- **Decision owners:** Manasiness Web / Product Experience
- **Related issue:** #58
- **Supersedes:** none
- **Superseded by:** none

## Context

M1 deliberately avoided a permanent product-language assumption. M2 now introduces reusable Web experience infrastructure, so copy, locale negotiation, and user-facing formatting need a stable boundary before feature modules proliferate.

The architecture must support Next.js App Router Server Components and Client Components while preserving existing decisions:

- product routes are stable Organization-scoped URLs rather than language-scoped URLs;
- authentication and user preference persistence belong to M3;
- Organization currency and timezone are business settings, not UI-locale settings;
- reusable UI primitives do not own feature/business wording;
- the Web presents backend/application semantics rather than reimplementing them.

## Decision drivers

The localization foundation should work naturally with App Router, support Server and Client Components, keep language separate from Organization business state, preserve stable URLs, keep message ownership discoverable, use standards-based formatting, avoid translation-vendor infrastructure in M2, and leave a clean seam for a maintained localization engine when real product needs justify it.

## Options considered

### Keep hard-coded copy until feature work

Rejected. English literals would spread through reusable shell/components and make localization a broad later refactor. Formatting ownership would also remain undefined.

### Adopt `next-intl` immediately

`next-intl` is a strong maintained candidate for the current Next.js architecture. It provides Server/Client Component integration, ICU messages, formatting, type-safe workflows, and optional locale-aware routing.

It is not adopted in #58 because the current product surface does not yet require ICU plural/select/rich-message behavior or translation-management integration. Adding it now would expand dependency and upgrade surface before a concrete consumer requires the additional engine.

### Build a full custom localization engine

Rejected. Manasiness should not own ICU MessageFormat parsing, plural categories, grammatical selection, rich-message markup, or translation tooling.

### Own a narrow application boundary over platform standards

Accepted.

The application owns:

```text
supported locale registry
request negotiation
message ownership contract
small key/interpolation adapter
Server Component access
Client Component provider/hook
Intl formatting boundary
```

The application does not implement custom ICU/plural/rich-message semantics. A maintained engine can later replace the small translator behind the same application-facing API.

## Decision

Localization lives under:

```text
apps/web/src/platform/i18n/
```

Application-facing translation APIs are:

```text
getTranslations(namespace)
useTranslations(namespace)
```

### Initial locales

```text
en-US
es-PE
```

with explicit fallback `en-US`.

### Request negotiation

Before M3 authenticated preferences exist, locale resolution uses the request `Accept-Language` header: highest-quality exact supported locale, then supported language-family mapping, then explicit fallback. Malformed/unsupported preferences do not become arbitrary locale state.

### Route identity

Locale is not placed in the product route namespace. Existing `/app/[organizationId]/...` URLs remain the same across UI languages.

### Explicit preference persistence

No locale cookie or backend user preference is introduced in #58. A future explicit language selector may add browser preference state, and M3 may add authenticated user preference persistence. Those sources extend resolution without changing feature translation APIs.

### Message ownership

Platform-owned current messages may live in the platform localization boundary. Future business-feature messages remain feature-owned and are composed into the same API instead of creating one unbounded global dictionary.

### Formatting

User-facing formatting uses JavaScript `Intl` behind a Manasiness-owned formatter boundary. UI locale controls display conventions, while currency code and IANA timezone remain explicit inputs supplied by their owning capability.

Formatting does not perform business calculations.

### Primitive copy

Reusable primitives must not silently inject English product wording. User-facing/accessibility labels owned by the consumer are required inputs where appropriate.

## Consequences

Positive consequences:

- multilingual behavior exists before feature UI proliferates;
- Server and Client Components share a consistent application API;
- product URLs stay stable across languages;
- UI locale cannot silently define Organization currency/timezone;
- advanced tooling can later be adopted behind an explicit seam;
- shared primitives remain language-neutral.

Accepted costs:

- the current narrow translator has less capability than a mature localization engine;
- compile-time message-key tooling is intentionally limited;
- plural/select/rich-message needs require an engine decision before implementation;
- feature message composition will be established when the first feature-owned catalogs have real consumers.

## Guardrails

Do not:

- implement custom plural/ICU parsing in features;
- infer UI language from Organization country, currency, or timezone;
- infer currency/timezone from UI locale;
- translate raw backend exception strings as an API contract;
- add locale-prefixed product routes without revisiting issue #55;
- turn `platform/i18n/messages.ts` into the catalog for every business feature;
- add translation-management infrastructure as part of this ADR.

## Revisit triggers

Re-evaluate the message engine when concrete requirements include plural/select grammar, rich translated markup, large-scale compile-time key validation, extraction/editor workflows, translation-management integration, or many feature-owned catalogs requiring mature composition tooling.

At that point evaluate current maintained libraries—especially `next-intl` for the Next.js runtime—against the existing application-facing boundary.

## Validation

This decision is enforced by unit tests for locale resolution/catalog parity/translation/formatting; Browser E2E for `en-US` and `es-PE`; `<html lang>` reflecting request locale; Dialog copy becoming consumer-supplied; and product documentation separating UI locale from business currency/timezone.
