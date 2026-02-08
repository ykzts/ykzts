import type { ReactNode } from 'react'
import { HiOutlineArrowUpRight } from 'react-icons/hi2'
import Link from '@/components/link'
import { getProfile } from '@/lib/supabase'
import ContactForm from './contact-form'

// Infer icon and label from URL
function inferSocialInfo(url: string): { icon: string; label: string } {
  const urlLower = url.toLowerCase()

  if (urlLower.includes('facebook.com')) {
    return { icon: 'facebook', label: '山岸和利のFacebookアカウント' }
  }
  if (urlLower.includes('github.com')) {
    return { icon: 'github', label: '山岸和利のGitHubアカウント' }
  }
  if (urlLower.includes('mastodon') || urlLower.includes('ykzts.technology')) {
    return { icon: 'mastodon', label: '山岸和利のMastodonアカウント' }
  }
  if (urlLower.includes('threads.net')) {
    return { icon: 'threads', label: '山岸和利のThreadsアカウント' }
  }
  if (urlLower.includes('x.com') || urlLower.includes('twitter.com')) {
    return { icon: 'x', label: '山岸和利のXアカウント' }
  }

  // Fallback to github icon for unrecognized URLs
  return { icon: 'github', label: url }
}

function getSocialLogo(icon: string): ReactNode {
  return (
    <svg aria-hidden="true" className="size-5">
      <use href={`#${icon}-logo`} />
    </svg>
  )
}

export default async function Contact() {
  const profile = await getProfile()

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
        <ContactForm email={profile.email} />
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
            {profile.social_links.map((link) => {
              const { icon, label } = inferSocialInfo(link.url)
              return (
                <li key={link.url}>
                  <Link
                    aria-label={label}
                    className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-muted transition-all duration-200 hover:border-accent hover:text-accent focus:outline-2 focus:outline-accent focus:outline-offset-2"
                    href={link.url}
                    rel="me"
                    target="_blank"
                  >
                    {getSocialLogo(icon)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
