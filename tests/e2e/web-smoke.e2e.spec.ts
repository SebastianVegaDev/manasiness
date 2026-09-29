import {
    expect,
    test,
} from '@playwright/test';

test('integrated Web + API + PostgreSQL stack is operational', async ({
    page,
    request,
}) => {
    const readiness =
        await request.get(
            'http://127.0.0.1:3101/health/ready',
        );

    expect(
        readiness.status(),
    ).toBe(200);

    expect(
        await readiness.json(),
    ).toEqual({
        status:
            'ready',

        dependencies: {
            postgresql:
                'ready',
        },
    });

    await page.goto('/');

    await expect(
        page.getByRole(
            'heading',
            {
                name:
                    'Manasiness',
            },
        ),
    ).toBeVisible();

    await expect(
        page.getByText(
            'Web application foundation is running.',
        ),
    ).toBeVisible();
});