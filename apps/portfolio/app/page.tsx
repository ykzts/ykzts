import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ExternalLink from '@/components/link'
import AboutDoc from '@/docs/about.mdx'
import keyVisual from './_assets/key-visual.jpg'
import Contact from './_components/contact'
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
    title: 'ykzts.com',
    type: 'website',
    url: '/'
  },
  title: {
    absolute: 'ykzts.com - ソフトウェア開発者 山岸和利のポートフォリオ'
  },
  twitter: {
    card: 'summary_large_image'
  }
}

const technologies = [
  'TypeScript',
  'JavaScript',
  'React',
  'Next.js',
  'Ruby',
  'Ruby on Rails',
  'Go',
  'Python',
  'AWS',
  'Google Cloud'
]

export default function HomePage(_props: PageProps<'/'>) {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-border border-b bg-background/90 px-6 backdrop-blur-sm md:px-12 lg:px-24">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between">
          <Link className="font-semibold text-foreground text-lg" href="/">
            ykzts.com
          </Link>
          <div className="flex gap-8 text-base text-muted">
            <a
              className="rounded transition-colors duration-200 hover:text-accent focus:outline-2 focus:outline-accent focus:outline-offset-2"
              href="#about"
            >
              About
            </a>
            <a
              className="rounded transition-colors duration-200 hover:text-accent focus:outline-2 focus:outline-accent focus:outline-offset-2"
              href="#works"
            >
              Works
            </a>
            <a
              className="rounded transition-colors duration-200 hover:text-accent focus:outline-2 focus:outline-accent focus:outline-offset-2"
              href="#contact"
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 py-20 md:px-12 lg:px-24 lg:py-28">
        <div className="mx-auto flex max-w-4xl flex-col-reverse items-start gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex-1">
            <h1 className="mb-4 font-bold text-5xl text-foreground tracking-tight md:text-6xl lg:text-7xl">
              山岸和利
            </h1>
            <p className="mb-6 font-medium text-2xl text-accent md:text-3xl">
              Software Developer
            </p>
            <p className="mb-8 max-w-2xl text-muted text-xl leading-relaxed">
              JavaScriptやRubyを用いたウェブアプリケーション開発を得意とするソフトウェア開発者です。ReactやRuby
              on
              Railsに造詣が深く、バックエンドからフロントエンドまで幅広く担当しています。
            </p>

            {/* Tech Stack Tags */}
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <span className="tech-tag" key={tech}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0">
            <Image
              alt="山岸和利"
              className="rounded-2xl shadow-lg"
              height={320}
              placeholder="blur"
              priority
              src={keyVisual}
              width={320}
            />
          </div>
        </div>
      </header>

      <main className="px-6 md:px-12 lg:px-24" id="content">
        {/* About Section */}
        <section className="mx-auto max-w-4xl py-20" id="about">
          <h2 className="mb-10 font-semibold text-base text-muted uppercase tracking-widest">
            About
          </h2>
          <div className="prose prose-lg max-w-none prose-a:text-accent prose-headings:text-foreground prose-p:text-base prose-p:text-muted prose-strong:text-foreground prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
            <AboutDoc />
          </div>
        </section>

        {/* Works Section */}
        <Works />

        {/* Contact Section */}
        <Contact />
      </main>

      <footer className="border-border border-t px-6 py-12 md:px-12 lg:px-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-base text-muted md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <span>© Yamagishi Kazutoshi</span>
            <span className="text-sm">
              Artwork by{' '}
              <ExternalLink
                className="text-accent transition-colors duration-200 hover:text-accent/80"
                href="https://x.com/diru_k1005"
              >
                Kannazuki Diru
              </ExternalLink>
            </span>
          </div>
          <Link
            className="transition-colors duration-200 hover:text-accent"
            href="/privacy"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  )
}
