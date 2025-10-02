import type { Metadata } from 'next'
import Image from 'next/image'
import { Suspense } from 'react'
import { FaArrowDown } from 'react-icons/fa'
import Link from '@/components/link'
import { getProfile } from '@/lib/sanity'
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

const fallbackDescription = [
  'JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のポートフォリオです。',
  '山岸和利による過去の実績や作品の掲載、各種ソーシャルネットワーキングサービスのアカウントへのリンクなどの連絡先への参照があります。'
].join('')

const fallbackName = '山岸和利'

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile()
  const description = profile?.bio?.ja ?? fallbackDescription
  const nameJa = profile?.name?.ja ?? fallbackName

  return {
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
      absolute: `ykzts.com - ソフトウェア開発者 ${nameJa}のポートフォリオ`
    },
    twitter: {
      card: 'summary_large_image'
    }
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

export default async function HomePage(_props: PageProps<'/'>) {
  const profile = await getProfile()
  const nameJa = profile?.name?.ja ?? fallbackName

  return (
    <LayoutWrapper>
      <Section intro>
        <SectionHeader>
          <SectionTitle>{'ykzts\u200b.com'}</SectionTitle>

          <SectionTagline>
            ソフトウェア開発者 {nameJa}の
            <br />
            ポートフォリオ
          </SectionTagline>

          <ul className={styles.actions}>
            <li className={styles.actions__item}>
              <a
                aria-label="コンテンツまでスクロール"
                className={styles['arrow-link']}
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
        <Suspense>
          <Contact />
        </Suspense>
      </main>

      <footer className={styles.footer} lang="en">
        <div className={styles.copyright}>
          <span>© {profile?.name?.en ?? 'Yamagishi Kazutoshi'}.</span>{' '}
          <span>
            <Link className={styles.footer__link} href="/privacy">
              Privacy Policy
            </Link>
            .
          </span>{' '}
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
