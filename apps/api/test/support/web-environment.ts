import type { EnvironmentSource } from '../../src/platform/config/api-runtime-config.js';

const baseApiTestEnvironment: EnvironmentSource = Object.freeze({
    APP_ENV: 'test',
    API_SERVICE_NAME: 'manasiness-api-test',
    API_LOG_LEVEL: 'error',
    API_HOST: '127.0.0.1',
    API_PORT: '3001',
    API_BODY_LIMIT_BYTES: '1048576',
    API_CORS_ORIGINS: '',
});

export function createApiTestEnvironment(overrides: EnvironmentSource = {}): EnvironmentSource {
    return Object.freeze({
        ...baseApiTestEnvironment,
        ...overrides,
    });
}
