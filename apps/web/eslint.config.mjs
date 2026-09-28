import { fileURLToPath, URL } from 'node:url';

import nextPlugin from '@next/eslint-plugin-next';

import { createBaseConfig } from '@manasiness/eslint-config/base';
import { createReactConfig } from '@manasiness/eslint-config/react';

const webRoot = fileURLToPath(new URL('.', import.meta.url));

const webFiles = ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}'];

export default [
    {
        name: 'manasiness/web-generated-files',
        ignores: ['.next/**', 'next-env.d.ts'],
    },

    ...createBaseConfig({
        tsconfigRootDir: webRoot,
    }),

    ...createReactConfig(webFiles),

    {
        ...nextPlugin.configs['core-web-vitals'],
        name: 'manasiness/nextjs-core-web-vitals',
        files: webFiles,
        settings: {
            next: {
                rootDir: webRoot,
            },
        },
    },
];