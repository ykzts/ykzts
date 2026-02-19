import type { NextConfig } from 'next'
import { createLegacyRedirects } from './redirects'

const baseUrl = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://ykzts.com'

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
