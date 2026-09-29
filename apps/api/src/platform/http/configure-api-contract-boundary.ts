import {
    StandardSchemaSerializerInterceptor,
    StandardSchemaValidationPipe,
    type INestApplication,
} from '@nestjs/common';
import {
    HttpAdapterHost,
    Reflector,
} from '@nestjs/core';

import { ApiExceptionFilter } from '../errors/api-exception.filter.js';
import { createTransportValidationException } from '../errors/transport-validation.exception.js';

export function configureApiContractBoundary(
    app: INestApplication,
): void {
    app.useGlobalPipes(
        new StandardSchemaValidationPipe({
            exceptionFactory: (issues) =>
                createTransportValidationException(
                    issues,
                ),
        }),
    );

    app.useGlobalInterceptors(
        new StandardSchemaSerializerInterceptor(
            app.get(Reflector),
        ),
    );

    app.useGlobalFilters(
        new ApiExceptionFilter(
            app.get(HttpAdapterHost),
        ),
    );
}