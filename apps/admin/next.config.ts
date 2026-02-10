import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/admin',
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true
  },
  reactCompiler: true,
  reactStrictMode: true,
  typedRoutes: true
}

export default nextConfig
