import App, { Container } from 'next/app'
import Head from 'next/head'
import { ReactElement } from 'react'

export default class extends App {
  render(): ReactElement {
    console.log(this.props)
    const { Component, pageProps } = this.props

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
          <script
            async
            custom-element="amp-analytics"
            src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"
          />
        </Head>

        <Container>
          <Component {...pageProps} />

          <amp-analytics type="googleanalytics">
            <script
              type="application/json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  triggers: {
                    trackPageview: {
                      on: 'visible',
                      request: 'pageview'
                    }
                  },
                  vars: {
                    account: 'UA-113539479-1'
                  }
                })
              }}
            />
          </amp-analytics>
        </Container>

        <style global jsx>{`
          html {
            font-family: Roboto, Noto Sans JP, sans-serif;
            line-height: 1;
          }

          body {
            margin: 0;
            padding: 0;
          }
        `}</style>
      </>
    )
  }
}
