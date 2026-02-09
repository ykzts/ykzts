import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true
  },
  reactCompiler: true,
  reactStrictMode: true,
  typedRoutes: true
}

export default nextConfig
