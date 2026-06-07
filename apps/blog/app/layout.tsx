import './globals.css'
import {
  PrefetchCrossZoneLinks,
  PrefetchCrossZoneLinksProvider
} from '@vercel/microfrontends/next/client'
import Header from '@ykzts/layout/components/header'
import SiteFooter from '@ykzts/layout/components/site-footer'
import { getSiteName, getSiteOrigin } from '@ykzts/site-config'
import { getProfileOptional } from '@ykzts/supabase/queries'
import type { Metadata, Viewport } from 'next'
import AnalyticsClient from '@/components/analytics-client'
import SearchForm from '@/components/search-form'
import ThemeProvider from '@/components/theme-provider'

const siteName = getSiteName()

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfileOptional()
  const fediverseCreator = profile?.fediverse_creator?.trim() || null

  return {
    metadataBase: getSiteOrigin(),
    other: {
      ...(fediverseCreator ? { 'fediverse:creator': fediverseCreator } : {}),
      'Hatena::Bookmark': 'nocomment'
    },
    title: {
      default: `Blog | ${siteName}`,
      template: `%s | Blog | ${siteName}`
    }
  }
}

export const viewport: Viewport = {
  themeColor: [
    { color: '#fafafa', media: '(prefers-color-scheme: light)' },
    { color: '#1a1a2e', media: '(prefers-color-scheme: dark)' }
  ]
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html
      className="scroll-smooth antialiased"
      lang="ja"
      suppressHydrationWarning
    >
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <PrefetchCrossZoneLinksProvider>
            <Header
              extra={<SearchForm className="hidden md:block md:w-48 lg:w-64" />}
            />
            {children}
            <SiteFooter />
            <AnalyticsClient />
            <PrefetchCrossZoneLinks />
          </PrefetchCrossZoneLinksProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
