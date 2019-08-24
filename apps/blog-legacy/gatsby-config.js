const path = require('path')

const title = 'ykzts.blog'

module.exports = {
  plugins: [
    'gatsby-plugin-catch-links',
    {
      options: {
        feeds: [
          {
            output: '/index.xml',
            query: `
              {
                allMdx(
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
            `,
            serialize: ({ query: { allMdx, site } }) =>
              allMdx.edges.map(({ node }) => ({
                title: node.frontmatter.title,
                description: node.excerpt,
                url: site.siteMetadata.siteUrl + node.fields.slug,
                guid: site.siteMetadata.siteUrl + node.fields.slug,
                custom_elements: [{ 'content:encoded': node.html }]
              })),
            title
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
        extensions: ['.md', '.mdx'],
        gatsbyRemarkPlugins: [
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
      resolve: 'gatsby-plugin-mdx'
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
    'gatsby-plugin-sitemap',
    'gatsby-plugin-typescript',
    'gatsby-remark-images',
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
    'gatsby-transformer-sharp'
  ],
  siteMetadata: {
    description: 'ソフトウェア開発者 山岸和利のブログ',
    image: '/images/main-visual.png',
    siteUrl: 'https://ykzts.blog/',
    title
  }
}
