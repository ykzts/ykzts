import styled from '@emotion/styled'
import { parseISO } from 'date-fns'
import { format } from 'date-fns-tz'
import { Link, graphql } from 'gatsby'
import React, { FC, ReactElement } from 'react'
import Icon from '../components/icon'
import Layout from '../components/layout'
import SEO from '../components/seo'
import { BlogContent } from '../types/blog'

const Article = styled.article`
  margin-bottom: 3rem;
`

const ArticleHeader = styled.header`
  align-items: center;
  margin-bottom: 1rem;

  @media (min-width: 500px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`

const Headline = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
`

const HeadlineLink = styled(Link)`
  color: inherit;

  :hover {
    color: inherit;
  }
`

const PublishedTime = styled.time`
  color: var(--secondary-text-color);
  display: block;
  font-size: 0.8rem;
  margin-top: 0.5em;
  text-align: right;

  @media (min-width: 500px) {
    margin-top: 0;
  }
`

const Excerpt = styled.p`
  color: var(--secondary-text-color);
  line-height: 2;
`

const ReadMore = styled.div`
  text-align: right;
`

const Pagination = styled.div`
  margin-bottom: 1rem;
`

const PaginationLink = styled(Link)`
  align-items: center;
  display: inline-flex;
`

interface Props {
  data: {
    allMarkdownRemark: {
      edges: {
        node: BlogContent
      }[]
    }
  }
  pageContext: {
    currentPage: number
    numPages: number
  }
}

const BlogList: FC<Props> = ({ data, pageContext }): ReactElement => {
  const { edges: posts } = data.allMarkdownRemark
  const isFirst = pageContext.currentPage < 2

  return (
    <Layout>
      <SEO
        path={isFirst ? '/' : `/page/${pageContext.currentPage}/`}
        title={
          isFirst
            ? undefined
            : `Page: ${pageContext.currentPage}`
        }
      />

      {posts.map(
        ({ node }): ReactElement => {
          const publishedTime = parseISO(node.frontmatter.date)

          return (
            <Article key={node.fields.slug}>
              <ArticleHeader>
                <Headline>
                  <HeadlineLink to={node.fields.slug}>
                    {node.frontmatter.title}
                  </HeadlineLink>
                </Headline>

                <PublishedTime>
                  {format(publishedTime, 'yyyy/MM/dd', {
                    timeZone: 'Asia/Tokyo'
                  })}
                </PublishedTime>
              </ArticleHeader>

              <Excerpt>{node.excerpt}</Excerpt>

              <ReadMore>
                <Link role="button" to={node.fields.slug}>
                  もっと読む...
                </Link>
              </ReadMore>
            </Article>
          )
        }
      )}

      {pageContext.currentPage < pageContext.numPages && (
        <Pagination>
          <PaginationLink
            rel="prev"
            to={`/page/${pageContext.currentPage + 1}/`}
          >
            過去の記事
            <Icon name="keyboard_arrow_right" />
          </PaginationLink>
        </Pagination>
      )}
    </Layout>
  )
}

export default BlogList

export const blogListQuery = graphql`
  query blogListQuery($limit: Int!, $skip: Int!) {
    allMarkdownRemark(
      limit: $limit
      skip: $skip
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          excerpt(truncate: true)
          fields {
            slug
          }
          frontmatter {
            date
            title
          }
        }
      }
    }
  }
`
