import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { getSiteOrigin } from '@ykzts/site-config'
import { cn } from '@ykzts/ui/lib/utils'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Noto_Sans_JP } from 'next/font/google'
import { Suspense } from 'react'
import DraftModeBanner from '@/components/draft-mode-banner'
import Footer from '@/components/footer'
import ThemeProvider from '@/components/theme-provider'
import { getPublisherProfile } from '@/lib/supabase/profiles'

export async function generateMetadata(): Promise<Metadata> {
  let fediverseCreator: string | null = null

  try {
    const profile = await getPublisherProfile()
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
      default: 'Blog',
      template: '%s | Blog'
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
          {children}
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
