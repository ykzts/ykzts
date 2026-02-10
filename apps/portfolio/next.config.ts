import createMDX from '@next/mdx'
import { withMicrofrontends } from '@vercel/microfrontends/next'
import type { NextConfig } from 'next'

const withMDX = createMDX()

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true,
    mdxRs: {
      mdxType: 'gfm'
    },
    turbopackFileSystemCacheForDev: true
  },
  headers() {
    return Promise.resolve([
      {
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "base-uri 'none'",
              "connect-src 'self' https://vitals.vercel-insights.com https://challenges.cloudflare.com",
              "default-src 'none'",
              "font-src 'self'",
              "form-action 'none'",
              "frame-ancestors 'none'",
              'frame-src https://challenges.cloudflare.com',
              "img-src 'self' data:",
              "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'"
            ].join('; ')
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), geolocation=(), microphone=()'
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ],
        source: '/:path*'
      }
    ])
  },
  images: {
    formats: ['image/avif', 'image/webp']
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  pageExtensions: ['tsx', 'ts', 'mdx'],
  reactCompiler: true,
  reactStrictMode: true,
  typedRoutes: true
}

export default withMicrofrontends(withMDX(nextConfig))
