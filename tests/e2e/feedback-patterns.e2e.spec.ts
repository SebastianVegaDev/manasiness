import { expect, test, type Page } from '@playwright/test';

function feedbackFixture(page: Page) {
    return page.locator('[data-feedback-pattern-fixture]');
}

test('feedback channels keep persistent information available and transient notifications dismissible', async ({
    page,
}) => {
    await page.goto('/foundation');

    const fixture = feedbackFixture(page);
    const banner = fixture.locator('[data-feedback-presentation="banner"]');

    await expect(banner).toContainText('Persistent banner example');
    await expect(banner).toContainText(
        'Use a banner for cross-surface information that must remain visible while the condition lasts.',
    );

    await fixture.getByRole('button', { name: 'Show saved notification' }).click();

    const viewport = page.locator('[data-feedback-toast-viewport]');
    const toast = viewport.getByRole('status').filter({ hasText: 'Fixture saved' });
    const dismiss = toast.getByRole('button', { name: 'Dismiss' });

    await expect(toast).toBeVisible();
    await dismiss.focus();
    await page.waitForTimeout(1100);
    await expect(toast).toBeVisible();

    await dismiss.click();
    await expect(toast).toHaveCount(0);
    await expect(banner).toBeVisible();
});

test('generic feedback states distinguish loading, refresh, absence, configuration, history, and availability', async ({
    page,
}) => {
    await page.goto('/foundation');

    const fixture = feedbackFixture(page);
    const preview = fixture.getByRole('combobox', { name: 'State preview' });

    await preview.selectOption('loading');
    await expect(fixture.locator('[data-feedback-state="loading"]')).toBeVisible();

    await preview.selectOption('refreshing');
    await expect(fixture.locator('[data-feedback-state="refreshing"]')).toContainText(
        'Refreshing while current content remains visible…',
    );
    await expect(fixture.locator('[data-feedback-stable-content]')).toContainText(
        'Useful content remains visible.',
    );

    await preview.selectOption('empty');
    await expect(fixture.locator('[data-feedback-state="empty"]')).toContainText(
        'Nothing exists here yet.',
    );

    await preview.selectOption('zero-results');
    await expect(fixture.locator('[data-feedback-state="zero-results"]')).toContainText(
        'Nothing matches the current view.',
    );

    await preview.selectOption('not-configured');
    await expect(fixture.locator('[data-feedback-state="not-configured"]')).toContainText(
        'This area is not configured yet.',
    );

    await preview.selectOption('no-history');
    await expect(fixture.locator('[data-feedback-state="no-history"]')).toContainText(
        'No history has been recorded yet.',
    );

    await preview.selectOption('unavailable');
    await expect(fixture.locator('[data-feedback-state="unavailable"]')).toContainText(
        'This area is unavailable.',
    );
});

test('structured failures expose safe recovery without rendering technical API messages', async ({
    page,
}) => {
    await page.goto('/foundation');

    const fixture = feedbackFixture(page);
    const preview = fixture.getByRole('combobox', { name: 'Failure preview' });

    await preview.selectOption('internal');

    const internalFailure = fixture.locator('[data-feedback-state="error"]');
    await expect(internalFailure).toHaveRole('alert');
    await expect(internalFailure).toContainText(
        'Something unexpected prevented this view from loading.',
    );
    await expect(internalFailure).toContainText('feedback-request-001');
    await expect(
        fixture.getByText('Technical internal fixture message that must never reach the operator.'),
    ).toHaveCount(0);

    await fixture.getByRole('button', { name: 'Retry failure preview' }).click();
    await expect(
        fixture.getByRole('status').filter({ hasText: 'Recovery action completed.' }),
    ).toBeVisible();

    await preview.selectOption('protocol');
    await expect(fixture.locator('[data-feedback-state="error"]')).toContainText(
        'The service returned an unexpected response.',
    );
    await expect(fixture.locator('[data-feedback-state="error"]')).toContainText(
        'feedback-request-002',
    );
    await expect(fixture.getByRole('button', { name: 'Retry failure preview' })).toHaveCount(0);

    await preview.selectOption('network');
    await expect(fixture.locator('[data-feedback-state="error"]')).toContainText(
        'The service could not be reached.',
    );
    await expect(fixture.getByRole('button', { name: 'Retry failure preview' })).toBeVisible();
});

test('consequential confirmation names irreversible impact and restores focus', async ({
    page,
}) => {
    await page.goto('/foundation');

    const fixture = feedbackFixture(page);
    const trigger = fixture.getByRole('button', { name: 'Open irreversible confirmation' });
    await trigger.click();

    const dialog = page.getByRole('alertdialog', { name: 'Remove local feedback evidence' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Irreversible');
    await expect(dialog).toContainText(
        'This engineering action clears only local fixture evidence. It does not delete product or business data.',
    );
    await expect(page.getByRole('button', { name: 'Close confirmation' })).toBeFocused();

    await dialog.getByRole('button', { name: 'Remove local feedback evidence' }).click();

    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(
        fixture.getByRole('status').filter({ hasText: 'Consequential confirmation completed.' }),
    ).toBeVisible();
});
