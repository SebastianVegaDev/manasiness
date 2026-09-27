import globals from 'globals';

export function createReactConfig(files = ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}']) {
    return [
        {
            name: 'manasiness/browser-runtime',
            files,
            languageOptions: {
                globals: globals.browser,
            },
        },
    ];
}

export default createReactConfig();