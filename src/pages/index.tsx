import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import React from 'react'
import mainVisual from '../../public/static/images/main-visual.png'
import About from '../components/About'
import Contact from '../components/Contact'
import Donation from '../components/Donation'
import Manael from '../components/Manael'
import Mastodon from '../components/Mastodon'

const canonical = 'https://ykzts.com/'

const description =
  'JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のポートフォリオです。山岸和利による過去の実績や作品の掲載、各種ソーシャルネットワーキングサービスのアカウントへのリンクなどの連絡先への参照があります。'

const Home: NextPage = () => (
  <>
    <NextSeo
      canonical={canonical}
      description={description}
      openGraph={{
        images: [
          {
            height: mainVisual.height,
            url: new URL(mainVisual.src, canonical).toString(),
            width: mainVisual.width
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
