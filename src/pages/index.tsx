import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import React from 'react'
import AboutPart from '../parts/about.mdx'
import ManaelPart from '../parts/manael.mdx'
import MastodonPart from '../parts/mastodon.mdx'

const description =
  'JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のポートフォリオです。山岸和利による過去の実績や作品の掲載、各種ソーシャルネットワーキングサービスのアカウントへのリンクなどの連絡先への参照があります。'

const Home: NextPage = () => (
  <>
    <NextSeo
      canonical="https://ykzts.com/"
      description={description}
      openGraph={{
        images: [{ url: 'https://ykzts.com/static/images/main-visual.png' }],
        type: 'website'
      }}
      title="ykzts.com"
      titleTemplate="%s - ソフトウェア開発者 山岸和利のポートフォリオ"
    />

    <AboutPart />
    <MastodonPart />
    <ManaelPart />
  </>
)

export default Home
