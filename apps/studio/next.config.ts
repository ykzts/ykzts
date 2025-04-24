import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true
  },
  experimental: {
    reactCompiler: true
  },
  reactStrictMode: true
}

export default nextConfig
