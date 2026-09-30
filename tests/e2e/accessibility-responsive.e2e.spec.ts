import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

const REPRESENTATIVE_VIEWPORTS = [
    { name: 'small-mobile', width: 320, height: 568, shell: 'compact' },
    { name: 'large-mobile', width: 390, height: 844, shell: 'compact' },
    { name: 'tablet', width: 768, height: 1024, shell: 'compact' },
    { name: 'compact-laptop', width: 1024, height: 768, shell: 'desktop' },
    { name: 'standard-desktop', width: 1280, height: 800, shell: 'desktop' },
    { name: 'wide-desktop', width: 1440, height: 900, shell: 'desktop' },
] as const;

async function expectNoBlockingAccessibilityViolations(
    page: Page,
    testInfo: TestInfo,
    label: string,
) {
    const results = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();

    await testInfo.attach(`axe-${label}`, {
        body: JSON.stringify(
            {
                url: results.url,
                violations: results.violations,
            },
            null,
            2,
        ),
        contentType: 'application/json',
    });

    const blockingViolations = results.violations
        .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
        .map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            help: violation.help,
            targets: violation.nodes.map((node) => node.target),
        }));

    expect(
        blockingViolations,
        `Serious or critical accessibility violations were found in ${label}.`,
    ).toEqual([]);
}

async function expectNoHorizontalPageOverflow(page: Page) {
    const scrollWidth = (await page.evaluate('document.documentElement.scrollWidth')) as number;
    const clientWidth = (await page.evaluate('document.documentElement.clientWidth')) as number;

    if (scrollWidth > clientWidth + 1) {
        const overflowingElements = (await page.evaluate(`JSON.stringify(
            Array.from(document.querySelectorAll('*'))
                .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
                .slice(0, 12)
                .map((element) => ({
                    tag: element.tagName.toLowerCase(),
                    className: element.getAttribute('class'),
                    right: Math.round(element.getBoundingClientRect().right),
                    scrollWidth: element.scrollWidth,
                }))
        )`)) as string;

        expect(
            scrollWidth,
            `Elements past the viewport: ${overflowingElements}`,
        ).toBeLessThanOrEqual(clientWidth + 1);
    }
}

async function expectLocatorInsideViewport(page: Page, selector: string) {
    const bounds = await page.locator(selector).boundingBox();
    const viewport = page.viewportSize();

    expect(bounds).not.toBeNull();
    expect(viewport).not.toBeNull();

    if (bounds === null || viewport === null) {
        return;
    }

    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height + 1);
}

test('representative light and dark shell surfaces pass blocking accessibility scans', async ({
    page,
}, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
    await expectNoBlockingAccessibilityViolations(page, testInfo, 'shell-light');

    await page.evaluate("localStorage.setItem('manasiness.theme', 'dark')");
    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expectNoBlockingAccessibilityViolations(page, testInfo, 'shell-dark');
});

test('compact navigation passes accessibility scan while its modal state is open', async ({
    page,
}, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.getByRole('button', { name: 'Open navigation' }).click();
    const dialog = page.getByRole('dialog', { name: 'Navigation' });
    await expect(dialog).toBeVisible();

    await expectNoBlockingAccessibilityViolations(page, testInfo, 'compact-navigation-open');
});

test('foundation patterns pass accessibility scans at rest and with representative dialogs', async ({
    page,
}, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/foundation');

    await expectNoBlockingAccessibilityViolations(page, testInfo, 'foundation-resting');

    await page.evaluate("localStorage.setItem('manasiness.theme', 'dark')");
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expectNoBlockingAccessibilityViolations(page, testInfo, 'foundation-dark');

    await page.getByRole('button', { name: 'Open dialog' }).click();
    await expect(page.getByRole('dialog', { name: 'Primitive dialog' })).toBeVisible();
    await expectNoBlockingAccessibilityViolations(page, testInfo, 'foundation-dialog');
    await page.keyboard.press('Escape');

    const feedbackFixture = page.locator('[data-feedback-pattern-fixture]');
    await feedbackFixture.getByRole('button', { name: 'Open irreversible confirmation' }).click();
    await expect(
        page.getByRole('alertdialog', { name: 'Remove local feedback evidence' }),
    ).toBeVisible();
    await expectNoBlockingAccessibilityViolations(page, testInfo, 'foundation-alertdialog');
});

test('keyboard-only desktop navigation reaches the active destination', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Manasiness' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
        page
            .getByRole('navigation', { name: 'Primary navigation' })
            .getByRole('link', { name: 'Overview' }),
    ).toBeFocused();
});

test('keyboard-only compact navigation preserves orientation, containment, Escape, and focus return', async ({
    page,
}) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    const brandLink = page.getByRole('link', { name: 'Manasiness' });
    const navigationTrigger = page.getByRole('button', { name: 'Open navigation' });

    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(brandLink).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(navigationTrigger).toBeFocused();

    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog', { name: 'Navigation' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close navigation' })).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect
        .poll(() =>
            dialog.evaluate((element) => element.contains(element.ownerDocument.activeElement)),
        )
        .toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(navigationTrigger).toBeFocused();
});

