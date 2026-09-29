import { Inject, Injectable, Logger } from '@nestjs/common';

import type { ReadinessDependencyState, ReadinessResponse } from '@manasiness/contracts';

import { toSafeLogError } from '../logging/log-safety.js';

export type DependencyReadiness = ReadinessDependencyState;

export interface ReadinessProbe {
    readonly name: string;

    check(): Promise<void>;
}

export interface ReadinessResult {
    readonly ready: boolean;

    readonly response: ReadinessResponse;
}

export const READINESS_PROBES = Symbol('MANASINESS_READINESS_PROBES');

@Injectable()
export class OperationalHealthService {
    private readonly logger = new Logger(OperationalHealthService.name);

    constructor(
        @Inject(READINESS_PROBES)
        private readonly probes: readonly ReadinessProbe[],
    ) {}

    async checkReadiness(): Promise<ReadinessResult> {
        const states = await Promise.all(
            this.probes.map(async (probe): Promise<readonly [string, ReadinessDependencyState]> => {
                try {
                    await probe.check();

                    return [probe.name, 'ready'];
                } catch (error: unknown) {
                    this.logger.warn(
                        {
                            event: 'health.readiness_dependency_unavailable',

                            dependency: probe.name,

                            error: toSafeLogError(error),
                        },
                        'Readiness dependency unavailable.',
                    );

                    return [probe.name, 'unavailable'];
                }
            }),
        );

        const dependencies = Object.freeze(
            Object.fromEntries(states) as Record<string, ReadinessDependencyState>,
        );

        const ready = states.every(([, state]) => state === 'ready');

        return Object.freeze({
            ready,

            response: Object.freeze({
                status: ready ? 'ready' : 'not_ready',

                dependencies,
            }),
        });
    }
}
