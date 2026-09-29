import {
    SerializeOptions,
    applyDecorators,
} from '@nestjs/common';
import {
    ApiResponse,
    type ApiResponseOptions,
} from '@nestjs/swagger';
import {
    z,
    type ZodType,
} from 'zod';

import {
    apiErrorResponseSchema,
} from '@manasiness/contracts';

export interface ApiContractResponseOptions {
    readonly status: number;

    readonly description: string;

    readonly schema: ZodType;
}

export function ApiContractResponse(
    options: ApiContractResponseOptions,
): MethodDecorator {
    return applyDecorators(
        SerializeOptions({
            schema: options.schema,
        }),

        ApiResponse(
            createSwaggerResponse({
                status: options.status,
                description:
                    options.description,
                schema: options.schema,
            }),
        ),
    );
}

export function ApiContractErrorResponse(
    status: number,
    description: string,
): MethodDecorator {
    return ApiResponse(
        createSwaggerResponse({
            status,
            description,
            schema: apiErrorResponseSchema,
        }),
    );
}

function createSwaggerResponse(
    options: ApiContractResponseOptions,
): ApiResponseOptions {
    return {
        status: options.status,

        description:
            options.description,

        schema: z.toJSONSchema(
            options.schema,
            {
                target: 'openapi-3.0',
                io: 'output',
            },
        ),
    } as ApiResponseOptions;
}