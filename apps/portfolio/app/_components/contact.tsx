import type { ReactNode } from 'react'
import Link from '@/components/link'
import { getProfile } from '@/lib/sanity'
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

const platformLogos: Record<string, ReactNode> = {
  Facebook: (
    <svg aria-label="Facebook" className={styles['icon-logo']} role="img">
      <use xlinkHref="#facebook-logo" />
    </svg>
  ),
  GitHub: (
    <svg aria-label="GitHub" className={styles['icon-logo']} role="img">
      <use xlinkHref="#github-logo" />
    </svg>
  ),
  Mastodon: (
    <svg aria-label="Mastodon" className={styles['icon-logo']} role="img">
      <use xlinkHref="#mastodon-logo" />
    </svg>
  ),
  Threads: (
    <svg aria-label="Threads" className={styles['icon-logo']} role="img">
      <use xlinkHref="#threads-logo" />
    </svg>
  ),
  X: (
    <svg aria-label="X" className={styles['icon-logo']} role="img">
      <use xlinkHref="#x-logo" />
    </svg>
  )
}

// Fallback data when profile is not available from Sanity
const fallbackBioJa = [
  '山岸和利に対するお問い合わせやご依頼はメールからお願いします。スケジュール次第ではありますが有期もしくは案件単位での作業依頼や技術相談でしたら有償で承ります。',
  'ただし無償もしくは報酬が不明瞭な依頼に関してはお応えできかねます。また依頼主が不明であるスカウトメールやオファーメールにつきましてはご返答いたしかねますのであらかじめご容赦ください。'
]
const fallbackEmail = 'ykzts@desire.sh'
const fallbackSocialLinks: SocialLink[] = [
  {
    label: '山岸和利のFacebookアカウント',
    logo: platformLogos.Facebook,
    url: 'https://www.facebook.com/ykzts'
  },
  {
    label: '山岸和利のGitHubアカウント',
    logo: platformLogos.GitHub,
    url: 'https://github.com/ykzts'
  },
  {
    label: '山岸和利のMastodonアカウント',
    logo: platformLogos.Mastodon,
    url: 'https://ykzts.technology/@ykzts'
  },
  {
    label: '山岸和利のThreadsアカウント',
    logo: platformLogos.Threads,
    url: 'https://www.threads.net/@ykzts'
  },
  {
    label: '山岸和利のXアカウント',
    logo: platformLogos.X,
    url: 'https://x.com/ykzts'
  }
]

export default async function Contact() {
  const profile = await getProfile()

  const bioJa = profile?.bioJa
    ? profile.bioJa.split('\n\n').filter((p) => p.trim())
    : fallbackBioJa
  const email = profile?.email ?? fallbackEmail

  const socialLinks: SocialLink[] =
    profile?.socialLinks?.map((link) => ({
      label: link.labelJa ?? link.label ?? link.platform,
      logo: platformLogos[link.platform] ?? platformLogos.X,
      url: link.url as `https://${string}`
    })) ?? fallbackSocialLinks

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Get in touch</SectionTitle>
      </SectionHeader>

      <SectionContent>
        {bioJa.map((paragraph) => (
          <p key={paragraph.slice(0, 50)}>{paragraph}</p>
        ))}
      </SectionContent>

      <SectionFooter>
        <ul className={styles.list}>
          <li className={styles['list__item']}>
            <h3 className={styles['list__title']}>Email</h3>

            <a href={`mailto:${email}`}>{email}</a>
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
