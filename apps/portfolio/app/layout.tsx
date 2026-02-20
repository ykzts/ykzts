import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { getSiteOrigin } from '@ykzts/site-config'
import { Toaster } from '@ykzts/ui/components/sonner'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Noto_Sans_JP } from 'next/font/google'
import { twMerge } from 'tailwind-merge'
import SVGSymbols from './_components/svg-symbols'
import ThemeProvider from './_components/theme-provider'

export const metadata: Metadata = {
  metadataBase: getSiteOrigin(),
  other: {
    'fediverse:creator': 'ykzts@ykzts.technology',
    'Hatena::Bookmark': 'nocomment'
  },
  title: {
    default: process.env.NEXT_PUBLIC_SITE_NAME ?? 'example.com',
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME ?? 'example.com'}`
  }
}

export const viewport: Viewport = {
  themeColor: [
    { color: '#fafafa', media: '(prefers-color-scheme: light)' },
    { color: '#0f0f1a', media: '(prefers-color-scheme: dark)' }
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

export default function RootLayout({ children, modal }: LayoutProps<'/'>) {
  return (
    <html
      className={twMerge(
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
          <a
            className="absolute -top-20 left-2 z-1000 rounded bg-primary px-4 py-2 text-primary-foreground no-underline transition-[top] duration-300 focus-visible:top-2"
            href="#content"
          >
            メインコンテンツにスキップ
          </a>

          <SVGSymbols />

          {children}
          {modal}

          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
