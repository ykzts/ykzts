import type { NextConfig } from 'next'
import { createLegacyRedirects } from './redirects'

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
    return createLegacyRedirects(baseUrl)
  },
  typedRoutes: true
}

export default nextConfig
