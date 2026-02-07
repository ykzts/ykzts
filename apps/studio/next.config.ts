import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true
  },
  reactCompiler: true,
  reactStrictMode: true
}

export default nextConfig
