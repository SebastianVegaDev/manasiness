import {
    Writable,
} from 'node:stream';

import {
    Controller,
    Get,
    Inject,
    Logger,
    Module,
    Post,
    type DynamicModule,
} from '@nestjs/common';
import {
    NestFactory,
} from '@nestjs/core';
import type {
    NestExpressApplication,
} from '@nestjs/platform-express';
import {
    Logger as PinoNestLogger,
} from 'nestjs-pino';
import type {
    DestinationStream,
} from 'pino';
import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from 'vitest';

import {
    configureApiContractBoundary,
} from '../../src/platform/http/configure-api-contract-boundary.js';
import {
    ObservabilityModule,
} from '../../src/platform/logging/observability.module.js';
import {
    RequestContextService,
} from '../../src/platform/request-context/request-context.service.js';

@Controller('_test/observability')
class ObservabilityProbeController {
    private readonly logger =
        new Logger(
            ObservabilityProbeController.name,
        );

    constructor(
        @Inject(
            RequestContextService,
        )
        private readonly requestContext:
            RequestContextService,
    ) {}

    @Get('context')
    getContext(): {
        readonly requestId:
            string | undefined;
    } {
        return {
            requestId:
                this
                    .requestContext
                    .getRequestId(),
        };
    }

    @Post('secrets')
    logRepresentativeSecrets(): {
        readonly ok: true;
    } {
        this.logger.log(
            {
                event:
                    'test.secret_redaction',

                password:
                    'structured-password-secret',

                databaseUrl:
                    'postgresql://runtime:database-url-secret@localhost/manasiness',

                credentials: {
                    apiKey:
                        'structured-api-key-secret',
                },
            },
            'Representative secret-redaction probe.',
        );

        return {
            ok: true,
        };
    }

    @Get('unexpected')
    failUnexpectedly(): never {
        throw new Error(
            'Connection failed for postgresql://runtime:database-error-secret@localhost/manasiness Authorization: Bearer bearer-error-secret',
        );
    }
}

@Module({})
class ObservabilityTestModule {
    static register(
        destination:
            DestinationStream,
    ): DynamicModule {
        return {
            module:
                ObservabilityTestModule,

            imports: [
                ObservabilityModule.register(
                    {
                        serviceName:
                            'manasiness-api-test',

                        environment:
                            'test',

                        level:
                            'debug',

                        pretty:
                            false,

                        destination,
                    },
                ),
            ],

            controllers: [
                ObservabilityProbeController,
            ],
        };
    }
}

class MemoryLogStream extends Writable {
    readonly lines:
        string[] = [];

    override _write(
        chunk: Buffer,
        _encoding:
            BufferEncoding,
        callback: (
            error?:
                | Error
                | null,
        ) => void,
    ): void {
        this.lines.push(
            chunk.toString(
                'utf8',
            ),
        );

        callback();
    }

    clear(): void {
        this.lines.length = 0;
    }

    text(): string {
        return this.lines.join(
            '',
        );
    }

    jsonEntries(): Record<
        string,
        unknown
    >[] {
        return this.text()
            .split('\n')
            .filter(
                (line) =>
                    line.length > 0,
            )
            .map(
                (line) =>
                    JSON.parse(
                        line,
                    ) as Record<
                        string,
                        unknown
                    >,
            );
    }
}

describe(
    'API observability',
    () => {
        const destination =
            new MemoryLogStream();

        let app:
            NestExpressApplication;

        let baseUrl: string;

        beforeAll(
            async () => {
                app =
                    await NestFactory.create<NestExpressApplication>(
                        ObservabilityTestModule.register(
                            destination,
                        ),
                        {
                            bufferLogs:
                                true,
                        },
                    );

                app.useLogger(
                    app.get(
                        PinoNestLogger,
                    ),
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

        beforeEach(() => {
            destination.clear();
        });

        afterAll(
            async () => {
                await app.close();
            },
        );

        test('accepts and propagates a safe request ID', async () => {
            const requestId =
                'support.case-123';

            const response =
                await fetch(
                    `${baseUrl}/_test/observability/context`,
                    {
                        headers: {
                            'x-request-id':
                                requestId,
                        },
                    },
                );

            expect(
                response.status,
            ).toBe(200);

            expect(
                response.headers.get(
                    'x-request-id',
                ),
            ).toBe(
                requestId,
            );

            expect(
                await response.json(),
            ).toEqual({
                requestId,
            });

            await flushLogWrites();

            expect(
                destination
                    .jsonEntries()
                    .some(
                        (entry) =>
                            entry[
                                'requestId'
                            ] ===
                            requestId,
                    ),
            ).toBe(true);
        });

        test('generates a request ID when none is supplied', async () => {
            const response =
                await fetch(
                    `${baseUrl}/_test/observability/context`,
                );

            const body =
                (await response.json()) as {
                    readonly requestId:
                        string;
                };

            expect(
                response.headers.get(
                    'x-request-id',
                ),
            ).toBe(
                body.requestId,
            );

            expect(
                body.requestId,
            ).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu,
            );
        });

        test('redacts structured secrets and omits request details by default', async () => {
            const response =
                await fetch(
                    `${baseUrl}/_test/observability/secrets?token=query-secret`,
                    {
                        method:
                            'POST',

                        headers: {
                            authorization:
                                'Bearer authorization-secret',

                            cookie:
                                'session=cookie-secret',

                            'content-type':
                                'application/json',
                        },

                        body: JSON.stringify(
                            {
                                password:
                                    'request-body-secret',
                            },
                        ),
                    },
                );

            expect(
                response.status,
            ).toBe(201);

            await flushLogWrites();

            const logs =
                destination.text();

            for (
                const secret of [
                    'structured-password-secret',
                    'structured-api-key-secret',
                    'database-url-secret',
                    'authorization-secret',
                    'cookie-secret',
                    'request-body-secret',
                    'query-secret',
                ]
            ) {
                expect(
                    logs,
                ).not.toContain(
                    secret,
                );
            }

            expect(
                logs,
            ).toContain(
                '[REDACTED]',
            );
        });

        test('unexpected errors preserve correlation without leaking embedded secrets', async () => {
            const requestId =
                'support.error-456';

            const response =
                await fetch(
                    `${baseUrl}/_test/observability/unexpected`,
                    {
                        headers: {
                            'x-request-id':
                                requestId,
                        },
                    },
                );

            expect(
                response.status,
            ).toBe(500);

            expect(
                response.headers.get(
                    'x-request-id',
                ),
            ).toBe(
                requestId,
            );

            await flushLogWrites();

            const logs =
                destination.text();

            expect(
                logs,
            ).not.toContain(
                'database-error-secret',
            );

            expect(
                logs,
            ).not.toContain(
                'bearer-error-secret',
            );

            expect(
                destination
                    .jsonEntries()
                    .some(
                        (entry) =>
                            entry[
                                'requestId'
                            ] ===
                            requestId,
                    ),
            ).toBe(true);
        });
    },
);

async function flushLogWrites(): Promise<void> {
    await new Promise<void>(
        (resolve) => {
            setImmediate(
                resolve,
            );
        },
    );
}