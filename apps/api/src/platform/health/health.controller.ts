import { Controller, Get, HttpStatus, Inject, Res } from '@nestjs/common';

import {
    livenessResponseSchema,
    readinessResponseSchema,
    type LivenessResponse,
    type ReadinessResponse,
} from '@manasiness/contracts';

import { ApiContractResponse } from '../openapi/api-contract-response.decorator.js';
import { OperationalHealthService } from './operational-health.service.js';

interface MutableHttpResponse {
    status(statusCode: number): unknown;
}

@Controller('health')
export class HealthController {
    constructor(
        @Inject(OperationalHealthService)
        private readonly health: OperationalHealthService,
    ) {}

    @Get('live')
    @ApiContractResponse({
        status: HttpStatus.OK,

        description: 'The API process is alive.',

        schema: livenessResponseSchema,
    })
    getLiveness(): LivenessResponse {
        return {
            status: 'ok',
        };
    }

    @Get('ready')
    @ApiContractResponse({
        status: HttpStatus.OK,

        description: 'The API is ready to serve application traffic.',

        schema: readinessResponseSchema,
    })
    @ApiContractResponse({
        status: HttpStatus.SERVICE_UNAVAILABLE,

        description: 'A required serving dependency is unavailable.',

        schema: readinessResponseSchema,
    })
    async getReadiness(
        @Res({
            passthrough: true,
        })
        response: MutableHttpResponse,
    ): Promise<ReadinessResponse> {
        const result = await this.health.checkReadiness();

        if (!result.ready) {
            response.status(HttpStatus.SERVICE_UNAVAILABLE);
        }

        return result.response;
    }
}
