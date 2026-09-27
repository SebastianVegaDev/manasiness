import globals from 'globals';

export function createNodeConfig(files = ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}']) {
    return [
        {
            name: 'manasiness/node-runtime',
            files,
            languageOptions: {
                globals: globals.node,
            },
        },
    ];
}

export default createNodeConfig();