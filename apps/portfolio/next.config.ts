import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const withMDX = createMDX()

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
    mdxRs: {
      mdxType: 'gfm'
    },
    ppr: true
  },
  reactStrictMode: true,
  headers() {
    return Promise.resolve([
      {
        headers: [
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
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  pageExtensions: ['tsx', 'ts', 'mdx']
}

export default withMDX(nextConfig)
