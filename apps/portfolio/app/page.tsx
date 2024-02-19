import { type Metadata } from 'next'
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
import styles from './page.module.css'

const description = [
  'JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のポートフォリオです。',
  '山岸和利による過去の実績や作品の掲載、各種ソーシャルネットワーキングサービスのアカウントへのリンクなどの連絡先への参照があります。'
].join('')

export const revalidate = 600

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

export default function HomePage() {
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

          <ul className={styles.actions}>
            <li className={styles.actions__item}>
              <a
                aria-label="コンテンツまでスクロール"
                className={styles['arrow-link']}
                href="#content"
                role="button"
              >
                <FaArrowDown />
              </a>
            </li>
          </ul>
        </SectionHeader>

        <SectionContent>
          <Image
            alt=""
            className={styles['key-visual']}
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

      <footer className={styles.footer}>
        <div className={styles.copyright}>
          <span>© Yamagishi Kazutoshi.</span>{' '}
          <span>
            Design:{' '}
            <Link
              className={styles.footer__link}
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
              className={styles.footer__link}
              href="https://twitter.com/diru_k1005"
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
