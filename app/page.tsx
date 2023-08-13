import { type Metadata } from 'next'
import Sections from './_components/sections'

const description =
  'JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のポートフォリオです。山岸和利による過去の実績や作品の掲載、各種ソーシャルネットワーキングサービスのアカウントへのリンクなどの連絡先への参照があります。'

export const metadata: Metadata = {
  description,
  openGraph: {
    description,
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image'
  }
}

export default function HomePage() {
  return <Sections />
}
