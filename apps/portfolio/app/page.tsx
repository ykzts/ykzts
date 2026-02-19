import type { Metadata } from 'next'
import Link from 'next/link'
import About from './_components/about'
import Contact from './_components/contact'
import Footer from './_components/footer'
import Hero from './_components/hero'
import Navigation from './_components/navigation'
import Works from './_components/works'

const description = [
  'JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のポートフォリオです。',
  '山岸和利による過去の実績や作品の掲載、各種ソーシャルネットワーキングサービスのアカウントへのリンクなどの連絡先への参照があります。'
].join('')

export const metadata: Metadata = {
  alternates: {
    canonical: '/'
  },
  description,
  openGraph: {
    description,
    title: process.env.NEXT_PUBLIC_SITE_NAME ?? 'ykzts.com',
    type: 'website',
    url: '/'
  },
  title: {
    absolute: `${process.env.NEXT_PUBLIC_SITE_NAME ?? 'ykzts.com'} - ソフトウェア開発者 山岸和利のポートフォリオ`
  },
  twitter: {
    card: 'summary_large_image'
  }
}

export default function HomePage(_props: PageProps<'/'>) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-border border-b bg-background/90 px-6 backdrop-blur-sm md:px-12 lg:px-24">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between">
          <Link className="font-semibold text-foreground text-lg" href="/">
            {process.env.NEXT_PUBLIC_SITE_NAME ?? 'ykzts.com'}
          </Link>
          <Navigation />
        </div>
      </header>

      <Hero />

      <main className="px-6 md:px-12 lg:px-24" id="content">
        <About />
        <Works />
        <Contact />
      </main>

      <Footer />
    </div>
  )
}
