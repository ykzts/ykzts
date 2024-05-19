import { type ReactNode } from 'react'
import Link from '@/components/link'
import styles from './contact.module.css'
import Section, {
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle
} from './section'

type SocialLink = {
  label: string
  logo: ReactNode
  url: `https://${string}`
}

const socialLinks: SocialLink[] = [
  {
    label: '山岸和利のFacebookアカウント',
    logo: (
      <svg className={styles['icon-logo']}>
        <use xlinkHref="#facebook-logo" />
      </svg>
    ),
    url: 'https://www.facebook.com/ykzts'
  },
  {
    label: '山岸和利のGitHubアカウント',
    logo: (
      <svg className={styles['icon-logo']}>
        <use xlinkHref="#github-logo" />
      </svg>
    ),
    url: 'https://github.com/ykzts'
  },
  {
    label: '山岸和利のMastodonアカウント',
    logo: (
      <svg className={styles['icon-logo']}>
        <use xlinkHref="#mastodon-logo" />
      </svg>
    ),
    url: 'https://ykzts.technology/@ykzts'
  },
  {
    label: '山岸和利のThreadsアカウント',
    logo: (
      <svg className={styles['icon-logo']}>
        <use xlinkHref="#threads-logo" />
      </svg>
    ),
    url: 'https://www.threads.net/@ykzts'
  },
  {
    label: '山岸和利のXアカウント',
    logo: (
      <svg className={styles['icon-logo']}>
        <use xlinkHref="#x-logo" />
      </svg>
    ),
    url: 'https://x.com/ykzts'
  }
]

export default function Contact() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Get in touch</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <p>
          山岸和利に対するお問い合わせやご依頼はメールからお願いします。スケジュール次第ではありますが有期もしくは案件単位での作業依頼や技術相談でしたら有償で承ります。
        </p>
        <p>
          ただし無償もしくは報酬が不明瞭な依頼に関してはお応えできかねます。また依頼主が不明であるスカウトメールやオファーメールにつきましてはご返答いたしかねますのであらかじめご容赦ください。
        </p>
      </SectionContent>

      <SectionFooter>
        <ul className={styles.list}>
          <li className={styles['list__item']}>
            <h3 className={styles['list__title']}>Email</h3>

            <a href="mailto:ykzts@desire.sh">ykzts@desire.sh</a>
          </li>
          <li className={styles.list__item}>
            <h3 className={styles['list__title']}>Blog</h3>

            <Link href="https://ykzts.blog/" rel="me" target="_blank">
              ykzts.blog
            </Link>
          </li>
          <li className={styles['list__item']}>
            <h3 className={styles['list__title']}>Elsewhere</h3>

            <ul className={styles.icons}>
              {socialLinks.map((socialLink) => (
                <li className={styles.icons__item} key={socialLink.url}>
                  <Link
                    aria-label={socialLink.label}
                    className={styles['icon-link']}
                    href={socialLink.url}
                    rel="me"
                    target="_blank"
                  >
                    {socialLink.logo}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </SectionFooter>
    </Section>
  )
}
