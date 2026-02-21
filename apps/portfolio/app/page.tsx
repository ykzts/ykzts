import { getPortfolioDescription, getSiteName } from '@ykzts/site-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getProfile, getWorks } from '@/lib/supabase'
import About from './_components/about'
import Contact from './_components/contact'
import Footer from './_components/footer'
import Hero from './_components/hero'
import Navigation from './_components/navigation'
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

export default async function HomePage(_props: PageProps<'/'>) {
  let hasWorks = true

  try {
    const works = await getWorks()
    hasWorks = works.length > 0
  } catch (error) {
    console.error('Failed to load works for navigation:', error)
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-border border-b bg-background/90 px-6 backdrop-blur-sm md:px-12 lg:px-24">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between">
          <Link className="font-semibold text-foreground text-lg" href="/">
            {siteName}
          </Link>
          <Navigation hasWorks={hasWorks} />
        </div>
      </header>

      <Hero />

      <main className="px-6 md:px-12 lg:px-24" id="content">
        <About />
        <Works />
        <Contact />
      </main>

      <Footer />
    </div>
  )
}
