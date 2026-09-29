import { z } from 'zod';

import {
    createRuntimeConfigurationError,
    httpOriginSchema,
    type EnvironmentSource,
} from './environment-schema';

const publicWebEnvironmentSchema = z.object({
    NEXT_PUBLIC_API_ORIGIN: httpOriginSchema,
});

export interface PublicWebEnvironment {
    readonly apiOrigin: string;
}

export function validatePublicWebEnvironment(environment: EnvironmentSource): PublicWebEnvironment {
    const result = publicWebEnvironmentSchema.safeParse({
        NEXT_PUBLIC_API_ORIGIN: environment['NEXT_PUBLIC_API_ORIGIN'],
    });

    if (!result.success) {
        throw createRuntimeConfigurationError('public web', result.error);
    }

    return Object.freeze<PublicWebEnvironment>({
        apiOrigin: result.data.NEXT_PUBLIC_API_ORIGIN,
    });
}
