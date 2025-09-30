import type { Metadata } from 'next'
import Image from 'next/image'
import { Suspense } from 'react'
import { FaArrowDown } from 'react-icons/fa'
import Link from '@/components/link'
import keyVisual from './_assets/key-visual.jpg'
import Contact from './_components/contact'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTagline,
  SectionTitle
} from './_components/section'
import Works, { WorksSkeleton } from './_components/works'
import LayoutWrapper from './_components/wrapper'
import AboutDoc from './_docs/about.mdx'

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

      <SectionContent>
        <AboutDoc />
      </SectionContent>
    </Section>
  )
}

export default function HomePage(_props: PageProps<'/'>) {
  return (
    <LayoutWrapper>
      <Section intro>
        <SectionHeader>
          <SectionTitle>{'ykzts\u200b.com'}</SectionTitle>

          <SectionTagline>
            ソフトウェア開発者 山岸和利の
            <br />
            ポートフォリオ
          </SectionTagline>

          <ul className="ml-auto -mt-4 flex w-80 cursor-default list-none justify-end pl-0 max-[1152px]:hidden">
            <li className="pl-4 align-middle first:pl-0 max-sm:w-full max-sm:grow max-sm:shrink max-sm:pt-4 max-sm:text-center">
              <a
                aria-label="コンテンツまでスクロール"
                className="relative inline-block h-16 w-24 rounded border-b-0 text-[4rem] transition-transform duration-[0.25s] ease-in-out hover:translate-y-1 focus:translate-y-1 focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-[--color-brand]"
                href="#content"
              >
                <FaArrowDown />
              </a>
            </li>
          </ul>
        </SectionHeader>

        <SectionContent>
          <Image
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            placeholder="blur"
            priority
            sizes="(max-width: 1280px) 50vw,100vw"
            src={keyVisual}
          />
        </SectionContent>
      </Section>

      <main id="content">
        <About />
        <Suspense fallback={<WorksSkeleton />}>
          <Works />
        </Suspense>
        <Contact />
      </main>

      <footer
        className="relative left-[50vw] w-[50vw] px-20 text-base text-black/60 max-xl:px-16 max-[1152px]:left-0 max-[1152px]:w-full max-[1152px]:px-16 max-[1152px]:pb-16 max-md:px-8 max-md:pb-8 max-[360px]:px-6 max-[360px]:pb-6"
        lang="en"
      >
        <div>
          <span>© Yamagishi Kazutoshi.</span>{' '}
          <span>
            <Link className="text-inherit" href="/privacy">
              Privacy Policy
            </Link>
            .
          </span>{' '}
          <span>
            Design:{' '}
            <Link
              className="text-inherit"
              href="https://html5up.net/"
              target="_blank"
            >
              HTML5 UP
            </Link>
            .
          </span>{' '}
          <span>
            Artwork:{' '}
            <Link
              className="text-inherit"
              href="https://x.com/diru_k1005"
              target="_blank"
            >
              Kannazuki Diru
            </Link>
            .
          </span>
        </div>
      </footer>
    </LayoutWrapper>
  )
}
