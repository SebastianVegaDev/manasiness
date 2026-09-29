import { Body, Controller, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';

import {
    contractExampleParamsSchema,
    contractExampleQuerySchema,
    contractExampleRequestSchema,
    contractExampleResponseSchema,
    type ContractExampleParams,
    type ContractExampleQuery,
    type ContractExampleRequest,
    type ContractExampleResponse,
} from '@manasiness/contracts';

import {
    ApiContractErrorResponse,
    ApiContractResponse,
} from '../openapi/api-contract-response.decorator.js';

@Controller('_platform/contracts')
export class ContractExampleController {
    @Post('example/:entityId')
    @HttpCode(HttpStatus.OK)
    @ApiContractResponse({
        status: HttpStatus.OK,
        description: 'Validated transport-contract example.',
        schema: contractExampleResponseSchema,
    })
    @ApiContractErrorResponse(
        HttpStatus.BAD_REQUEST,
        'The request does not satisfy the transport contract.',
    )
    validateContract(
        @Param({
            schema: contractExampleParamsSchema,
        })
        params: ContractExampleParams,

        @Query({
            schema: contractExampleQuerySchema,
        })
        query: ContractExampleQuery,

        @Body({
            schema: contractExampleRequestSchema,
        })
        body: ContractExampleRequest,
    ): ContractExampleResponse {
        return {
            entityId: params.entityId,
            label: body.label,
            limit: query.limit,
        };
    }
}
