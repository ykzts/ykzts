import type { ReactNode } from 'react'
import Link from '@/components/link'
import Section, {
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle
} from '@/components/section'

type SocialLink = {
  label: string
  logo: ReactNode
  url: `https://${string}`
}

const socialLinks: SocialLink[] = [
  {
    label: '山岸和利のFacebookアカウント',
    logo: (
      <svg aria-label="Facebook" className="size-[1em]" role="img">
        <use xlinkHref="#facebook-logo" />
      </svg>
    ),
    url: 'https://www.facebook.com/ykzts'
  },
  {
    label: '山岸和利のGitHubアカウント',
    logo: (
      <svg aria-label="GitHub" className="size-[1em]" role="img">
        <use xlinkHref="#github-logo" />
      </svg>
    ),
    url: 'https://github.com/ykzts'
  },
  {
    label: '山岸和利のMastodonアカウント',
    logo: (
      <svg aria-label="Mastodon" className="size-[1em]" role="img">
        <use xlinkHref="#mastodon-logo" />
      </svg>
    ),
    url: 'https://ykzts.technology/@ykzts'
  },
  {
    label: '山岸和利のThreadsアカウント',
    logo: (
      <svg aria-label="Threads" className="size-[1em]" role="img">
        <use xlinkHref="#threads-logo" />
      </svg>
    ),
    url: 'https://www.threads.net/@ykzts'
  },
  {
    label: '山岸和利のXアカウント',
    logo: (
      <svg aria-label="X" className="size-[1em]" role="img">
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

      <SectionContent className="prose prose-slate max-w-none">
        <p>
          山岸和利に対するお問い合わせやご依頼はお問い合わせフォームからお願いします。スケジュール次第ではありますが有期もしくは案件単位での作業依頼や技術相談でしたら有償で承ります。
        </p>
        <p>
          ただし無償もしくは報酬が不明瞭な依頼に関してはお応えできかねます。また依頼主が不明であるスカウトメールやオファーメールにつきましてはご返答いたしかねますのであらかじめご容赦ください。
        </p>
      </SectionContent>

      <SectionFooter>
        <dl className="space-y-8">
          <div className="space-y-4">
            <dt className="font-heading font-semibold text-sm/relaxed uppercase tracking-widest">
              お問い合わせ
            </dt>
            <dd>
              <Link href="/contact">お問い合わせフォーム</Link>
            </dd>
          </div>

          <div className="space-y-4">
            <dt className="font-heading font-semibold text-sm/relaxed uppercase tracking-widest">
              Blog
            </dt>
            <dd>
              <a href="https://ykzts.blog/">ykzts.blog</a>
            </dd>
          </div>

          <div className="space-y-4">
            <dt className="font-heading font-semibold text-sm/relaxed uppercase tracking-widest">
              Elsewhere
            </dt>
            <dd>
              <ul className="flex gap-2 lg:justify-end">
                {socialLinks.map((socialLink) => (
                  <li key={socialLink.url}>
                    <Link
                      aria-label={socialLink.label}
                      className="relative inline-flex size-9 items-center justify-center rounded-4xl border-b-0 text-xl/loose text-center no-underline transition-[background-color] duration-250 ease-in-out hover:bg-[rgba(144,144,144,0.1)] focus:bg-[rgba(73,252,212,0.2)] focus:outline-3 focus:outline-offset-2 focus:outline-brand"
                      href={socialLink.url}
                      rel="me"
                      target="_blank"
                    >
                      {socialLink.logo}
                    </Link>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </SectionFooter>
    </Section>
  )
}
