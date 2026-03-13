import Header from '@ykzts/layout/components/header'
import SiteFooter from '@ykzts/layout/components/site-footer'
import { getPortfolioDescription, getSiteName } from '@ykzts/site-config'
import { getProfile } from '@ykzts/supabase/queries'
import type { Metadata } from 'next'
import Link from 'next/link'
import About from './_components/about'
import Contact from './_components/contact'
import Hero from './_components/hero'
import RecentPosts from './_components/recent-posts'
import Works from './_components/works'

const siteName = getSiteName()

export async function generateMetadata(): Promise<Metadata> {
  const description = getPortfolioDescription()
  const fallbackTitle = `${siteName} - ポートフォリオ`
  let absoluteTitle = fallbackTitle

  try {
    const profile = await getProfile()
    const occupation = profile.occupation?.trim()
    const titleSuffix = [occupation, profile.name].filter(Boolean).join(' ')
    absoluteTitle = titleSuffix
      ? `${siteName} - ${titleSuffix}のポートフォリオ`
      : fallbackTitle
  } catch (error) {
    console.error('Failed to load profile for portfolio metadata:', error)
  }

  return {
    alternates: {
      canonical: '/'
    },
    description,
    openGraph: {
      description,
      title: siteName,
      type: 'website',
      url: '/'
    },
    title: {
      absolute: absoluteTitle
    },
    twitter: {
      card: 'summary_large_image'
    }
  }
}

export default function HomePage(_props: PageProps<'/'>) {
  return (
    <div className="min-h-screen">
      <Header />

      <Hero />

      <main className="px-6 md:px-12 lg:px-24" id="content">
        <About />
        <Works />
        <RecentPosts />
        <Contact />
      </main>

      <SiteFooter
        privacyLink={
          <Link
            className="transition-colors duration-200 hover:text-primary"
            href="/privacy"
          >
            Privacy Policy
          </Link>
        }
      />
    </div>
  )
}
