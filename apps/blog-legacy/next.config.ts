import { getSiteOrigin } from '@ykzts/site-config'
import type { NextConfig } from 'next'
import { createLegacyRedirects } from './redirects'

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    turbopackUseSystemTlsCerts: true
  },
  reactCompiler: true,
  reactStrictMode: true,
  redirects() {
    return createLegacyRedirects(getSiteOrigin().origin)
  },
  typedRoutes: true
}

export default nextConfig