test('keyboard interaction remains usable across menu, form controls, collection controls, and confirmation', async ({
    page,
}) => {
    await page.goto('/foundation');

    const menuTrigger = page.getByRole('button', { name: 'Foundation actions' });
    await menuTrigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Mark reviewed' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menuTrigger).toBeFocused();

    const form = page.getByRole('form', {
        name: 'Validation and mutation behavior is explicit.',
    });
    const acknowledgement = form.getByRole('checkbox', {
        name: 'I understand this is an engineering fixture.',
    });
    await acknowledgement.focus();
    await page.keyboard.press('Space');
    await expect(acknowledgement).toBeChecked();

    const collection = page.locator('[data-collection-pattern-fixture]');
    const search = collection.getByRole('searchbox', { name: 'Search fixtures' });
    await search.focus();
    await search.fill('Beta');
    await page.keyboard.press('Enter');
    await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('Beta');

    const feedback = page.locator('[data-feedback-pattern-fixture]');
    const confirmationTrigger = feedback.getByRole('button', {
        name: 'Open irreversible confirmation',
    });
    await confirmationTrigger.focus();
    await page.keyboard.press('Enter');

    const confirmation = page.getByRole('alertdialog', {
        name: 'Remove local feedback evidence',
    });
    await expect(confirmation).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close confirmation' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(confirmation).toBeHidden();
    await expect(confirmationTrigger).toBeFocused();
});

for (const viewport of REPRESENTATIVE_VIEWPORTS) {
    test(`${viewport.name} keeps shell and foundation usable without unintended page overflow`, async ({
        page,
    }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');

        if (viewport.shell === 'compact') {
            await expect(page.locator('aside')).toBeHidden();
            await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
        } else {
            await expect(page.locator('aside')).toBeVisible();
            await expect(
                page.getByRole('navigation', { name: 'Primary navigation' }),
            ).toBeVisible();
        }

        await expectNoHorizontalPageOverflow(page);

        await page.goto('/foundation');
        await expectNoHorizontalPageOverflow(page);

        const collection = page.locator('[data-collection-pattern-fixture]');

        if (viewport.shell === 'compact') {
            await expect(collection.locator('[data-collection-layout="compact"]')).toBeVisible();
            await expect(collection.locator('[data-collection-layout="table"]')).toBeHidden();
        } else {
            await expect(collection.locator('[data-collection-layout="table"]')).toBeVisible();
            await expect(collection.locator('[data-collection-layout="compact"]')).toBeHidden();
        }
    });
}

test('small-mobile dialogs remain within the visual viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');

    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible();
    await expectLocatorInsideViewport(page, 'dialog[open]');
    await page.keyboard.press('Escape');

    await page.goto('/foundation');
    const feedback = page.locator('[data-feedback-pattern-fixture]');
    await feedback.getByRole('button', { name: 'Open irreversible confirmation' }).click();
    await expect(
        page.getByRole('alertdialog', { name: 'Remove local feedback evidence' }),
    ).toBeVisible();
    await expectLocatorInsideViewport(page, 'dialog[open]');
});

test('two-hundred-percent text enlargement preserves reflow at the small-mobile baseline', async ({
    page,
}) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/');
    await page.addStyleTag({
        content: 'html { font-size: 200% !important; }',
    });

    await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
    await expectNoHorizontalPageOverflow(page);

    await page.goto('/foundation');
    await page.addStyleTag({
        content: 'html { font-size: 200% !important; }',
    });
    await expect(page.getByRole('heading', { name: 'Manasiness', level: 1 })).toBeVisible();
    await expectNoHorizontalPageOverflow(page);
});

test('reduced-motion preference keeps representative interactions functional', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const navigationTrigger = page.getByRole('button', { name: 'Open navigation' });
    await navigationTrigger.click();
    await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(navigationTrigger).toBeFocused();

    await page.goto('/foundation');
    const feedback = page.locator('[data-feedback-pattern-fixture]');
    await feedback.getByRole('button', { name: 'Show saved notification' }).click();
    const toast = page
        .locator('[data-feedback-toast-viewport]')
        .getByRole('status')
        .filter({ hasText: 'Fixture saved' });
    await expect(toast).toBeVisible();
    await toast.getByRole('button', { name: 'Dismiss' }).click();
    await expect(toast).toHaveCount(0);
});

test.describe('localized compact accessibility', () => {
    test.use({ locale: 'es-PE' });

    test('Spanish copy remains reflow-safe at the small-mobile baseline', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 568 });
        await page.goto('/');

        await expect(page.locator('html')).toHaveAttribute('lang', 'es-PE');
        await expect(page.getByRole('heading', { name: 'Resumen', level: 1 })).toBeVisible();
        await expectNoHorizontalPageOverflow(page);

        await page.getByRole('button', { name: 'Abrir navegación' }).click();
        await expect(page.getByRole('dialog', { name: 'Navegación' })).toBeVisible();
        await expectNoHorizontalPageOverflow(page);
    });
});
