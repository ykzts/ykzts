import React, { FC, ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import Layout from '../components/layout'

const NotFoundPage: FC = (): ReactElement => {
  return (
    <Layout>
      <Helmet defer={false}>
        <title>404 Not Found</title>
      </Helmet>

      <p>404</p>
    </Layout>
  )
}

export default NotFoundPage
