import type { INestApplication } from '@nestjs/common';
import {
    DocumentBuilder,
    SwaggerModule,
    type OpenAPIObject,
} from '@nestjs/swagger';

export interface OpenApiRuntimeOptions {
    readonly enabled: boolean;
}

export function configureOpenApi(
    app: INestApplication,
    options: OpenApiRuntimeOptions,
): void {
    if (!options.enabled) {
        return;
    }

    const documentFactory = () =>
        createOpenApiDocument(app);

    SwaggerModule.setup(
        'docs',
        app,
        documentFactory,
        {
            ui: false,

            raw: ['json'],

            jsonDocumentUrl:
                'docs/openapi.json',
        },
    );
}

export function createOpenApiDocument(
    app: INestApplication,
): OpenAPIObject {
    const config = new DocumentBuilder()
        .setTitle('Manasiness API')
        .setDescription(
            'HTTP transport contract for the Manasiness modular monolith.',
        )
        .setVersion('0.1.0')
        .build();

    return SwaggerModule.createDocument(
        app,
        config,
        {
            operationIdFactory: (
                controllerKey,
                methodKey,
            ) =>
                `${controllerKey}.${methodKey}`,
        },
    );
}