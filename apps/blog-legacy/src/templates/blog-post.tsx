import styled from '@emotion/styled'
import { parseISO } from 'date-fns'
import { format } from 'date-fns-tz'
import { Link, graphql } from 'gatsby'
import React, { FC, ReactElement } from 'react'
import Icon from '../components/icon'
import Layout from '../components/layout'
import SEO from '../components/seo'
import { BlogContent } from '../types/blog'
import GoogleAdSense from '../components/google-adsense'

const Header = styled.header`
  display: flex;
  flex-direction: column-reverse;
  margin: 1rem 0 4rem;
`

const Title = styled.h1`
  font-size: 2rem;
  margin: 0.5rem 0 0;
  text-align: center;
`

const PublishedTime = styled.time`
  color: var(--secondary-text-color);
  display: block;
  font-size: 1rem;
  text-align: center;
`

const Content = styled.div`
  p {
    line-height: 2;
    margin: 1rem 0;
  }

  ol,
  ul {
    margin: 1rem 0;
    padding: 0;
  }

  li {
    line-height: 1.5;
    margin: 0 0 0 2rem;
    padding: 0;
  }
`

const Pagination = styled.nav`
  margin: 4rem 0 2rem;
`

const PaginationList = styled.ol`
  align-items: stretch;
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 0;
`

const PaginationItem = styled.li`
  display: block;
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 1;
  margin: 0;
  padding: 0;
`

const PaginationLink = styled(Link)`
  align-items: center;
  display: flex;
  height: 100%;

  &[rel='next'] {
    justify-content: flex-start;
    padding-right: 0.5rem;
  }

  &[rel='prev'] {
    justify-content: flex-end;
    padding-left: 0.5rem;
  }
`

interface Props {
  data: {
    markdownRemark: BlogContent
  }
  pageContext: {
    next: BlogContent
    previous: BlogContent
  }
}

const BlogPostTemplate: FC<Props> = ({ data, pageContext }): ReactElement => {
  const { markdownRemark: post } = data
  const { next, previous } = pageContext
  const publishedTime = parseISO(post.frontmatter.date)

  return (
    <Layout>
      <SEO
        description={post.excerpt}
        path={post.fields.slug}
        title={post.frontmatter.title}
        type="article"
      />

      <main>
        <Header>
          <Title>{post.frontmatter.title}</Title>

          <PublishedTime dateTime={publishedTime.toISOString()}>
            {format(publishedTime, 'yyyy/MM/dd hh:mm', {
              timeZone: 'Asia/Tokyo'
            })}
          </PublishedTime>
        </Header>

        <Content dangerouslySetInnerHTML={{ __html: post.html }} />
      </main>

      {(next || previous) && (
        <Pagination>
          <PaginationList>
            <PaginationItem>
              {next && (
                <PaginationLink rel="next" to={next.fields.slug}>
                  <Icon name="keyboard_arrow_left" />
                  {next.frontmatter.title}
                </PaginationLink>
              )}
            </PaginationItem>
            <PaginationItem>
              {previous && (
                <PaginationLink rel="prev" to={previous.fields.slug}>
                  {previous.frontmatter.title}
                  <Icon name="keyboard_arrow_right" />
                </PaginationLink>
              )}
            </PaginationItem>
          </PaginationList>
        </Pagination>
      )}

      <GoogleAdSense client="ca-pub-4541453500124137" slot="7687621473" />
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
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
`
