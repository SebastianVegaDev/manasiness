import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

const javascriptFiles = ['**/*.{js,mjs,cjs}'];
const typescriptFiles = ['**/*.{ts,tsx,mts,cts}'];
const sourceFiles = [...javascriptFiles, ...typescriptFiles];

function scopeConfigsToTypeScript(configs) {
    return configs.map((config) => ({
        ...config,
        files: typescriptFiles,
    }));
}

export function createBaseConfig({ tsconfigRootDir = process.cwd() } = {}) {
    return [
        {
            name: 'manasiness/ignores',
            ignores: [
                '**/node_modules/**',
                '**/.next/**',
                '**/.turbo/**',
                '**/dist/**',
                '**/build/**',
                '**/coverage/**',
            ],
        },

        {
            ...js.configs.recommended,
            name: 'manasiness/javascript-recommended',
            files: javascriptFiles,
        },

        ...scopeConfigsToTypeScript(tseslint.configs.strictTypeChecked),
        ...scopeConfigsToTypeScript(tseslint.configs.stylisticTypeChecked),

        {
            name: 'manasiness/typescript-language',
            files: typescriptFiles,
            languageOptions: {
                parserOptions: {
                    projectService: true,
                    tsconfigRootDir,
                    onUnsupportedTypeScriptVersion: 'error',
                },
            },
            rules: {
                '@typescript-eslint/consistent-type-imports': [
                    'error',
                    {
                        prefer: 'type-imports',
                        fixStyle: 'inline-type-imports',
                    },
                ],
                '@typescript-eslint/no-unused-vars': [
                    'error',
                    {
                        argsIgnorePattern: '^_',
                        caughtErrorsIgnorePattern: '^_',
                        varsIgnorePattern: '^_',
                        ignoreRestSiblings: true,
                    },
                ],
                '@typescript-eslint/no-explicit-any': 'error',
                '@typescript-eslint/no-floating-promises': 'error',
                '@typescript-eslint/no-misused-promises': 'error',
            },
        },

        {
            name: 'manasiness/workspace-import-policy',
            files: sourceFiles,
            rules: {
                'no-restricted-imports': [
                    'error',
                    {
                        patterns: [
                            {
                                group: [
                                    '@manasiness/*/src/**',
                                    '@manasiness/*/internal/**',
                                    '@manasiness/*/dist/**',
                                ],
                                message:
                                    'Do not import workspace internals directly. Use an entry point declared in the package exports.',
                            },
                        ],
                    },
                ],
            },
        },

        eslintConfigPrettier,
    ];
}

export default createBaseConfig();