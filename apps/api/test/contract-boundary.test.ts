import assert from 'node:assert/strict';
import test from 'node:test';

import {
    Controller,
    Get,
    Module,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import {
    API_ERROR_CODES,
    apiErrorResponseSchema,
} from '@manasiness/contracts';

import { ContractExampleController } from '../src/platform/contracts/contract-example.controller.js';
import { ExpectedApplicationError } from '../src/platform/errors/expected-application-error.js';
import { configureApiContractBoundary } from '../src/platform/http/configure-api-contract-boundary.js';
import { createOpenApiDocument } from '../src/platform/openapi/configure-openapi.js';

const exampleEntityId =
    '0199f421-55a4-7c8d-9cab-12d9e50ce741';

@Controller('_test/failures')
class FailureProbeController {
    @Get('business')
    businessFailure(): never {
        throw new ExpectedApplicationError({
            kind: 'business_rejection',

            code:
                'testing.business_rejection',

            publicMessage:
                'The operation was rejected.',
        });
    }

    @Get('unexpected')
    unexpectedFailure(): never {
        throw new Error(
            'SECRET_INTERNAL_DETAIL',
        );
    }
}

@Module({
    controllers: [
        ContractExampleController,
        FailureProbeController,
    ],
})
class ContractBoundaryTestModule {}

void test(
    'API transport contract boundary',
    async (t) => {
        const app =
            await createTestApplication();

        try {
            const baseUrl =
                await app.getUrl();

            await t.test(
                'validates params, query, and body and returns transformed values',
                async () => {
                    const response =
                        await fetch(
                            `${baseUrl}/_platform/contracts/example/${exampleEntityId}?limit=7`,
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

                    assert.equal(
                        response.status,
                        200,
                    );

                    assert.deepEqual(
                        await response.json(),
                        {
                            entityId:
                                exampleEntityId,

                            label:
                                'Example',

                            limit: 7,
                        },
                    );
                },
            );

            await t.test(
                'returns structured field-level errors for malformed input',
                async () => {
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
                                        label:
                                            '',
                                    },
                                ),
                            },
                        );

                    assert.equal(
                        response.status,
                        400,
                    );

                    const body =
                        apiErrorResponseSchema.parse(
                            await response.json(),
                        );

                    assert.equal(
                        body.error.type,
                        'invalid_input',
                    );

                    assert.equal(
                        body.error.code,
                        API_ERROR_CODES.INVALID_INPUT,
                    );

                    assert.ok(
                        (
                            body.error
                                .issues ??
                            []
                        ).length > 0,
                    );
                },
            );

            await t.test(
                'maps expected business rejection separately from internal failure',
                async () => {
                    const response =
                        await fetch(
                            `${baseUrl}/_test/failures/business`,
                        );

                    assert.equal(
                        response.status,
                        422,
                    );

                    const body =
                        apiErrorResponseSchema.parse(
                            await response.json(),
                        );

                    assert.equal(
                        body.error.type,
                        'business_rejection',
                    );

                    assert.equal(
                        body.error.code,
                        'testing.business_rejection',
                    );

                    assert.equal(
                        body.error.message,
                        'The operation was rejected.',
                    );
                },
            );

            await t.test(
                'does not expose unexpected exception internals',
                async () => {
                    const response =
                        await fetch(
                            `${baseUrl}/_test/failures/unexpected`,
                        );

                    assert.equal(
                        response.status,
                        500,
                    );

                    const rawBody =
                        await response.text();

                    assert.equal(
                        rawBody.includes(
                            'SECRET_INTERNAL_DETAIL',
                        ),
                        false,
                    );

                    assert.equal(
                        rawBody.includes(
                            'stack',
                        ),
                        false,
                    );

                    const body =
                        apiErrorResponseSchema.parse(
                            JSON.parse(
                                rawBody,
                            ),
                        );

                    assert.equal(
                        body.error.code,
                        API_ERROR_CODES.INTERNAL_ERROR,
                    );
                },
            );

            await t.test(
                'generates OpenAPI from the real route schemas',
                () => {
                    const document =
                        createOpenApiDocument(
                            app,
                        );

                    const operation =
                        document.paths[
                            '/_platform/contracts/example/{entityId}'
                        ]?.post;

                    assert.ok(operation);

                    assert.ok(
                        operation.requestBody,
                    );

                    assert.ok(
                        operation.parameters,
                    );

                    assert.ok(
                        operation.responses[
                            '200'
                        ],
                    );

                    assert.ok(
                        operation.responses[
                            '400'
                        ],
                    );
                },
            );
        } finally {
            await app.close();
        }
    },
);

async function createTestApplication(): Promise<NestExpressApplication> {
    const app =
        await NestFactory.create<NestExpressApplication>(
            ContractBoundaryTestModule,
            {
                logger: false,
            },
        );

    configureApiContractBoundary(
        app,
    );

    await app.listen(
        0,
        '127.0.0.1',
    );

    return app;
}
