import type { ReactNode } from 'react'
import { HiOutlineArrowUpRight } from 'react-icons/hi2'
import Link from '@/components/link'
import type { SocialLink } from '@/lib/supabase'
import { getProfile } from '@/lib/supabase'
import ContactForm from './contact-form'

type SocialLinkWithLogo = SocialLink & {
  logo: ReactNode
}

// Valid social icon types
const VALID_ICONS = ['facebook', 'github', 'mastodon', 'threads', 'x'] as const
type ValidIcon = (typeof VALID_ICONS)[number]

const fallbackSocialLinks: SocialLink[] = [
  {
    icon: 'facebook',
    label: '山岸和利のFacebookアカウント',
    url: 'https://www.facebook.com/ykzts'
  },
  {
    icon: 'github',
    label: '山岸和利のGitHubアカウント',
    url: 'https://github.com/ykzts'
  },
  {
    icon: 'mastodon',
    label: '山岸和利のMastodonアカウント',
    url: 'https://ykzts.technology/@ykzts'
  },
  {
    icon: 'threads',
    label: '山岸和利のThreadsアカウント',
    url: 'https://www.threads.net/@ykzts'
  },
  {
    icon: 'x',
    label: '山岸和利のXアカウント',
    url: 'https://x.com/ykzts'
  }
]

function isValidIcon(icon: string): icon is ValidIcon {
  return VALID_ICONS.includes(icon as ValidIcon)
}

function getSocialLogo(icon: string): ReactNode {
  // Use a generic icon for unrecognized icon types
  const iconId = isValidIcon(icon) ? icon : 'link'
  return (
    <svg aria-hidden="true" className="size-5">
      <use href={`#${iconId}-logo`} />
    </svg>
  )
}

export default async function Contact() {
  const profile = await getProfile()
  const socialLinks = profile?.social_links || fallbackSocialLinks

  const socialLinksWithLogo: SocialLinkWithLogo[] = socialLinks.map((link) => ({
    ...link,
    logo: getSocialLogo(link.icon)
  }))

  return (
    <section className="mx-auto max-w-4xl py-20" id="contact">
      <h2 className="mb-10 font-semibold text-base text-muted uppercase tracking-widest">
        Contact
      </h2>

      {/* Contact Form */}
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <p className="mb-4 text-base text-muted leading-relaxed">
          お問い合わせやご依頼は以下のフォームからお願いします。スケジュール次第ではありますが有期もしくは案件単位での作業依頼や技術相談でしたら有償で承ります。
        </p>
        <p className="mb-6 text-muted text-sm">
          ※無償もしくは報酬が不明瞭な依頼、依頼主が不明なスカウトメールにはご返答いたしかねます。
        </p>
        <ContactForm />
      </div>

      {/* Links */}
      <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:gap-16">
        <div>
          <h3 className="mb-4 font-medium text-foreground text-lg">Blog</h3>
          <Link
            className="inline-flex items-center gap-2 text-accent text-base transition-colors duration-200 hover:text-accent/80"
            href="https://ykzts.blog/"
          >
            ykzts.blog
            <HiOutlineArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div>
          <h3 className="mb-4 font-medium text-foreground text-lg">Social</h3>
          <ul className="flex gap-3">
            {socialLinksWithLogo.map((socialLink) => (
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
    </section>
  )
}
