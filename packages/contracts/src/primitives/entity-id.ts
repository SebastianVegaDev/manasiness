import { z } from 'zod';

export const entityIdTransportSchema = z
    .uuidv7()
    .meta({
        description:
            'Canonical RFC 9562 UUIDv7 durable entity identifier.',
    });

export type EntityIdTransport = z.output<
    typeof entityIdTransportSchema
>;