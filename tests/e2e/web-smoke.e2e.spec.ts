import { expect, test } from '@playwright/test';

const organizationId = '0199a0d7-9fd4-7a51-8c2d-beb01a8dd2f1';

test('integrated Web + API + PostgreSQL stack is operational', async ({ page, request }) => {
    const readiness = await request.get('http://127.0.0.1:3101/health/ready');

    expect(readiness.status()).toBe(200);

    expect(await readiness.json()).toEqual({
        status: 'ready',

        dependencies: {
            postgresql: 'ready',
        },
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
    await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
    await expect(
        page.getByText('The application shell is ready for real product capabilities.'),
    ).toBeVisible();
});

test('stored theme preference is applied before the application hydrates', async ({ page }) => {
    await page.addInitScript("localStorage.setItem('manasiness.theme', 'dark');");
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(11, 16, 32)');
});

test('desktop shell exposes current location without fake working destinations', async ({
    page,
}) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const sidebar = page.locator('aside');
    const navigation = sidebar.getByRole('navigation', { name: 'Primary navigation' });
    const overview = navigation.getByRole('link', { name: 'Overview' });

    await expect(sidebar).toBeVisible();
    await expect(overview).toHaveAttribute('aria-current', 'page');
    await expect(navigation.getByRole('link', { name: 'Sales' })).toHaveCount(0);
    await expect(
        navigation.locator('[data-availability="unimplemented"]').filter({ hasText: 'Sales' }),
    ).toContainText('Later');

    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
});

test('compact shell uses modal navigation with focus return and no horizontal overflow', async ({
    page,
}) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.locator('aside')).toBeHidden();

    const navigationTrigger = page.getByRole('button', { name: 'Open navigation' });
    await navigationTrigger.click();

    const dialog = page.getByRole('dialog', { name: 'Navigation' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close navigation' })).toBeFocused();
    await expect(dialog.getByRole('link', { name: 'Overview' })).toHaveAttribute(
        'aria-current',
        'page',
    );

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(navigationTrigger).toBeFocused();

    const hasHorizontalOverflow = await page.evaluate(
        'document.documentElement.scrollWidth > window.innerWidth',
    );
    expect(hasHorizontalOverflow).toBe(false);
});

test('organization-scoped shell preserves explicit route context and overview redirect', async ({
    page,
}) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`/app/${organizationId}`);

    const sidebar = page.locator('aside');

    await expect(page).toHaveURL(`/app/${organizationId}/overview`);
    await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
    await expect(
        sidebar.getByRole('group', { name: 'Organization' }).getByText('Context 0199a0d7…'),
    ).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Overview' })).toHaveAttribute(
        'href',
        `/app/${organizationId}/overview`,
    );
});

test('engineering diagnostics remain available outside product navigation', async ({ page }) => {
    await page.goto('/foundation');

    await expect(page.getByText('API connection: ready.')).toBeVisible();

    const foundationName = page.getByRole('textbox', { name: 'Foundation name' });
    await expect(foundationName).toHaveAttribute('aria-describedby', 'foundation-name-description');

    const menuTrigger = page.getByRole('button', { name: 'Foundation actions' });
    await menuTrigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Mark reviewed' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menuTrigger).toBeFocused();

    const dialogTrigger = page.getByRole('button', { name: 'Open dialog' });
    await dialogTrigger.click();

    const dialog = page.getByRole('dialog', { name: 'Primitive dialog' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(dialogTrigger).toBeFocused();
});

test.describe('browser locale negotiation', () => {
    test.use({ locale: 'es-PE' });

    test('localizes the shell without changing route identity or breaking compact layout', async ({
        page,
    }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');

        await expect(page).toHaveURL(/\/$/u);
        await expect(page.locator('html')).toHaveAttribute('lang', 'es-PE');
        await expect(page.getByRole('heading', { name: 'Resumen', level: 1 })).toBeVisible();

        const navigationTrigger = page.getByRole('button', { name: 'Abrir navegación' });
        await navigationTrigger.click();
        await expect(page.getByRole('dialog', { name: 'Navegación' })).toBeVisible();

        const hasHorizontalOverflow = await page.evaluate(
            'document.documentElement.scrollWidth > window.innerWidth',
        );
        expect(hasHorizontalOverflow).toBe(false);
    });
});
