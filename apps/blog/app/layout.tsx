import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { cn } from '@ykzts/ui/lib/utils'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Noto_Sans_JP } from 'next/font/google'
import DraftModeBannerClient from '@/components/draft-mode-banner-client'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://ykzts.com'),
  title: {
    default: 'Blog',
    template: '%s | Blog'
  }
}

export const viewport: Viewport = {
  themeColor: '#fafafa'
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
    >
      <head />
      <body>
        <DraftModeBannerClient />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
