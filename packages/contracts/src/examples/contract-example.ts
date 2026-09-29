import { z } from 'zod';

import { entityIdTransportSchema } from '../primitives/entity-id.js';

export const contractExampleParamsSchema =
    z.strictObject({
        entityId: entityIdTransportSchema,
    });

export const contractExampleQuerySchema =
    z.strictObject({
        limit: z.coerce
            .number()
            .int()
            .min(1)
            .max(100)
            .default(25),
    });

export const contractExampleRequestSchema =
    z.strictObject({
        label: z
            .string()
            .trim()
            .min(1)
            .max(100),
    });

export const contractExampleResponseSchema =
    z.object({
        entityId: entityIdTransportSchema,

        label: z.string(),

        limit: z.number().int().min(1).max(100),
    });

export type ContractExampleParams = z.output<
    typeof contractExampleParamsSchema
>;

export type ContractExampleQuery = z.output<
    typeof contractExampleQuerySchema
>;

export type ContractExampleRequest = z.output<
    typeof contractExampleRequestSchema
>;

export type ContractExampleResponse = z.output<
    typeof contractExampleResponseSchema
>;