import { z } from 'zod';

export const livenessResponseSchema = z.strictObject({
    status: z.literal('ok'),
});

export const readinessDependencyStateSchema = z.enum(['ready', 'unavailable']);

export const readinessResponseSchema = z.strictObject({
    status: z.enum(['ready', 'not_ready']),

    dependencies: z.record(z.string().min(1), readinessDependencyStateSchema),
});

export type LivenessResponse = z.output<typeof livenessResponseSchema>;

export type ReadinessDependencyState = z.output<typeof readinessDependencyStateSchema>;

export type ReadinessResponse = z.output<typeof readinessResponseSchema>;
