import { Global, css } from '@emotion/core'
import { NextFC } from 'next'
import Head from 'next/head'
import { WithRouterProps, withRouter } from 'next/router'
import React, { useEffect } from 'react'
import ReactGA from 'react-ga'

const globalStyles = css`
  html {
    font-family: Roboto, Noto Sans JP, sans-serif;
    line-height: 1;
  }

  body {
    margin: 0;
    padding: 0;
  }
`

const Page: NextFC<WithRouterProps> = ({ children, router }) => {
  useEffect(() => {
    ReactGA.initialize('UA-113539479-1')

    if (router && router.asPath) ReactGA.pageview(router.asPath)
  }, [router])

  return (
    <>
      <Head>
        <link
          href="https://www.gravatar.com/avatar/b9025074d487cd0328f1dc816e5ac50a?s=256"
          rel="icon"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto:400,700"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Noto+Sans+JP:400,700"
          rel="stylesheet"
        />
      </Head>

      <Global styles={globalStyles} />

      {children}
    </>
  )
}

export default withRouter(Page)
