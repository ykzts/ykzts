import createMDX from '@next/mdx'
import rehypeExternalLinks from 'rehype-external-links'
import remarkGfm from 'remark-gfm'

const withMDX = createMDX({
  options: {
    rehypePlugins: [rehypeExternalLinks],
    remarkPlugins: [remarkGfm]
  }
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
    ppr: true
  },
  async headers() {
    return [
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
    ]
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  pageExtensions: ['tsx', 'ts', 'mdx']
}

export default withMDX(nextConfig)
