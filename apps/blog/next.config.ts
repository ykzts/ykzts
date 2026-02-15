import { withMicrofrontends } from '@vercel/microfrontends/next/config'
import { getSupabaseImageConfig } from '@ykzts/supabase/next-image-config'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    turbopackUseSystemTlsCerts: true
  },
  images: getSupabaseImageConfig(),
  reactCompiler: true,
  reactStrictMode: true,
  typedRoutes: true
}

export default withMicrofrontends(nextConfig)
