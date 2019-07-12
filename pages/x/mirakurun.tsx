import { NextPage } from 'next'
import Head from 'next/head'
import React from 'react'

const Mirakurun: NextPage = () => (
  <Head>
    <meta
      content="ykzts.com/x/mirakurun git https://github.com/ykzts/go-mirakurun.git"
      name="go-import"
    />
    <meta
      content="ykzts.com/x/mirakurun https://github.com/ykzts/go-mirakurun https://github.com/ykzts/go-mirakurun/tree/master{/dir} https://github.com/ykzts/go-mirakurun/blob/master{/dir}/{file}#L{line}"
      name="go-source"
    />
    <meta
      content="0; url=https://godoc.org/ykzts.com/x/mirakurun"
      httpEquiv="refresh"
    />
  </Head>
)

export default Mirakurun
