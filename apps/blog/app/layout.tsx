import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import Header from '@ykzts/layout/components/header'
import SiteFooter from '@ykzts/layout/components/site-footer'
import { getSiteName, getSiteOrigin } from '@ykzts/site-config'
import { getProfile } from '@ykzts/supabase/queries'
import { cn } from '@ykzts/ui/lib/utils'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Noto_Sans_JP } from 'next/font/google'
import { Suspense } from 'react'
import DraftModeBanner from '@/components/draft-mode-banner'
import Link from '@/components/link'
import SearchForm from '@/components/search-form'
import ThemeProvider from '@/components/theme-provider'

const siteName = getSiteName()

export async function generateMetadata(): Promise<Metadata> {
  let fediverseCreator: string | null = null

  try {
    const profile = await getProfile()
    fediverseCreator = profile.fediverse_creator?.trim() || null
  } catch (error) {
    console.error('Failed to load profile for blog layout metadata:', error)
  }

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

const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700']
})

const jetBrainsMono = JetBrains_Mono({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500']
})

const notoSansJp = Noto_Sans_JP({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  weight: ['400', '500', '600', '700']
})

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html
      className={cn(
        'scroll-smooth antialiased',
        inter.variable,
        jetBrainsMono.variable,
        notoSansJp.variable
      )}
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
          <Suspense fallback={null}>
            <DraftModeBanner />
          </Suspense>
          <Header
            extra={<SearchForm className="hidden md:block md:w-48 lg:w-64" />}
          />
          {children}
          <SiteFooter
            artworkCredit={
              <span className="text-sm">
                Artwork by{' '}
                <Link
                  className="text-primary transition-colors duration-200 hover:text-primary/80"
                  href="https://x.com/diru_k1005"
                >
                  Kannazuki Diru
                </Link>
              </span>
            }
            privacyLink={
              <Link
                className="transition-colors duration-200 hover:text-primary"
                href="/privacy"
              >
                プライバシーポリシー
              </Link>
            }
          />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
