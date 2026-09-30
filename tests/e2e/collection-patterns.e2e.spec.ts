import { expect, test, type Page } from '@playwright/test';

function collectionFixture(page: Page) {
    return page.locator('[data-collection-pattern-fixture]');
}

test('collection search, filters, and pagination keep meaningful state in the URL', async ({
    page,
}) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/foundation');

    const fixture = collectionFixture(page);
    const table = fixture.getByRole('table', { name: 'Representative collection records' });
    const search = fixture.getByRole('searchbox', { name: 'Search fixtures' });
    const status = fixture.getByRole('combobox', { name: 'Status' });

    await fixture.getByRole('link', { name: 'Next' }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('page')).toBe('2');

    await search.fill('Beta');
    await search.press('Enter');

    await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('Beta');
    await expect.poll(() => new URL(page.url()).searchParams.has('page')).toBe(false);
    await expect(table.getByText('Beta fixture')).toBeVisible();
    await expect(table.getByText('Alpha fixture')).toHaveCount(0);

    await status.selectOption('review');
    await expect.poll(() => new URL(page.url()).searchParams.get('status')).toBe('review');

    await status.selectOption('ready');
    await expect.poll(() => new URL(page.url()).searchParams.get('status')).toBe('ready');
    await expect(fixture.getByText('No records match this view.')).toBeVisible();

    await fixture.getByRole('button', { name: 'Reset view' }).click();

    await expect.poll(() => new URL(page.url()).search).toBe('');
    await expect(search).toHaveValue('');
    await expect(status).toHaveValue('all');
});

test('collection states distinguish loading, refresh, empty, error, and unavailable behavior', async ({
    page,
}) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/foundation');

    const fixture = collectionFixture(page);
    const preview = fixture.getByRole('combobox', { name: 'State preview' });

    await preview.selectOption('loading');
    await expect(fixture.locator('[data-collection-state="loading"]')).toBeVisible();

    await preview.selectOption('refreshing');
    await expect(fixture.locator('[data-collection-state="refreshing"]')).toContainText(
        'Refreshing visible records…',
    );
    await expect(
        fixture
            .getByRole('table', { name: 'Representative collection records' })
            .getByText('Alpha fixture'),
    ).toBeVisible();

    await preview.selectOption('empty');
    await expect(fixture.locator('[data-collection-state="empty"]')).toContainText(
        'No records exist yet.',
    );

    await preview.selectOption('error');
    await expect(fixture.locator('[data-collection-state="error"]')).toHaveRole('alert');
    await fixture.getByRole('button', { name: 'Retry preview' }).click();
    await expect(preview).toHaveValue('ready');

    await preview.selectOption('unavailable');
    await expect(fixture.locator('[data-collection-state="unavailable"]')).toContainText(
        'This collection is unavailable.',
    );
});

test('collection presentation uses semantic tables on desktop and complete compact records on mobile', async ({
    page,
}) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/foundation');

    const fixture = collectionFixture(page);
    const tableLayout = fixture.locator('[data-collection-layout="table"]');
    const compactLayout = fixture.locator('[data-collection-layout="compact"]');
    const table = fixture.getByRole('table', { name: 'Representative collection records' });

    await expect(tableLayout).toBeVisible();
    await expect(compactLayout).toBeHidden();
    await expect(table).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Quantity' })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });

    const compactList = fixture.getByRole('list', {
        name: 'Representative collection records in compact layout',
    });
    const compactItems = compactList.getByRole('listitem');
    const firstCompactItem = compactItems.first();

    await expect(tableLayout).toBeHidden();
    await expect(compactLayout).toBeVisible();
    await expect(compactList).toBeVisible();
    await expect(compactItems).toHaveCount(2);
    await expect(firstCompactItem.getByText('Alpha fixture')).toBeVisible();
    await expect(firstCompactItem.getByText('FX-001')).toBeVisible();
    await expect(firstCompactItem.getByText('Quantity')).toBeVisible();
    await expect(firstCompactItem.getByText('Updated')).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
        'document.documentElement.scrollWidth > window.innerWidth',
    );
    expect(hasHorizontalOverflow).toBe(false);
});
