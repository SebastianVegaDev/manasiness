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

test('form foundation preserves recoverable input and coordinates validation, pending state, success, and confirmation', async ({
    page,
}) => {
    await page.goto('/foundation');

    const form = page.getByRole('form', {
        name: 'Validation and mutation behavior is explicit.',
    });
    const nameInput = form.getByRole('textbox', { name: 'Fixture name' });
    const acknowledgement = form.getByRole('checkbox', {
        name: 'I understand this is an engineering fixture.',
    });
    const outcome = form.getByRole('combobox', { name: 'Simulated response' });
    const submit = form.getByRole('button', { name: 'Submit fixture' });

    await submit.click();
    await expect(form).toHaveAttribute('aria-busy', 'true');
    await expect(form.getByRole('button', { name: 'Submitting fixture…' })).toBeDisabled();

    await expect(nameInput).toBeFocused();
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(nameInput).toHaveAttribute('aria-errormessage', 'form-fixture-name-error');
    await expect(page.getByText('Enter a fixture name.')).toBeVisible();
    await expect(acknowledgement).toHaveAttribute('aria-invalid', 'true');
    await expect(form).toHaveAttribute('data-submission-attempt', '1');

    await nameInput.fill('Recoverable fixture');
    await form.getByText('I understand this is an engineering fixture.', { exact: true }).click();
    await expect(acknowledgement).toBeChecked();
    await outcome.selectOption('rejection');
    await submit.click();

    const rejection = page.getByRole('alert').filter({
        hasText: 'The submission was not accepted.',
    });
    await expect(rejection).toBeVisible();
    await expect(rejection).toContainText('fixture-request-001');
    await expect(rejection).toContainText(
        'The simulated API rejected the operation. The copy is selected from its machine code',
    );
    await expect(nameInput).toHaveValue('Recoverable fixture');
    await expect(acknowledgement).toBeChecked();
    await expect(outcome).toHaveValue('rejection');
    await expect(form).toHaveAttribute('data-submission-attempt', '2');

    await outcome.selectOption('success');
    await page.evaluate(`
        const form = document.querySelector('[data-form-pattern-fixture]');
        if (!(form instanceof HTMLFormElement)) throw new Error('Form fixture not found.');
        form.requestSubmit();
        form.requestSubmit();
    `);

    await expect(form.getByRole('button', { name: 'Submitting fixture…' })).toBeDisabled();
    await expect(
        page.getByRole('status').filter({ hasText: 'Submission accepted.' }),
    ).toContainText('Successful submissions: 1.');
    await expect(form).toHaveAttribute('data-submission-attempt', '3');

    const confirmationTrigger = form.getByRole('button', {
        name: 'Open consequential confirmation',
    });
    await confirmationTrigger.click();

    const confirmation = page.getByRole('alertdialog', { name: 'Remove fixture evidence' });
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toContainText(
        'This demonstration removes only the local confirmation state.',
    );
    await expect(page.getByRole('button', { name: 'Close confirmation' })).toBeFocused();

    await confirmation.getByRole('button', { name: 'Remove fixture evidence' }).click();
    await expect(confirmation).toBeHidden();
    await expect(
        page.getByRole('status').filter({ hasText: 'Consequential confirmation completed.' }),
    ).toBeVisible();
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
