/* eslint-disable @typescript-eslint/explicit-function-return-type */

const withMDX = require('@next/mdx')()

const nextConfig = {
  experimental: {
    optimizeFonts: true,
    optimizeImages: true
  },
  headers: () => [
    {
      headers: [
        {
          key: 'cache-control',
          value: 'max-age=600, s-maxage=60'
        }
      ],
      source: '/((?!_next).*)'
    }
  ],
  pageExtensions: ['mdx', 'tsx'],
  webpack(config, { defaultLoaders, dev }) {
    const urlLoader = {
      loader: 'url-loader',
      options: {
        esModule: false,
        limit: 8192,
        name: dev
          ? '[name].[ext]?[contenthash:8]'
          : '[name].[contenthash:8].[ext]',
        outputPath: 'static/media',
        publicPath: '/_next/static/media'
      }
    }

    config.module.rules.push({
      test: /\.jpe?g$/,
      use: [
        defaultLoaders.babel,
        {
          loader: '@docusaurus/lqip-loader',
          options: {
            base64: true,
            pallete: false
          }
        },
        urlLoader
      ]
    })

    config.module.rules.push({
      test: /\.svg$/,
      use: [defaultLoaders.babel, urlLoader]
    })

    return config
  }
}

module.exports = withMDX(nextConfig)
