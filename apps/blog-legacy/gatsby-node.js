const { parseISO } = require('date-fns')
const { format } = require('date-fns-tz')
const { createFilePath } = require('gatsby-source-filesystem')
const path = require('path')

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions

  const blogList = path.resolve(__dirname, 'src', 'templates', 'blog-list.tsx')
  const blogPost = path.resolve(__dirname, 'src', 'templates', 'blog-post.tsx')
  const results = await graphql(
    `
      {
        allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  )

  if (results.errors) throw results.errors

  const { edges: posts } = results.data.allMarkdownRemark

  const postsPerPage = 5
  const numPages = Math.ceil(posts.length / postsPerPage)

  for (let i = 0; i < numPages; ++i) {
    const currentPage = i + 1

    createPage({
      component: blogList,
      context: {
        currentPage,
        limit: postsPerPage,
        numPages,
        skip: i * postsPerPage
      },
      path: i === 0 ? '/' : `/page/${currentPage}/`
    })
  }

  posts.forEach((post, index) => {
    const next = index === 0 ? null : posts[index - 1].node
    const previous = index === posts.length - 1 ? null : posts[index + 1].node

    createPage({
      component: blogPost,
      context: {
        next,
        previous,
        slug: post.node.fields.slug
      },
      path: post.node.fields.slug
    })
  })
}

exports.onCreateNode = ({ actions, getNode, node }) => {
  const { createNodeField } = actions

  if (node.internal.type === 'MarkdownRemark') {
    let path = node.frontmatter.permalink

    if (!path) {
      const date = parseISO(node.frontmatter.date)
      const prefix = format(date, '/yyyy/MM/dd', { timezone: 'Asia/Tokyo' })
      const filePath = createFilePath({ node, getNode })

      path = `${prefix}${filePath}`
    }

    createNodeField({
      name: 'slug',
      node,
      value: path
    })
  }
}
