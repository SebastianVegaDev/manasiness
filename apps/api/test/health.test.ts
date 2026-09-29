import assert from 'node:assert/strict';
import test from 'node:test';

import {
    Module,
    type DynamicModule,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import {
    HealthModule,
    type HealthModuleOptions,
} from '../src/platform/health/health.module.js';

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

void test(
    'operational health endpoints',
    async (t) => {
        await t.test(
            'liveness is independent from dependency readiness',
            async () => {
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

                    assert.equal(
                        live.status,
                        200,
                    );

                    assert.deepEqual(
                        await live.json(),
                        {
                            status: 'ok',
                        },
                    );

                    const ready =
                        await fetch(
                            `${baseUrl}/health/ready`,
                        );

                    assert.equal(
                        ready.status,
                        503,
                    );

                    const text =
                        await ready.text();

                    assert.equal(
                        text.includes(
                            'database-secret-detail',
                        ),
                        false,
                    );

                    assert.deepEqual(
                        JSON.parse(text),
                        {
                            status:
                                'not_ready',

                            dependencies: {
                                postgresql:
                                    'unavailable',
                            },
                        },
                    );
                } finally {
                    await app.close();
                }
            },
        );

        await t.test(
            'readiness is successful when all required dependencies are available',
            async () => {
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

                    assert.equal(
                        response.status,
                        200,
                    );

                    assert.deepEqual(
                        await response.json(),
                        {
                            status:
                                'ready',

                            dependencies: {
                                postgresql:
                                    'ready',
                            },
                        },
                    );
                } finally {
                    await app.close();
                }
            },
        );
    },
);

async function createApplication(
    options: HealthModuleOptions,
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
