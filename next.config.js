const withMDX = require('@next/mdx')()

const nextConfig = {
  experimental: {
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
    ]
  },
  pageExtensions: ['mdx', 'tsx'],
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  webpack(config, { defaultLoaders, dev }) {
    config.module.rules.push({
      test: /\.(?:jpg|svg)$/,
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
