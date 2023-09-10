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
    mdxRs: true
  }
}

export default withMDX(nextConfig)
