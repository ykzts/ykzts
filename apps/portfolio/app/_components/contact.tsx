import type { ReactNode } from 'react'
import Link from '@/components/link'
import ContactForm from './contact-form'

type SocialLink = {
  label: string
  logo: ReactNode
  url: `https://${string}`
}

const socialLinks: SocialLink[] = [
  {
    label: '山岸和利のGitHubアカウント',
    logo: (
      <svg aria-label="GitHub" className="size-5" role="img">
        <use xlinkHref="#github-logo" />
      </svg>
    ),
    url: 'https://github.com/ykzts'
  },
  {
    label: '山岸和利のMastodonアカウント',
    logo: (
      <svg aria-label="Mastodon" className="size-5" role="img">
        <use xlinkHref="#mastodon-logo" />
      </svg>
    ),
    url: 'https://ykzts.technology/@ykzts'
  },
  {
    label: '山岸和利のThreadsアカウント',
    logo: (
      <svg aria-label="Threads" className="size-5" role="img">
        <use xlinkHref="#threads-logo" />
      </svg>
    ),
    url: 'https://www.threads.net/@ykzts'
  },
  {
    label: '山岸和利のXアカウント',
    logo: (
      <svg aria-label="X" className="size-5" role="img">
        <use xlinkHref="#x-logo" />
      </svg>
    ),
    url: 'https://x.com/ykzts'
  }
]

export default function Contact() {
  return (
    <section className="mx-auto max-w-4xl py-16" id="contact">
      <h2 className="mb-8 font-semibold text-muted text-sm uppercase tracking-widest">
        Contact
      </h2>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Form */}
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="mb-4 text-muted leading-relaxed">
            お問い合わせやご依頼は以下のフォームからお願いします。スケジュール次第ではありますが有期もしくは案件単位での作業依頼や技術相談でしたら有償で承ります。
          </p>
          <p className="mb-6 text-muted text-sm">
            ※無償もしくは報酬が不明瞭な依頼、依頼主が不明なスカウトメールにはご返答いたしかねます。
          </p>
          <ContactForm />
        </div>

        {/* Social Links */}
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 font-medium text-foreground">Blog</h3>
            <a
              className="inline-flex items-center gap-2 text-accent transition-colors duration-200 hover:text-accent/80"
              href="https://ykzts.blog/"
              rel="noopener noreferrer"
              target="_blank"
            >
              ykzts.blog
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M7 17L17 7M17 7H7M17 7V17"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>

          <div>
            <h3 className="mb-4 font-medium text-foreground">Social</h3>
            <ul className="flex gap-3">
              {socialLinks.map((socialLink) => (
                <li key={socialLink.url}>
                  <Link
                    aria-label={socialLink.label}
                    className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-muted transition-all duration-200 hover:border-accent hover:text-accent focus:outline-2 focus:outline-accent focus:outline-offset-2"
                    href={socialLink.url}
                    rel="me"
                    target="_blank"
                  >
                    {socialLink.logo}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
