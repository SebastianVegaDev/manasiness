# Visual Regression Quality Gate

> **Status:** Active  
> **Milestone:** M2 — Product Experience Foundation  
> **Issue:** [#64](https://github.com/SebastianVegaDev/manasiness/issues/64)

## Purpose

Manasiness uses a deliberately small screenshot-regression suite to protect the shared M2 product-experience foundation before later milestones build business screens on top of it.

Visual regression complements, rather than replaces:

- functional Browser E2E;
- accessibility scans and keyboard checks;
- unit, integration, and API tests;
- human review of product behavior and copy.

The suite protects high-leverage visual contracts. It is not a screenshot catalog for every primitive state.

## Ownership and tooling

Visual regression uses the repository's existing Playwright installation.

No Storybook, Chromatic, Percy, hosted visual-testing service, or additional screenshot dependency is required for M2.

Playwright project:

```text
visual-chromium-linux
```

Visual tests live under:

```text
tests/visual/
```

Committed baselines live under:

```text
tests/visual/__snapshots__/
```

The functional `chromium` project continues to own user-observable browser behavior under `tests/e2e/`.

## Canonical rendering platform

Canonical visual baselines are generated on:

```text
Ubuntu 24.04
Playwright 1.63.0
Playwright-managed Chromium
Node 24.21.x
pnpm 12.6.0
```

The operating system matters because font rasterization and browser rendering can differ across platforms.

A screenshot generated on Windows or macOS is not automatically a canonical baseline even when the application is functionally correct.

The normal functional E2E command remains portable. Canonical pixel comparison is owned by the Linux visual project and CI.

## Determinism contract

The visual project fixes or waits for the sources of variance that M2 controls:

- locale is `en-US`;
- timezone is `UTC`;
- device scale factor is `1`;
- representative viewports are explicit in the tests;
- each captured surface explicitly selects light or dark theme;
- reduced motion is enabled;
- Playwright screenshot animations are disabled;
- caret styling remains unchanged so screenshot capture does not mutate server-rendered DOM during hydration;
- tests move focus away from text inputs before capture when a caret could create visual variance;
- screenshots use CSS-pixel scale;
- fixture content is product-neutral and deterministic;
- `document.fonts.ready` resolves before capture;
- images inside the document are loaded or resolved before capture;
- screenshots do not depend on the current clock, random identifiers, user data, or secrets;
- foundation screenshots avoid the live API-readiness region and capture only deterministic M2 fixtures.

Do not stabilize a noisy screenshot by hiding meaningful UI or by adding arbitrary sleeps.

Prefer an explicit readiness condition owned by the surface.

## Comparison strictness

The M2 baseline intentionally uses:

```text
maxDiffPixels: 0
threshold: 0.1
```

A changed pixel that exceeds the configured perceptual threshold fails the visual assertion.

Do not increase tolerance merely to make a legitimate regression disappear. If a surface is genuinely nondeterministic, remove or control the source of nondeterminism.

## Baseline set

The initial M2 suite covers ten high-value images.

| Area | Baseline |
| --- | --- |
| Application shell | Standard desktop, light theme |
| Application shell | Wide desktop, dark theme |
| Application shell | Compact/mobile shell, closed navigation |
| Application shell | Compact/mobile shell, navigation open |
| Forms | Invalid submission with shared validation feedback |
| Collections | Empty collection state |
| Collections | Initial loading/skeleton state |
| Feedback | Success alert |
| Feedback | Structured internal-error state with request ID |
| Confirmation | Irreversible confirmation dialog |

These baselines intentionally reuse M2 engineering fixtures. They do not create fake Customer, Product, Sale, or other business-domain screens.

Collection-state baselines capture the state surface itself instead of the entire engineering fixture. This prevents unrelated toolbar/layout composition from becoming part of an empty/loading contract.

Add another baseline only when it protects a distinct shared visual contract whose regression would have meaningful downstream impact.

## Commands

### Functional Browser E2E

```powershell
pnpm test:e2e
```

This remains the portable functional browser suite.

### Compare canonical visual baselines

On the supported Linux rendering environment:

```powershell
pnpm test:visual
```

### Intentionally update visual baselines

On the supported Linux rendering environment:

```powershell
pnpm test:visual:update
```

This command uses Playwright's `--update-snapshots` behavior. It is for intentional reviewable changes, never for making CI green without understanding a diff.

### CI browser gate

The existing `Browser E2E` quality gate runs both projects after one shared environment preparation:

```text
chromium
visual-chromium-linux
```

The required job name remains `Browser E2E`.

## Repository-supported Linux baseline generation

For contributors working on another operating system, use the manually triggered GitHub Actions workflow:

```text
Visual Baseline Generation
```

Run it against the branch containing the intentional UI change.

The workflow:

1. checks out the selected revision;
2. uses Ubuntu 24.04 and the repository-pinned toolchain;
3. installs Playwright Chromium;
4. runs `pnpm test:visual:update`;
5. uploads `tests/visual/__snapshots__/` as a downloadable artifact;
6. never commits or pushes snapshot changes.

Download the generated artifact, replace the branch's baseline files with those generated files, inspect every changed image, and commit only the approved baselines with the UI/test implementation.

This is generation automation, not snapshot approval automation.

## Intentional baseline update workflow

Use this sequence:

```text
intentional shared UI/token/theme change
→ run or generate canonical Linux snapshots
→ inspect visual differences
→ confirm the difference matches the intended product change
→ commit changed baselines with the implementation
→ reviewer evaluates code and image changes together
→ normal CI compares rather than updates snapshots
```

CI must never run `--update-snapshots` in a pull-request quality gate.

A missing or changed baseline must fail comparison until a human intentionally updates the reviewed source artifact.

## Failure diagnosis

The existing `Browser E2E` failure artifact already preserves:

```text
playwright-report/
test-results/
```

Playwright places expected, actual, and diff screenshot evidence in the test output when visual comparison fails. The existing artifact upload therefore remains the canonical diagnostic path and does not require another required CI job.

## Theme strategy

The suite does not duplicate every screenshot in light and dark themes.

Theme coverage is representative:

- standard desktop shell covers light;
- wide desktop shell covers dark;
- interaction-pattern snapshots use light unless dark rendering protects a distinct contract.

Add dark duplication only when a future shared surface has meaningful theme-specific behavior that is not already protected by the representative baselines.

## Accessibility boundary

Visual snapshots do not replace Issue #63 accessibility gates.

Do not:

- remove semantic markup to stabilize a screenshot;
- suppress an axe rule to preserve a baseline;
- alter focus behavior merely to reduce image variance;
- hide required error/status text from screenshots when it belongs to the product state.

Accessibility remains source behavior. Visual tests verify its presentation only where that presentation is part of the captured contract.

## Review rules

A reviewer should reject a snapshot update when:

- the visual change is unexplained;
- the changed image contains unexpected business/user data;
- a broad token regression was accepted accidentally;
- a tolerance increase masks the difference;
- a dynamic value was introduced into a canonical fixture;
- the baseline was produced on an unsupported platform without canonical Linux verification;
- screenshots were updated while functional or accessibility failures remain unresolved.

A baseline is reviewed source code in image form.

## Non-goals

M2 visual regression does not provide:

- every primitive permutation;
- every viewport in the #63 responsive matrix;
- every locale;
- every theme for every fixture;
- cross-browser or cross-OS pixel comparison;
- hosted visual-review infrastructure;
- product-domain screenshots;
- marketing-site screenshots;
- automatic baseline acceptance.

Future expansion requires evidence that another baseline protects a real shared contract rather than increasing screenshot count for its own sake.
