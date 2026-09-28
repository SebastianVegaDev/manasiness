import 'server-only';

import {
    parseWebServerEnvironment,
    type WebServerRuntimeConfig,
} from './server-environment-schema';

export function loadWebServerRuntimeConfig(
    environment: Readonly<
        Record<string, string | undefined>
    > = process.env,
): WebServerRuntimeConfig {
    return parseWebServerEnvironment(environment);
}