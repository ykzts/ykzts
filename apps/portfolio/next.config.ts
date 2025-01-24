import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const withMDX = createMDX()

const nextConfig: NextConfig = {
  experimental: {
    mdxRs: {
      mdxType: 'gfm'
    },
    ppr: true,
    useCache: true
  },
  headers() {
    return Promise.resolve([
      {
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "base-uri 'none'",
              "connect-src 'self'",
              "default-src 'none'",
              "font-src 'self'",
              "form-action 'none'",
              "frame-ancestors 'none'",
              "img-src 'self' data:",
              "script-src 'self' 'unsafe-inline'",
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
  reactStrictMode: true
}

export default withMDX(nextConfig)
