import { expect, test } from 'vitest';

import { parseWebServerEnvironment } from '../../src/platform/environment/server-environment-schema.js';

test('web server environment validates and normalizes the API origin', () => {
    const config = parseWebServerEnvironment({
        APP_ENV: 'test',

        WEB_API_ORIGIN: 'http://127.0.0.1:3101/',
    });

    expect(config).toEqual({
        environment: 'test',

        apiOrigin: 'http://127.0.0.1:3101',
    });
});

test('web server environment rejects credential-bearing origins', () => {
    expect(() =>
        parseWebServerEnvironment({
            APP_ENV: 'test',

            WEB_API_ORIGIN: 'http://user:secret@127.0.0.1:3101',
        }),
    ).toThrow(/Invalid web server runtime configuration/u);
});

test('web server environment requires an explicit runtime environment', () => {
    expect(() =>
        parseWebServerEnvironment({
            WEB_API_ORIGIN: 'http://127.0.0.1:3101',
        }),
    ).toThrow(/Invalid web server runtime configuration/u);
});
