import type { NextConfig } from 'next'
import { legacyRedirects } from './redirects'

const baseUrl = 'https://ykzts.com'

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    turbopackUseSystemTlsCerts: true
  },
  reactCompiler: true,
  reactStrictMode: true,
  redirects() {
    return legacyRedirects.map(([source, destination]) => ({
      destination: `${baseUrl}${destination}`,
      source,
      statusCode: 301
    }))
  },
  typedRoutes: true
}

export default nextConfig
