const path = require('path')

module.exports = {
  plugins: [
    {
      options: {
        feeds: [
          {
            output: '/index.xml',
            query: `
              {
                allMarkdownRemark(
                  limit: 5
                  sort: { fields: [frontmatter___date] order: DESC }
                ) {
                  edges {
                    node {
                      excerpt
                      fields {
                        slug
                      }
                      frontmatter {
                        date
                        title
                      }
                      html
                    }
                  }
                }
              }
            `
          }
        ]
      },
      resolve: 'gatsby-plugin-feed'
    },
    {
      options: {
        trackingId: 'UA-97395750-2'
      },
      resolve: 'gatsby-plugin-google-analytics'
    },
    {
      options: {
        background_color: '#fff',
        cache_busting_mode: 'none',
        display: 'standalone',
        icon: 'content/assets/ykzts-icon.png',
        name: 'ykzts.blog',
        short_name: 'ykzts.blog',
        start_url: '/',
        theme_color: '#212121'
      },
      resolve: 'gatsby-plugin-manifest'
    },
    'gatsby-plugin-netlify',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sharp',
    'gatsby-plugin-typescript',
    {
      options: {
        name: 'assets',
        path: path.resolve(__dirname, 'content', 'assets')
      },
      resolve: 'gatsby-source-filesystem'
    },
    {
      options: {
        name: 'blog',
        path: path.resolve(__dirname, 'content', 'blog')
      },
      resolve: 'gatsby-source-filesystem'
    },
    {
      options: {
        plugins: [
          {
            options: {
              rel: 'noopener noreferrer'
            },
            resolve: 'gatsby-remark-external-links'
          },
          'gatsby-remark-images',
          'gatsby-remark-prismjs'
        ]
      },
      resolve: 'gatsby-transformer-remark'
    },
    'gatsby-transformer-sharp'
  ],
  siteMetadata: {
    description: 'ソフトウェア開発者 山岸和利のブログ',
    image: '/images/main-visual.png',
    siteUrl: 'https://ykzts.blog/',
    title: 'ykzts.blog'
  }
}
