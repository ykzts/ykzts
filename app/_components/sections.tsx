import {
  FaFacebookF,
  FaGithub,
  FaMastodon,
  FaPatreon,
  FaTwitter
} from 'react-icons/fa'
import Section, {
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle
} from '@/components/section'
import AboutDoc from './docs/about.mdx'
import ContactDoc from './docs/contact.mdx'
import DonationDoc from './docs/donation.mdx'
import ManaelDoc from './docs/manael.mdx'
import MastodonDoc from './docs/mastodon.mdx'
import styles from './sections.module.css'

export function About() {
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

export function Contact() {
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
                  aria-label="Mastodon"
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
                  aria-label="Twitter"
                  className={styles['icon-link']}
                  href="https://twitter.com/ykzts"
                  rel="noopener noreferrer me"
                  target="_blank"
                >
                  <FaTwitter />
                </a>
              </li>
              <li className={styles.icons__item}>
                <a
                  aria-label="Facebook"
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
                  aria-label="GitHub"
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
                  aria-label="Patreon"
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

export function Donation() {
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

export function Manael() {
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

export function Mastodon() {
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

export default function Sections() {
  return (
    <>
      <About />
      <Mastodon />
      <Manael />
      <Donation />
      <Contact />
    </>
  )
}
