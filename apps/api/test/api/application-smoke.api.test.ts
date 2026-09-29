import {
    afterAll,
    beforeAll,
    describe,
    expect,
    test,
} from 'vitest';
import type {
    NestExpressApplication,
} from '@nestjs/platform-express';

import {
    API_ERROR_CODES,
    apiErrorResponseSchema,
} from '@manasiness/contracts';

import {
    startTestApiApplication,
} from '../support/create-test-api-application.js';

const canonicalUuidV7 =
    '0199f421-55a4-7c8d-9cab-12d9e50ce741';

describe(
    'real API application boundary',
    () => {
        let app:
            NestExpressApplication;

        let baseUrl: string;

        beforeAll(
            async () => {
                app =
                    await startTestApiApplication();

                baseUrl =
                    await app.getUrl();
            },
        );

        afterAll(
            async () => {
                await app.close();
            },
        );

        test('liveness and readiness are reachable through the real application', async () => {
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

            expect(
                live.headers.get(
                    'x-request-id',
                ),
            ).toBeTruthy();

            const ready =
                await fetch(
                    `${baseUrl}/health/ready`,
                );

            expect(
                ready.status,
            ).toBe(200);

            expect(
                await ready.json(),
            ).toEqual({
                status:
                    'ready',

                dependencies: {
                    postgresql:
                        'ready',
                },
            });
        });

        test('the real validation pipeline transforms valid transport input', async () => {
            const response =
                await fetch(
                    `${baseUrl}/_platform/contracts/example/${canonicalUuidV7}?limit=7`,
                    {
                        method:
                            'POST',

                        headers: {
                            'content-type':
                                'application/json',
                        },

                        body: JSON.stringify(
                            {
                                label:
                                    '  Example  ',
                            },
                        ),
                    },
                );

            expect(
                response.status,
            ).toBe(200);

            expect(
                await response.json(),
            ).toEqual({
                entityId:
                    canonicalUuidV7,

                label:
                    'Example',

                limit: 7,
            });
        });

        test('the real validation pipeline returns the shared error contract', async () => {
            const response =
                await fetch(
                    `${baseUrl}/_platform/contracts/example/not-a-uuid?limit=500`,
                    {
                        method:
                            'POST',

                        headers: {
                            'content-type':
                                'application/json',
                        },

                        body: JSON.stringify(
                            {
                                label: '',
                            },
                        ),
                    },
                );

            expect(
                response.status,
            ).toBe(400);

            const body =
                apiErrorResponseSchema.parse(
                    await response.json(),
                );

            expect(
                body.error.type,
            ).toBe(
                'invalid_input',
            );

            expect(
                body.error.code,
            ).toBe(
                API_ERROR_CODES
                    .INVALID_INPUT,
            );

            expect(
                body.error.issues
                    ?.length,
            ).toBeGreaterThan(0);
        });

        test('ordinary Nest 404 failures pass through the shared API error filter', async () => {
            const response =
                await fetch(
                    `${baseUrl}/does-not-exist`,
                );

            expect(
                response.status,
            ).toBe(404);

            const body =
                apiErrorResponseSchema.parse(
                    await response.json(),
                );

            expect(
                body.error.type,
            ).toBe(
                'not_found',
            );

            expect(
                body.error.code,
            ).toBe(
                API_ERROR_CODES
                    .NOT_FOUND,
            );
        });

        test('OpenAPI is generated from the real application contracts', async () => {
            const response =
                await fetch(
                    `${baseUrl}/docs/openapi.json`,
                );

            expect(
                response.status,
            ).toBe(200);

            const document =
                (await response.json()) as {
                    readonly paths?:
                        Record<
                            string,
                            unknown
                        >;
                };

            expect(
                document.paths,
            ).toHaveProperty(
                '/_platform/contracts/example/{entityId}',
            );
        });
    },
);