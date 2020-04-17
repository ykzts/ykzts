import React from 'react'
import Layout from '@theme/Layout'

const NotFound = () => (
  <Layout title="404 Not Found">
    <div className="container margin-vert--xl">
      <div className="row">
        <div className="col col--6 col--offset-3">
          <h1 className="hero__title">404 Not Found</h1>
          <p>お探しのページを見つけられませんでした。</p>
        </div>
      </div>
    </div>
  </Layout>
)

export default NotFound
