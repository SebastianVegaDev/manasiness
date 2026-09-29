'use client';

import { publicWebRuntimeConfig } from '../environment/public-environment';
import { createApiClient } from './api-client';

export const browserApiClient = createApiClient({
    origin: publicWebRuntimeConfig.apiOrigin,

    credentials: 'include',
});
