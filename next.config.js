/* eslint-disable @typescript-eslint/explicit-function-return-type */

const withMDX = require('@next/mdx')()

const nextConfig = {
  experimental: {
    optimizeFonts: true,
    optimizeImages: true
  },
  pageExtensions: ['mdx', 'tsx'],
  webpack(config, { defaultLoaders, dev }) {
    config.module.rules.push({
      test: /\.jpe?g$/,
      use: [
        defaultLoaders.babel,
        {
          loader: 'responsive-loader',
          options: {
            adapter: require('responsive-loader/sharp'),
            esModule: true,
            name: dev
              ? '[name].[ext]?[contenthash:8]'
              : '[name].[contenthash:8].[ext]',
            outputPath: 'static/media',
            placeholder: true,
            publicPath: '/_next/static/media'
          }
        }
      ]
    })

    config.module.rules.push({
      test: /\.svg$/,
      use: [
        defaultLoaders.babel,
        {
          loader: 'url-loader',
          options: {
            esModule: true,
            limit: 8192,
            name: dev
              ? '[name].[ext]?[contenthash:8]'
              : '[name].[contenthash:8].[ext]',
            outputPath: 'static/media',
            publicPath: '/_next/static/media'
          }
        }
      ]
    })

    return config
  }
}

module.exports = withMDX(nextConfig)
