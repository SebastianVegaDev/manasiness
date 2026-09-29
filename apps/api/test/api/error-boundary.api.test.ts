import {
    Controller,
    Get,
    Module,
} from '@nestjs/common';
import {
    NestFactory,
} from '@nestjs/core';
import type {
    NestExpressApplication,
} from '@nestjs/platform-express';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    test,
} from 'vitest';

import {
    API_ERROR_CODES,
    apiErrorResponseSchema,
} from '@manasiness/contracts';

import {
    ExpectedApplicationError,
} from '../../src/platform/errors/expected-application-error.js';
import {
    configureApiContractBoundary,
} from '../../src/platform/http/configure-api-contract-boundary.js';

@Controller('_test/failures')
class FailureProbeController {
    @Get('business')
    businessFailure(): never {
        throw new ExpectedApplicationError(
            {
                kind:
                    'business_rejection',

                code:
                    'testing.business_rejection',

                publicMessage:
                    'The operation was rejected.',
            },
        );
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
        FailureProbeController,
    ],
})
class ErrorBoundaryTestModule {}

describe(
    'API error boundary',
    () => {
        let app:
            NestExpressApplication;

        let baseUrl: string;

        beforeAll(
            async () => {
                app =
                    await NestFactory.create<NestExpressApplication>(
                        ErrorBoundaryTestModule,
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

                baseUrl =
                    await app.getUrl();
            },
        );

        afterAll(
            async () => {
                await app.close();
            },
        );

        test('expected business rejection remains distinguishable', async () => {
            const response =
                await fetch(
                    `${baseUrl}/_test/failures/business`,
                );

            expect(
                response.status,
            ).toBe(422);

            const body =
                apiErrorResponseSchema.parse(
                    await response.json(),
                );

            expect(
                body.error,
            ).toMatchObject({
                type:
                    'business_rejection',

                code:
                    'testing.business_rejection',

                message:
                    'The operation was rejected.',
            });
        });

        test('unexpected errors never expose internal exception messages', async () => {
            const response =
                await fetch(
                    `${baseUrl}/_test/failures/unexpected`,
                );

            expect(
                response.status,
            ).toBe(500);

            const rawBody =
                await response.text();

            expect(
                rawBody,
            ).not.toContain(
                'SECRET_INTERNAL_DETAIL',
            );

            expect(
                rawBody,
            ).not.toContain(
                'stack',
            );

            const body =
                apiErrorResponseSchema.parse(
                    JSON.parse(
                        rawBody,
                    ),
                );

            expect(
                body.error.code,
            ).toBe(
                API_ERROR_CODES
                    .INTERNAL_ERROR,
            );
        });
    },
);