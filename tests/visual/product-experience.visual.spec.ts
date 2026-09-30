import { expect, test, type Page } from '@playwright/test';

interface VisualPageOptions {
    readonly height: number;
    readonly theme: 'dark' | 'light';
    readonly width: number;
}

async function openVisualPage(page: Page, path: string, options: VisualPageOptions) {
    await page.setViewportSize({
        width: options.width,
        height: options.height,
    });

    await page.addInitScript(`localStorage.setItem('manasiness.theme', '${options.theme}')`);

    await page.goto(path);

    await expect(page.locator('html')).toHaveAttribute('data-theme', options.theme);

    await page.evaluate(`
        (async () => {
            await document.fonts.ready;

            await Promise.all(
                Array.from(document.images).map((image) => {
                    if (image.complete) {
                        return Promise.resolve();
                    }

                    return new Promise((resolve) => {
                        image.addEventListener('load', resolve, { once: true });
                        image.addEventListener('error', resolve, { once: true });
                    });
                }),
            );
        })()
    `);
}

test.describe('shared product experience visual contracts', () => {
    test('desktop shell preserves the light visual baseline', async ({ page }) => {
        await openVisualPage(page, '/', {
            width: 1280,
            height: 800,
            theme: 'light',
        });

        await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
        await expect(page).toHaveScreenshot('shell-desktop-light.png');
    });

    test('wide shell preserves the dark visual baseline', async ({ page }) => {
        await openVisualPage(page, '/', {
            width: 1440,
            height: 900,
            theme: 'dark',
        });

        await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
        await expect(page).toHaveScreenshot('shell-wide-dark.png');
    });

    test('compact shell preserves closed and open navigation baselines', async ({ page }) => {
        await openVisualPage(page, '/', {
            width: 390,
            height: 844,
            theme: 'light',
        });

        const navigationTrigger = page.getByRole('button', { name: 'Open navigation' });
        await expect(navigationTrigger).toBeVisible();
        await expect(page.locator('aside')).toBeHidden();
        await expect(page).toHaveScreenshot('shell-mobile-light.png');

        await navigationTrigger.click();
        await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible();
        await expect(page).toHaveScreenshot('shell-mobile-navigation-open-light.png');
    });

    test('form validation preserves its shared invalid-state baseline', async ({ page }) => {
        await openVisualPage(page, '/foundation', {
            width: 1280,
            height: 800,
            theme: 'light',
        });

        const form = page.locator('[data-form-pattern-fixture]');
        const nameInput = form.getByRole('textbox', { name: 'Fixture name' });

        await form.getByRole('button', { name: 'Submit fixture' }).click();
        await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
        await expect(form.getByText('Enter a fixture name.')).toBeVisible();
        await nameInput.blur();
        await expect(nameInput).not.toBeFocused();
        await expect(form).toHaveScreenshot('form-invalid-light.png');
    });

    test('collection empty and loading states preserve layout baselines', async ({ page }) => {
        await openVisualPage(page, '/foundation', {
            width: 1280,
            height: 800,
            theme: 'light',
        });

        const collection = page.locator('[data-collection-pattern-fixture]');
        const statePreview = collection.getByRole('combobox', { name: 'State preview' });

        await statePreview.selectOption('empty');
        const emptyState = collection.locator('[data-collection-state="empty"]');
        await expect(emptyState).toBeVisible();
        await expect(emptyState).toHaveScreenshot('collection-empty-light.png');

        await statePreview.selectOption('loading');
        const loadingState = collection.locator('[data-collection-state="loading"]');
        await expect(loadingState).toBeVisible();
        await expect(loadingState).toHaveScreenshot('collection-loading-light.png');
    });

    test('feedback success and structured error preserve visual baselines', async ({ page }) => {
        await openVisualPage(page, '/foundation', {
            width: 1280,
            height: 800,
            theme: 'light',
        });

        const feedback = page.locator('[data-feedback-pattern-fixture]');
        const successAlert = feedback.locator('[data-feedback-tone="success"]').first();

        await expect(successAlert).toBeVisible();
        await expect(successAlert).toHaveScreenshot('feedback-success-alert-light.png');

        await feedback.getByRole('combobox', { name: 'Failure preview' }).selectOption('internal');

        const errorState = feedback.locator('[data-feedback-state="error"]');
        await expect(errorState).toContainText(
            'Something unexpected prevented this view from loading.',
        );
        await expect(errorState).toContainText('feedback-request-001');
        await expect(errorState).toHaveScreenshot('feedback-internal-error-light.png');
    });

    test('irreversible confirmation preserves the shared dialog baseline', async ({ page }) => {
        await openVisualPage(page, '/foundation', {
            width: 1280,
            height: 800,
            theme: 'light',
        });

        const feedback = page.locator('[data-feedback-pattern-fixture]');
        await feedback.getByRole('button', { name: 'Open irreversible confirmation' }).click();

        const dialog = page.getByRole('alertdialog', { name: 'Remove local feedback evidence' });
        await expect(dialog).toBeVisible();
        await expect(dialog).toContainText('Irreversible');
        await expect(page.getByRole('button', { name: 'Close confirmation' })).toBeFocused();
        await expect(dialog).toHaveScreenshot('destructive-confirmation-light.png');
    });
});
