import type { NextConfig } from 'next'

// Note: cacheComponents requires 'use cache: private' for all data access
// including authentication. This needs significant restructuring of the auth
// flow to work properly. For now, disabled to allow standard dynamic rendering.
const nextConfig: NextConfig = {
  basePath: '/admin',
  experimental: {
    turbopackFileSystemCacheForDev: true
  },
  reactCompiler: true,
  reactStrictMode: true,
  typedRoutes: true
}

export default nextConfig
