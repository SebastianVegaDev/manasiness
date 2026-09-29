import { expect, test } from '@playwright/test';

test('integrated Web + API + PostgreSQL stack is operational', async ({ page, request }) => {
    const readiness = await request.get('http://127.0.0.1:3101/health/ready');

    expect(readiness.status()).toBe(200);

    expect(await readiness.json()).toEqual({
        status: 'ready',

        dependencies: {
            postgresql: 'ready',
        },
    });

    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');

    await expect(
        page.getByRole('heading', {
            name: 'Manasiness',
        }),
    ).toBeVisible();

    await expect(page.getByText('Web application foundation is running.')).toBeVisible();

    await expect(page.getByText('API connection: ready.')).toBeVisible();
});

test('stored theme preference is applied before the application hydrates', async ({ page }) => {
    await page.addInitScript("localStorage.setItem('manasiness.theme', 'dark');");

    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(11, 16, 32)');
});

test('shared UI primitives preserve accessible names, disabled state, and keyboard focus', async ({
    page,
}) => {
    await page.goto('/');

    const foundationName = page.getByRole('textbox', {
        name: 'Foundation name',
    });

    await expect(foundationName).toHaveAttribute('aria-describedby', 'foundation-name-description');
    await expect(page.locator('#foundation-name-description')).toContainText(
        'Native field semantics stay explicit',
    );

    await expect(
        page.getByRole('button', {
            name: 'Disabled control',
        }),
    ).toBeDisabled();

    const menuTrigger = page.getByRole('button', {
        name: 'Foundation actions',
    });

    await menuTrigger.focus();
    await page.keyboard.press('ArrowDown');

    const reviewedAction = page.getByRole('menuitem', {
        name: 'Mark reviewed',
    });
    const resetAction = page.getByRole('menuitem', {
        name: 'Reset review',
    });

    await expect(reviewedAction).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(resetAction).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menuTrigger).toBeFocused();

    const dialogTrigger = page.getByRole('button', {
        name: 'Open dialog',
    });

    await dialogTrigger.click();

    const dialog = page.getByRole('dialog', {
        name: 'Primitive dialog',
    });

    await expect(dialog).toBeVisible();
    await expect(
        page.getByRole('button', {
            name: 'Close dialog',
        }),
    ).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(dialog).toBeHidden();
    await expect(dialogTrigger).toBeFocused();
});

test.describe('browser locale negotiation', () => {
    test.use({ locale: 'es-PE' });

    test('localizes server and client product copy without changing the route', async ({
        page,
    }) => {
        await page.goto('/');

        await expect(page).toHaveURL(/\/$/u);
        await expect(page.locator('html')).toHaveAttribute('lang', 'es-PE');
        await expect(page.getByText('La base de la aplicación web está operativa.')).toBeVisible();
        await expect(page.getByText('Conexión con la API: operativa.')).toBeVisible();
        await expect(
            page.getByRole('button', {
                name: 'Abrir diálogo',
            }),
        ).toBeVisible();
    });
});
