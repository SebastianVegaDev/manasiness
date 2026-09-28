import { z } from 'zod';

import {
    createRuntimeConfigurationError,
    httpOriginSchema,
    runtimeEnvironmentSchema,
    type EnvironmentSource,
} from './environment-schema';

const webServerEnvironmentSchema = z.object({
    APP_ENV: runtimeEnvironmentSchema,
    WEB_API_ORIGIN: httpOriginSchema,
});

export type WebRuntimeEnvironment = z.infer<
    typeof runtimeEnvironmentSchema
>;

export interface WebServerRuntimeConfig {
    readonly environment: WebRuntimeEnvironment;
    readonly apiOrigin: string;
}

export function parseWebServerEnvironment(
    environment: EnvironmentSource,
): WebServerRuntimeConfig {
    const result = webServerEnvironmentSchema.safeParse({
        APP_ENV: environment['APP_ENV'],
        WEB_API_ORIGIN:
            environment['WEB_API_ORIGIN'],
    });

    if (!result.success) {
        throw createRuntimeConfigurationError(
            'web server',
            result.error,
        );
    }

    return Object.freeze<WebServerRuntimeConfig>({
        environment: result.data.APP_ENV,
        apiOrigin: result.data.WEB_API_ORIGIN,
    });
}