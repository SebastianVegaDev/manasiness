import { fileURLToPath, URL } from 'node:url';

import { createBaseConfig } from '@manasiness/eslint-config/base';
import { createNodeConfig } from '@manasiness/eslint-config/node';
import { createReactConfig } from '@manasiness/eslint-config/react';

const repositoryRoot = fileURLToPath(new URL('.', import.meta.url));

const nodeFiles = [
    'apps/api/**/*.{js,mjs,cjs,ts,tsx,mts,cts}',
    'packages/database/**/*.{js,mjs,cjs,ts,tsx,mts,cts}',
    'packages/eslint-config/**/*.{js,mjs,cjs,ts,tsx,mts,cts}',
];

const browserFiles = ['apps/web/**/*.{js,mjs,cjs,ts,tsx,mts,cts}'];

const packageFiles = ['packages/**/*.{js,mjs,cjs,ts,tsx,mts,cts}'];

export default [
    ...createBaseConfig({
        tsconfigRootDir: repositoryRoot,
    }),

    ...createNodeConfig(nodeFiles),

    ...createReactConfig(browserFiles),

    {
        name: 'manasiness/package-to-app-boundary',
        files: packageFiles,
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@manasiness/api', '@manasiness/api/*'],
                            message:
                                'Reusable packages must not depend on the API application.',
                        },
                        {
                            group: ['@manasiness/web', '@manasiness/web/*'],
                            message:
                                'Reusable packages must not depend on the web application.',
                        },
                        {
                            group: ['@manasiness/*/*'],
                            message:
                                'Do not deep-import another workspace. Use its public package entry point.',
                        },
                        {
                            group: ['**/apps/**'],
                            message:
                                'Packages must not reach application internals through relative imports.',
                        },
                    ],
                },
            ],
        },
    },
];