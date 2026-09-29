import { Module, type DynamicModule } from '@nestjs/common';

import { HealthController } from './health.controller.js';
import {
    OperationalHealthService,
    READINESS_PROBES,
    type ReadinessProbe,
} from './operational-health.service.js';

export interface HealthModuleOptions {
    readonly probes: readonly ReadinessProbe[];
}

@Module({})
export class HealthModule {
    static register(options: HealthModuleOptions): DynamicModule {
        return {
            module: HealthModule,
            controllers: [HealthController],
            providers: [
                OperationalHealthService,
                {
                    provide: READINESS_PROBES,
                    useValue: options.probes,
                },
            ],
        };
    }
}
