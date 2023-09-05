import { type Metadata } from 'next'
import { FaFacebookF, FaGithub, FaMastodon, FaPatreon } from 'react-icons/fa'
import Section, {
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle
} from './_components/section'
import AboutDoc from './_docs/about.mdx'
import ContactDoc from './_docs/contact.mdx'
import DonationDoc from './_docs/donation.mdx'
import HaneruDoc from './_docs/haneru.mdx'
import ManaelDoc from './_docs/manael.mdx'
import MastodonDoc from './_docs/mastodon.mdx'
import styles from './page.module.css'

const description =
  'JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のポートフォリオです。山岸和利による過去の実績や作品の掲載、各種ソーシャルネットワーキングサービスのアカウントへのリンクなどの連絡先への参照があります。'

export const runtime = 'edge'

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
    <Section>
      <SectionHeader>
        <SectionTitle>About</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <AboutDoc />
      </SectionContent>
    </Section>
  )
}

function Contact() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Get in touch</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <ContactDoc />
      </SectionContent>

      <SectionFooter>
        <ul className={styles.list}>
          <li className={styles['list__item']}>
            <h3 className={styles['list__title']}>Email</h3>

            <a href="mailto:ykzts@desire.sh">ykzts@desire.sh</a>
          </li>
          <li className={styles.list__item}>
            <h3 className={styles['list__title']}>Blog</h3>

            <a
              href="https://ykzts.blog/"
              rel="noopener noreferrer"
              target="_blank"
            >
              ykzts.blog
            </a>
          </li>
          <li className={styles['list__item']}>
            <h3 className={styles['list__title']}>Elsewhere</h3>

            <ul className={styles.icons}>
              <li className={styles.icons__item}>
                <a
                  aria-label="山岸和利のMastodonアカウント"
                  className={styles['icon-link']}
                  href="https://ykzts.technology/@ykzts"
                  rel="noopener noreferrer me"
                  target="_blank"
                >
                  <FaMastodon />
                </a>
              </li>
              <li className={styles.icons__item}>
                <a
                  aria-label="山岸和利のXアカウント"
                  className={styles['icon-link']}
                  href="https://twitter.com/ykzts"
                  rel="noopener noreferrer me"
                  target="_blank"
                >
                  <svg height="1em" width="1em">
                    <use xlinkHref="#x-logo" />
                  </svg>
                </a>
              </li>
              <li className={styles.icons__item}>
                <a
                  aria-label="山岸和利のFacebookアカウント"
                  className={styles['icon-link']}
                  href="https://www.facebook.com/ykzts"
                  rel="noopener noreferrer me"
                  target="_blank"
                >
                  <FaFacebookF />
                </a>
              </li>
              <li className={styles.icons__item}>
                <a
                  aria-label="山岸和利のGitHubアカウント"
                  className={styles['icon-link']}
                  href="https://github.com/ykzts"
                  rel="noopener noreferrer me"
                  target="_blank"
                >
                  <FaGithub />
                </a>
              </li>
              <li className={styles.icons__item}>
                <a
                  aria-label="山岸和利のPatreonアカウント"
                  className={styles['icon-link']}
                  href="https://www.patreon.com/ykzts"
                  rel="noopener noreferrer me"
                  target="_blank"
                >
                  <FaPatreon />
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </SectionFooter>
    </Section>
  )
}

function Donation() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Donation</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <DonationDoc />
      </SectionContent>
    </Section>
  )
}

function Haneru() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Haneru Developers</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <HaneruDoc />
      </SectionContent>
    </Section>
  )
}

function Manael() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Manael</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <ManaelDoc />
      </SectionContent>
    </Section>
  )
}

function Mastodon() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Mastodon</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <MastodonDoc />
      </SectionContent>
    </Section>
  )
}

export default function HomePage() {
  return (
    <>
      <About />
      <Haneru />
      <Mastodon />
      <Manael />
      <Donation />
      <Contact />
    </>
  )
}
