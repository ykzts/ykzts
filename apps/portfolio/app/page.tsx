import { type Metadata } from 'next'
import { Suspense } from 'react'
import Contact from './_components/contact'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTitle
} from './_components/section'
import Works, { WorksSkeleton } from './_components/works'
import AboutDoc from './_docs/about.mdx'
import DonationDoc from './_docs/donation.mdx'

const description =
  'JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のポートフォリオです。山岸和利による過去の実績や作品の掲載、各種ソーシャルネットワーキングサービスのアカウントへのリンクなどの連絡先への参照があります。'

export const runtime = 'edge'
export const revalidate = 600

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

function About() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>About</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <AboutDoc />
      </SectionContent>
    </Section>
  )
}

function Donation() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Donation</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <DonationDoc />
      </SectionContent>
    </Section>
  )
}

export default function HomePage() {
  return (
    <>
      <About />
      <Suspense fallback={<WorksSkeleton />}>
        <Works />
      </Suspense>
      <Donation />
      <Contact />
    </>
  )
}
