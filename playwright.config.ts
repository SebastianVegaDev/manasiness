import {
    loadEnvFile,
} from 'node:process';

import {
    defineConfig,
    devices,
} from '@playwright/test';

loadDatabaseTestEnvironmentFileIfPresent();

const webOrigin =
    'http://127.0.0.1:3100';

const apiOrigin =
    'http://127.0.0.1:3101';

const databaseRuntimeUrl =
    readDedicatedRuntimeTestDatabaseUrl();

export default defineConfig({
    testDir: './tests/e2e',

    outputDir:
        './test-results/playwright',

    fullyParallel: false,

    forbidOnly:
        process.env['CI'] === 'true',

    retries:
        process.env['CI'] === 'true'
            ? 2
            : 0,

    workers: 1,

    reporter:
        process.env['CI'] === 'true'
            ? [
                  ['github'],
                  [
                      'html',
                      {
                          outputFolder:
                              'playwright-report',
                          open: 'never',
                      },
                  ],
              ]
            : [
                  ['list'],
                  [
                      'html',
                      {
                          outputFolder:
                              'playwright-report',
                          open: 'never',
                      },
                  ],
              ],

    use: {
        baseURL: webOrigin,

        trace:
            'on-first-retry',

        screenshot:
            'only-on-failure',

        video:
            'retain-on-failure',
    },

    projects: [
        {
            name: 'chromium',

            use: {
                ...devices[
                    'Desktop Chrome'
                ],
            },
        },
    ],

    webServer: [
        {
            name: 'API',

            command:
                'pnpm --filter @manasiness/api dev',

            url:
                `${apiOrigin}/health/ready`,

            reuseExistingServer: false,

            timeout:
                120_000,

            stdout: 'ignore',
            stderr: 'pipe',

            env: {
                ...process.env,

                APP_ENV: 'test',

                API_SERVICE_NAME:
                    'manasiness-api-e2e',

                API_LOG_LEVEL: 'error',

                API_LOG_PRETTY:
                    'false',

                API_HOST:
                    '127.0.0.1',

                API_PORT:
                    '3101',

                API_BODY_LIMIT_BYTES:
                    '1048576',

                API_CORS_ORIGINS:
                    webOrigin,

                API_DOCS_ENABLED:
                    'false',

                API_READINESS_TIMEOUT_MS:
                    '2000',

                DATABASE_URL:
                    databaseRuntimeUrl,

                DATABASE_POOL_MAX:
                    '5',

                DATABASE_IDLE_TIMEOUT_MS:
                    '30000',

                DATABASE_CONNECTION_TIMEOUT_MS:
                    '5000',
            },
        },

        {
            name: 'Web',

            command:
                'pnpm --filter @manasiness/web exec next dev --hostname 127.0.0.1 --port 3100',

            url: webOrigin,

            reuseExistingServer: false,

            timeout:
                120_000,

            stdout: 'ignore',
            stderr: 'pipe',

            env: {
                ...process.env,

                APP_ENV: 'test',

                WEB_API_ORIGIN:
                    apiOrigin,

                NEXT_PUBLIC_API_ORIGIN:
                    apiOrigin,
            },
        },
    ],
});

function loadDatabaseTestEnvironmentFileIfPresent(): void {
    const environmentFile =
        new URL(
            './packages/database/.env',
            import.meta.url,
        );

    try {
        loadEnvFile(
            environmentFile,
        );
    } catch (error: unknown) {
        if (
            isMissingFileError(
                error,
            )
        ) {
            return;
        }

        throw new Error(
            'Unable to load packages/database/.env for Playwright.',
            {
                cause: error,
            },
        );
    }
}

function readDedicatedRuntimeTestDatabaseUrl(): string {
    const value =
        process.env[
            'DATABASE_TEST_RUNTIME_URL'
        ];

    if (
        value === undefined ||
        value.trim().length === 0
    ) {
        throw new Error(
            'DATABASE_TEST_RUNTIME_URL is required for browser E2E tests.',
        );
    }

    let url: URL;

    try {
        url = new URL(value);
    } catch {
        throw new Error(
            'DATABASE_TEST_RUNTIME_URL must be a valid URL.',
        );
    }

    const databaseName =
        decodeURIComponent(
            url.pathname.replace(
                /^\/+/u,
                '',
            ),
        );

    if (
        databaseName !==
            'manasiness_test' &&
        !databaseName.startsWith(
            'manasiness_test_',
        )
    ) {
        throw new Error(
            'Browser E2E tests must target a dedicated Manasiness test database.',
        );
    }

    return value;
}

function isMissingFileError(
    error: unknown,
): boolean {
    return (
        error instanceof Error &&
        (
            error as NodeJS.ErrnoException
        ).code === 'ENOENT'
    );
}