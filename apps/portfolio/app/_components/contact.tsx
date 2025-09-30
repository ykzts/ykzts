import type { ReactNode } from 'react'
import Link from '@/components/link'
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

      <SectionContent>
        <p>
          山岸和利に対するお問い合わせやご依頼はメールからお願いします。スケジュール次第ではありますが有期もしくは案件単位での作業依頼や技術相談でしたら有償で承ります。
        </p>
        <p>
          ただし無償もしくは報酬が不明瞭な依頼に関してはお応えできかねます。また依頼主が不明であるスカウトメールやオファーメールにつきましてはご返答いたしかねますのであらかじめご容赦ください。
        </p>
      </SectionContent>

      <SectionFooter>
        <ul className="list-none pl-0">
          <li className="mb-12 pl-0 last:mb-0 max-md:mb-8 [&>:last-child]:mb-0">
            <h3 className="mb-4">Email</h3>

            <a href="mailto:ykzts@desire.sh">ykzts@desire.sh</a>
          </li>
          <li className="mb-12 pl-0 last:mb-0 max-md:mb-8 [&>:last-child]:mb-0">
            <h3 className="mb-4">Blog</h3>

            <Link href="https://ykzts.blog/" rel="me" target="_blank">
              ykzts.blog
            </Link>
          </li>
          <li className="mb-12 pl-0 last:mb-0 max-md:mb-8 [&>:last-child]:mb-0">
            <h3 className="mb-4">Elsewhere</h3>

            <ul className="cursor-default list-none pl-0">
              {socialLinks.map((socialLink) => (
                <li className="inline-block last:pr-0" key={socialLink.url}>
                  <Link
                    aria-label={socialLink.label}
                    className="relative inline-flex h-9 w-9 items-center justify-center rounded-[2.25rem] border-b-0 text-xl leading-9 text-center no-underline transition-[background-color] duration-[0.25s] ease-in-out hover:bg-[rgba(144,144,144,0.1)] focus:bg-[rgba(73,252,212,0.2)] focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-[--color-brand]"
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
