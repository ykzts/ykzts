import rehypeExternalLinks from 'rehype-external-links'
import remarkGfm from 'remark-gfm'

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja']
  },
  webpack(config, { defaultLoaders }) {
    config.module.rules.push({
      test: /\.mdx?/,
      use: [
        defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          /** @type {import('@mdx-js/loader').Options} */
          options: {
            jsx: true,
            providerImportSource: '@mdx-js/react',
            rehypePlugins: [
              [
                rehypeExternalLinks,
                {
                  rel: ['noopener', 'noreferrer'],
                  target: '_blank'
                }
              ]
            ],
            remarkPlugins: [remarkGfm]
          }
        }
      ]
    })

    return config
  }
}

export default nextConfig
