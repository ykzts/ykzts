import {
  PortableText,
  type PortableTextMarkComponentProps,
  type PortableTextReactComponents
} from '@portabletext/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import ExternalLink from '@/components/link'
import Skeleton from '@/components/skeleton'
import AboutDoc from '@/docs/about.mdx'
import range from '@/lib/range'
import { getProfile } from '@/lib/supabase'
import keyVisual from './_assets/key-visual.jpg'
import Contact from './_components/contact'
import Works from './_components/works'

const description = [
  'JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のポートフォリオです。',
  '山岸和利による過去の実績や作品の掲載、各種ソーシャルネットワーキングサービスのアカウントへのリンクなどの連絡先への参照があります。'
].join('')

export const metadata: Metadata = {
  alternates: {
    canonical: '/'
  },
  description,
  openGraph: {
    description,
    title: 'ykzts.com',
    type: 'website',
    url: '/'
  },
  title: {
    absolute: 'ykzts.com - ソフトウェア開発者 山岸和利のポートフォリオ'
  },
  twitter: {
    card: 'summary_large_image'
  }
}

const portableTextComponents = {
  marks: {
    link({
      children,
      value
    }: PortableTextMarkComponentProps<{ _type: string; href: string }>) {
      const href = value?.href

      return <ExternalLink href={href}>{children}</ExternalLink>
    }
  }
} satisfies Partial<PortableTextReactComponents>

function HeroSkeleton() {
  return (
    <header className="px-6 py-20 md:px-12 lg:px-24 lg:py-28">
      <div className="mx-auto flex max-w-4xl flex-col-reverse items-start gap-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1">
          <Skeleton className="mb-4 h-12 w-48" />
          <Skeleton className="mb-8 h-6 w-full" />
          <div className="flex flex-wrap gap-2">
            {Array.from(range(0, 10), (i) => (
              <Skeleton className="h-8 w-24" key={`tech-${i}`} />
            ))}
          </div>
        </div>
        <Skeleton className="size-80 rounded-2xl" />
      </div>
    </header>
  )
}

async function Hero() {
  const profile = await getProfile()

  return (
    <header className="px-6 py-20 md:px-12 lg:px-24 lg:py-28">
      <div className="mx-auto flex max-w-4xl flex-col-reverse items-start gap-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1">
          <h1 className="mb-4 font-bold text-5xl text-foreground tracking-tight md:text-6xl lg:text-7xl">
            {profile.name}
          </h1>
          <p className="mb-8 max-w-2xl text-muted text-xl leading-relaxed">
            {profile.tagline}
          </p>

          {/* Tech Stack Tags */}
          <div className="flex flex-wrap gap-2">
            {profile.technologies.map((tech) => (
              <span className="tech-tag" key={tech.name}>
                {tech.name}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <Image
            alt={profile.name}
            className="rounded-2xl shadow-lg"
            height={320}
            placeholder="blur"
            priority
            src={keyVisual}
            width={320}
          />
        </div>
      </div>
    </header>
  )
}

function AboutSkeleton() {
  return (
    <section className="mx-auto max-w-4xl py-20" id="about">
      <h2 className="mb-10 font-semibold text-base text-muted uppercase tracking-widest">
        About
      </h2>
      <div className="space-y-4">
        {Array.from(range(0, 3), (i) => (
          <Skeleton className="h-4 w-full" key={`about-${i}`} />
        ))}
      </div>
    </section>
  )
}

async function About() {
  const profile = await getProfile()

  return (
    <section className="mx-auto max-w-4xl py-20" id="about">
      <h2 className="mb-10 font-semibold text-base text-muted uppercase tracking-widest">
        About
      </h2>
      <div className="prose prose-lg max-w-none prose-a:text-accent prose-headings:text-foreground prose-p:text-base prose-p:text-muted prose-strong:text-foreground prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
        {profile.about ? (
          <PortableText
            components={portableTextComponents}
            value={profile.about}
          />
        ) : (
          <AboutDoc />
        )}
      </div>
    </section>
  )
}

export default function HomePage(_props: PageProps<'/'>) {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-border border-b bg-background/90 px-6 backdrop-blur-sm md:px-12 lg:px-24">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between">
          <Link className="font-semibold text-foreground text-lg" href="/">
            ykzts.com
          </Link>
          <div className="flex gap-8 text-base text-muted">
            <a
              className="rounded transition-colors duration-200 hover:text-accent focus:outline-2 focus:outline-accent focus:outline-offset-2"
              href="#about"
            >
              About
            </a>
            <a
              className="rounded transition-colors duration-200 hover:text-accent focus:outline-2 focus:outline-accent focus:outline-offset-2"
              href="#works"
            >
              Works
            </a>
            <a
              className="rounded transition-colors duration-200 hover:text-accent focus:outline-2 focus:outline-accent focus:outline-offset-2"
              href="#contact"
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>

      <main className="px-6 md:px-12 lg:px-24" id="content">
        {/* About Section */}
        <Suspense fallback={<AboutSkeleton />}>
          <About />
        </Suspense>

        {/* Works Section */}
        <Works />

        {/* Contact Section */}
        <Contact />
      </main>

      <Suspense>
        <Footer />
      </Suspense>
    </div>
  )
}

async function Footer() {
  const profile = await getProfile()

  return (
    <footer className="border-border border-t px-6 py-12 md:px-12 lg:px-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-base text-muted md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <span>© {profile.name}</span>
          <span className="text-sm">
            Artwork by{' '}
            <ExternalLink
              className="text-accent transition-colors duration-200 hover:text-accent/80"
              href="https://x.com/diru_k1005"
            >
              Kannazuki Diru
            </ExternalLink>
          </span>
        </div>
        <Link
          className="transition-colors duration-200 hover:text-accent"
          href="/privacy"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  )
}
