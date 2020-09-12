import React, { FC } from 'react'
import Head from '@docusaurus/Head'
import Layout from '@theme-original/Layout'

type Props = {
  description?: string
  image?: string
  keywords?: string[]
  noFooter?: boolean
  permalink?: string
  title?: string
  version?: string
}

const MyLayout: FC<Props> = ({ children, ...props }) => (
  <Layout {...props}>
    <Head>
      <html lang="ja" />
    </Head>

    {children}
  </Layout>
)

export default MyLayout
