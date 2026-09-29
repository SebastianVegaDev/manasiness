import type { NextConfig } from 'next';

import { validatePublicWebEnvironment } from './src/platform/environment/public-environment-schema';

validatePublicWebEnvironment({
    NEXT_PUBLIC_API_ORIGIN: process.env.NEXT_PUBLIC_API_ORIGIN,
});

const nextConfig: NextConfig = {
    typedRoutes: true,
    poweredByHeader: false,
};

export default nextConfig;
