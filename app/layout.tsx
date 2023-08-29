import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import clsx from 'clsx'
import { type Metadata } from 'next'
import { Noto_Sans_JP, Raleway, Source_Sans_3 } from 'next/font/google'
import Image from 'next/image'
import { type ReactNode } from 'react'
import { FaArrowDown } from 'react-icons/fa'
import keyVisual from './_assets/key-visual.jpg'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTagline,
  SectionTitle
} from './_components/section'
import LayoutWrapper from './_components/wrapper'
import styles from './layout.module.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://ykzts.com/'),
  title: {
    default: 'ykzts.com - ソフトウェア開発者 山岸和利のポートフォリオ',
    template: '%s | ykzts.com'
  }
}

const notoSansJp = Noto_Sans_JP({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  weight: ['300', '600', '700', '800']
})
const raleway = Raleway({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-raleway',
  weight: ['600', '800']
})
const sourceSans3 = Source_Sans_3({
  display: 'swap',
  style: ['italic', 'normal'],
  subsets: ['latin'],
  variable: '--font-source-sans-3',
  weight: ['300', '600', '700']
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={clsx(
        notoSansJp.variable,
        raleway.variable,
        sourceSans3.variable
      )}
      lang="ja"
    >
      <head />
      <body>
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

          <main id="content">{children}</main>

          <footer className={styles.footer}>
            <div className={styles.copyright}>
              © Yamagishi Kazutosh. Design{' '}
              <a
                className={styles.footer__link}
                href="https://html5up.net/"
                rel="noopener noreferrer"
                target="_blank"
              >
                HTML5 UP
              </a>
              . Artwork by{' '}
              <a
                className={styles.footer__link}
                href="https://twitter.com/diru_k1005"
                rel="noopener noreferrer"
                target="_blank"
              >
                Kannazuki Diru
              </a>
              .
            </div>
          </footer>
        </LayoutWrapper>

        <Analytics />
      </body>
    </html>
  )
}
