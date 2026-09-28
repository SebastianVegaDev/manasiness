import type { RuntimeLogLevel } from './api-runtime-config.js';

const nestLogLevels = {
    debug: ['error', 'warn', 'log', 'debug'],
    info: ['error', 'warn', 'log'],
    warn: ['error', 'warn'],
    error: ['error'],
} as const satisfies Record<
    RuntimeLogLevel,
    readonly ('error' | 'warn' | 'log' | 'debug')[]
>;

export function resolveNestLogLevels(
    level: RuntimeLogLevel,
): ('error' | 'warn' | 'log' | 'debug')[] {
    return [...nestLogLevels[level]];
}