import { withMicrofrontends } from '@vercel/microfrontends/next/config'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/blog',
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true
  },
  reactCompiler: true,
  reactStrictMode: true,
  typedRoutes: true
}

export default withMicrofrontends(nextConfig)
