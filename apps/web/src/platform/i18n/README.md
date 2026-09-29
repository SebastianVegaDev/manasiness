# Web Localization and Formatting

`platform/i18n/` owns presentation-locale infrastructure for the Manasiness Web application.

It does **not** own Organization business settings, backend business semantics, tax/accounting rules, or authorization.

Read:

```text
docs/product/localization-and-copy.md
docs/adr/0016-web-localization-runtime-boundary.md
```

before changing locale resolution, message ownership, formatting behavior, or the public translation API.

## Supported locales

M2 begins with:

```text
en-US
es-PE
```

The explicit runtime fallback is:

```text
en-US
```

Current request resolution is:

```text
Accept-Language
    ↓
supported exact locale or supported language family
    ↓
en-US fallback
```

Do not infer UI locale from Organization country, currency, timezone, tax configuration, or address data.

## Routes

UI locale does not participate in route identity.

Do not add locale prefixes such as:

```text
/en-US/app/...
/es-PE/app/...
```

without revisiting the route contract in `docs/product/product-experience.md`.

Stable product URLs remain stable across presentation languages.

## Server Components

Use:

```typescript
import { getTranslations } from '../platform/i18n/server';

const t = await getTranslations('landing');
```

Server-only request negotiation stays in `server.ts`, which is protected by `server-only`.

## Client Components

The root layout provides browser-safe locale and message data through `LocalizationProvider`.

Client Components use:

```typescript
import { useTranslations } from '../platform/i18n/localization-provider';

const t = useTranslations('health.api');
```

Do not read request headers, secrets, or server configuration from Client Components.

## Message ownership

The current platform/engineering messages live in:

```text
platform/i18n/messages.ts
```

Future feature copy should remain feature-owned rather than turning this file into a product-wide dumping ground.

Preferred future ownership:

```text
features/<feature>/messages/
```

with route/feature composition providing those messages to the same translation boundary.

Message keys describe semantic purpose, not English wording.

Prefer:

```text
sales.create.submit
inventory.empty.title
```

over:

```text
clickHere
noItemsText
```

Do not compose translatable sentences from several unrelated message fragments.

## Current message engine boundary

The M2 translator intentionally supports:

- namespaced key lookup;
- string messages;
- named interpolation such as `{action}`;
- fail-fast missing keys and missing interpolation values.

It intentionally does not implement a custom ICU/plural/rich-text parser.

When real product copy requires plural categories, grammatical selection, rich messages, or translation-tooling integration, re-evaluate a maintained engine such as `next-intl` behind the existing `getTranslations` / `useTranslations` boundary instead of adding ad-hoc grammar logic to features.

## Formatting

Use `createPresentationFormatter(locale)` for presentation formatting.

The formatter supports:

```text
number
percentage
currency
calendar date
absolute timestamp
relative time
```

Currency must be passed explicitly.

Timestamp timezone must be passed explicitly.

This prevents presentation locale from silently becoming business currency or business timezone.

Examples:

```typescript
const format = createPresentationFormatter(locale);

format.number(1250.5);
format.percentage(0.18);
format.currency(1250.5, currencyCode);
format.calendarDate('2026-09-29');
format.timestamp(instant, organizationTimeZone);
format.relativeTime(-1, 'day');
```

Formatting is presentation only. It must not perform monetary calculations, tax calculations, exchange-rate conversion, accounting rounding, or timezone policy selection.

## UI primitives

Reusable primitives do not own product wording.

Accessible labels and consequential copy must be supplied by their consumer.

For example, `Dialog.closeLabel` is required rather than silently defaulting to English.
