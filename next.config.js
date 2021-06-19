const withMDX = require('@next/mdx')()

/**
 * @type {import('next/dist/next-server/server/config').NextConfig}
 **/
const nextConfig = {
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja']
  }
}

module.exports = withMDX(nextConfig)
