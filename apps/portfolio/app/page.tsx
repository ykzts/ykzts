import type { Metadata } from 'next'
import Image from 'next/image'
import { FaArrowDown } from 'react-icons/fa'
import Link from '@/components/link'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTagline,
  SectionTitle
} from '@/components/section'
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

function About() {
  return (
    <Section id="about">
      <SectionHeader>
        <SectionTitle>About</SectionTitle>
      </SectionHeader>

      <SectionContent className="prose prose-slate max-w-none">
        <AboutDoc />
      </SectionContent>
    </Section>
  )
}

export default function HomePage(_props: PageProps<'/'>) {
  return (
    <div className="overflow-y-hidden">
      <Section intro>
        <SectionHeader>
          <SectionTitle>{'ykzts\u200b.com'}</SectionTitle>

          <SectionTagline>
            ソフトウェア開発者 山岸和利の
            <br />
            ポートフォリオ
          </SectionTagline>

          <ul className="w-80 hidden ml-auto items-center justify-end gap-4 lg:flex">
            <li className="align-bottom">
              <a
                aria-label="コンテンツまでスクロール"
                className="flex justify-end h-16 w-24 rounded text-6xl transition-transform duration-250 ease-in-out hover:translate-y-1 focus:translate-y-1 focus:outline-3 focus:outline-offset-2 focus:outline-brand"
                href="#content"
              >
                <FaArrowDown />
              </a>
            </li>
          </ul>
        </SectionHeader>

        <SectionContent className="relative h-dvh">
          <Image
            alt=""
            className="absolute inset-0 size-full object-cover"
            placeholder="blur"
            priority
            sizes="(max-width: 1280px) 50vw,100vw"
            src={keyVisual}
          />
        </SectionContent>
      </Section>

      <main id="content">
        <About />
        <Works />
        <Contact />
      </main>

      <footer
        className="text-base text-black/60 lg:grid lg:grid-cols-2"
        lang="en"
      >
        <div className="bg-white p-6 lg:col-start-2 md:p-8 lg:p-16">
          <span>© Yamagishi Kazutoshi.</span>{' '}
          <span>
            <Link href="/privacy">Privacy Policy</Link>.
          </span>{' '}
          <span>
            Design:{' '}
            <Link href="https://html5up.net/" target="_blank">
              HTML5 UP
            </Link>
            .
          </span>{' '}
          <span>
            Artwork:{' '}
            <Link href="https://x.com/diru_k1005" target="_blank">
              Kannazuki Diru
            </Link>
            .
          </span>
        </div>
      </footer>
    </div>
  )
}
