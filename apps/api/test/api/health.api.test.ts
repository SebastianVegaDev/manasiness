import {
    Module,
    type DynamicModule,
} from '@nestjs/common';
import {
    NestFactory,
} from '@nestjs/core';
import type {
    NestExpressApplication,
} from '@nestjs/platform-express';
import {
    describe,
    expect,
    test,
} from 'vitest';

import {
    HealthModule,
    type HealthModuleOptions,
} from '../../src/platform/health/health.module.js';

@Module({})
class HealthTestModule {
    static register(
        health:
            HealthModuleOptions,
    ): DynamicModule {
        return {
            module:
                HealthTestModule,

            imports: [
                HealthModule.register(
                    health,
                ),
            ],
        };
    }
}

describe(
    'operational health endpoints',
    () => {
        test('liveness remains healthy when a required dependency is unavailable', async () => {
            const app =
                await createApplication(
                    {
                        probes: [
                            {
                                name:
                                    'postgresql',

                                check(): Promise<void> {
                                    return Promise.reject(new Error(
                                        'database-secret-detail',
                                    ));
                                },
                            },
                        ],
                    },
                );

            try {
                const baseUrl =
                    await app.getUrl();

                const live =
                    await fetch(
                        `${baseUrl}/health/live`,
                    );

                expect(
                    live.status,
                ).toBe(200);

                expect(
                    await live.json(),
                ).toEqual({
                    status: 'ok',
                });

                const ready =
                    await fetch(
                        `${baseUrl}/health/ready`,
                    );

                expect(
                    ready.status,
                ).toBe(503);

                const text =
                    await ready.text();

                expect(
                    text,
                ).not.toContain(
                    'database-secret-detail',
                );

                expect(
                    JSON.parse(
                        text,
                    ),
                ).toEqual({
                    status:
                        'not_ready',

                    dependencies: {
                        postgresql:
                            'unavailable',
                    },
                });
            } finally {
                await app.close();
            }
        });

        test('readiness succeeds when all required dependencies are available', async () => {
            const app =
                await createApplication(
                    {
                        probes: [
                            {
                                name:
                                    'postgresql',

                                check(): Promise<void> {
                                    return Promise.resolve();
                                },
                            },
                        ],
                    },
                );

            try {
                const response =
                    await fetch(
                        `${await app.getUrl()}/health/ready`,
                    );

                expect(
                    response.status,
                ).toBe(200);

                expect(
                    await response.json(),
                ).toEqual({
                    status:
                        'ready',

                    dependencies: {
                        postgresql:
                            'ready',
                    },
                });
            } finally {
                await app.close();
            }
        });
    },
);

async function createApplication(
    options:
        HealthModuleOptions,
): Promise<NestExpressApplication> {
    const app =
        await NestFactory.create<NestExpressApplication>(
            HealthTestModule.register(
                options,
            ),
            {
                logger: false,
            },
        );

    await app.listen(
        0,
        '127.0.0.1',
    );

    return app;
}
