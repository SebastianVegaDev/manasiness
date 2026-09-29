import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

function repositoryPath(relativePath: string): string {
    return fileURLToPath(new URL(relativePath, import.meta.url));
}

export default defineConfig({
    oxc: {
        decorator: {
            legacy: true,
            emitDecoratorMetadata: true,
        },

        assumptions: {
            setPublicClassFields: true,
        },

        typescript: {
            removeClassFieldsWithoutInitializer: true,
        },
    },

    resolve: {
        alias: [
            {
                find: /^@manasiness\/contracts$/,
                replacement: repositoryPath('./packages/contracts/src/index.ts'),
            },
            {
                find: /^@manasiness\/platform-primitives$/,
                replacement: repositoryPath('./packages/platform-primitives/src/index.ts'),
            },
            {
                find: /^@manasiness\/database\/testing$/,
                replacement: repositoryPath('./packages/database/src/testing/index.ts'),
            },
            {
                find: /^@manasiness\/database\/schema$/,
                replacement: repositoryPath('./packages/database/src/schema/index.ts'),
            },
            {
                find: /^@manasiness\/database$/,
                replacement: repositoryPath('./packages/database/src/index.ts'),
            },
        ],
    },

    test: {
        pool: 'forks',

        clearMocks: true,
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,

        passWithNoTests: false,

        projects: [
            {
                extends: true,

                test: {
                    name: 'unit',

                    environment: 'node',

                    include: [
                        'packages/*/test/unit/**/*.unit.test.ts',
                        'apps/*/test/unit/**/*.unit.test.ts',
                    ],

                    testTimeout: 5_000,
                    hookTimeout: 5_000,
                },
            },

            {
                extends: true,

                test: {
                    name: 'integration',

                    environment: 'node',

                    include: ['packages/*/test/integration/**/*.integration.test.ts'],

                    fileParallelism: false,

                    testTimeout: 20_000,
                    hookTimeout: 20_000,

                    sequence: {
                        groupOrder: 0,
                    },
                },
            },

            {
                extends: true,

                test: {
                    name: 'api',

                    environment: 'node',

                    include: ['apps/api/test/api/**/*.api.test.ts'],

                    fileParallelism: false,

                    testTimeout: 20_000,
                    hookTimeout: 20_000,

                    sequence: {
                        groupOrder: 1,
                    },
                },
            },
        ],
    },
});
