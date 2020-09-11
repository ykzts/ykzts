import React, { FC } from 'react'
import Head from '@docusaurus/Head'
import OriginalLayout from '@theme-original/Layout'

type Props = {
  description?: string
  image?: string
  keywords?: string[]
  noFooter?: boolean
  permalink?: string
  title?: string
  version?: string
}

const Layout: FC<Props> = ({ children, ...props }) => (
  <OriginalLayout {...props}>
    <Head>
      <html lang="ja" />
    </Head>

    {children}
  </OriginalLayout>
)

export default Layout
