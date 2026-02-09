import type { NextConfig } from 'next'

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
