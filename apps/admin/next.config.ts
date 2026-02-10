import type { NextConfig } from 'next'

// Note: cacheComponents cannot be enabled for this app because it requires
// authentication checks that must run dynamically at request time.
// cacheComponents is incompatible with 'dynamic = force-dynamic' route segment config.
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
