import { Global, css } from '@emotion/core'
import styled from '@emotion/styled'
import { Link, graphql, useStaticQuery } from 'gatsby'
import React, { FC, ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import Site from '../types/site'

const globalStyles = css`
  :root {
    --invert-text-color: #fafafa;
    --link-text-color: #1976d2;
    --link-text-hover-color: #004ba0;
    --primary-text-color: #212121;
    --secondary-text-color: #757575;
  }

  * {
    box-sizing: border-box;
  }

  html {
    color: var(--primary-text-color);
    font-family: Roboto, Noto Sans JP, sans-serif;
    line-height: 1;
  }

  body {
    margin: 0;
    padding: 0;
  }

  a {
    color: var(--link-text-color);
    text-decoration: none;
    transition: color 0.2s ease-in;

    :hover {
      color: var(--link-text-hover-color);
    }
  }
`

const Header = styled.header`
  margin-bottom: 2rem;
`

const HeaderContainer = styled.div`
  margin: 0 auto;
  padding: 1rem 0.5rem;

  @media (min-width: 500px) {
    max-width: 1024px;
    padding: 1rem 0;
    width: 100%;
  }
`

const Brand = styled(Link)`
  color: var(--invert-text-color);
  background-color: var(--primary-text-color);
  border-radius: 0.1rem;
  display: inline-block;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  text-decoration: none;
  transition: none;

  :hover {
    color: var(--invert-text-color);
  }
`

const Container = styled.div`
  margin: 0 auto;
  padding: 0 0.5rem;

  @media (min-width: 500px) {
    max-width: 1024px;
    padding: 0;
    width: 100%;
  }
`

const Footer = styled.footer`
  margin-top: 2rem;
`

const FooterContainer = styled.div`
  font-size: 0.8rem;
  margin: 0 auto;
  padding: 1rem 0.5rem 2rem;
  text-align: right;

  @media (min-width: 500px) {
    max-width: 1024px;
    padding: 1rem 0 2rem;
    width: 100%;
  }

  a {
    margin-left: 1em;
  }
`

const Layout: FC = ({ children }): ReactElement => {
  const { site } = useStaticQuery<{ site: Site }>(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  )

  return (
    <>
      <Helmet
        defaultTitle={site.siteMetadata.title}
        defer={false}
        htmlAttributes={{
          lang: 'ja'
        }}
        titleTemplate={`%s | ${site.siteMetadata.title}`}
      >
        <meta content="nocomment" name="Hatena::Bookmark" />
      </Helmet>

      <Global styles={globalStyles} />

      <Header>
        <HeaderContainer>
          <Brand to="/">ykzts.blog</Brand>
        </HeaderContainer>
      </Header>

      <Container>{children}</Container>

      <Footer>
        <FooterContainer>
          <a
            href="https://ykzts.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            運営者情報
          </a>
          <Link to="/privacy/">プライバシーポリシー</Link>
        </FooterContainer>
      </Footer>
    </>
  )
}

export default Layout
