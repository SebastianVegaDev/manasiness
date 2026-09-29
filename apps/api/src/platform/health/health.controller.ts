import {
    Controller,
    Get,
    HttpStatus,
    Inject,
    Res,
} from '@nestjs/common';

import {
    OperationalHealthService,
    type ReadinessResult,
} from './operational-health.service.js';

interface LivenessResponse {
    readonly status: 'ok';
}

interface MutableHttpResponse {
    status(
        statusCode: number,
    ): unknown;
}

@Controller('health')
export class HealthController {
    constructor(
        @Inject(OperationalHealthService)
        private readonly health:
            OperationalHealthService,
    ) {}

    @Get('live')
    getLiveness(): LivenessResponse {
        return {
            status: 'ok',
        };
    }

    @Get('ready')
    async getReadiness(
        @Res({
            passthrough: true,
        })
        response: MutableHttpResponse,
    ): Promise<
        ReadinessResult['response']
    > {
        const result =
            await this.health
                .checkReadiness();

        if (!result.ready) {
            response.status(
                HttpStatus
                    .SERVICE_UNAVAILABLE,
            );
        }

        return result.response;
    }
}
