import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import React from 'react'
import About from '../components/About'
import Contact from '../components/Contact'
import Donation from '../components/Donation'
import Manael from '../components/Manael'
import Mastodon from '../components/Mastodon'

const description =
  'JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のポートフォリオです。山岸和利による過去の実績や作品の掲載、各種ソーシャルネットワーキングサービスのアカウントへのリンクなどの連絡先への参照があります。'

const Home: NextPage = () => (
  <>
    <NextSeo
      canonical="https://ykzts.com/"
      description={description}
      openGraph={{
        images: [
          {
            height: 630,
            url: 'https://ykzts.com/static/images/main-visual.png',
            width: 1200
          }
        ],
        type: 'website'
      }}
      title="ykzts.com"
      titleTemplate="%s - ソフトウェア開発者 山岸和利のポートフォリオ"
    />

    <About />
    <Mastodon />
    <Manael />
    <Donation />
    <Contact />
  </>
)

export default Home
