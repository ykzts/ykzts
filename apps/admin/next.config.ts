import { withMicrofrontends } from '@vercel/microfrontends/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true
  },
  reactCompiler: true,
  reactStrictMode: true,
  typedRoutes: true
}

export default withMicrofrontends(nextConfig)
