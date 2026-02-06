import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Noto_Sans_JP } from 'next/font/google'
import { twMerge } from 'tailwind-merge'
import SVGSymbols from './_components/svg-symbols'

export const metadata: Metadata = {
  metadataBase: new URL('https://ykzts.com/'),
  other: {
    'fediverse:creator': 'ykzts@ykzts.technology'
  },
  title: {
    default: 'ykzts.com',
    template: '%s | ykzts.com'
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
    >
      <head />
      <body>
        <a
          className="absolute -top-20 left-2 z-1000 rounded bg-accent px-4 py-2 text-accent-foreground no-underline transition-[top] duration-300 focus:top-2"
          href="#content"
        >
          メインコンテンツにスキップ
        </a>

        <SVGSymbols />

        {children}
        {modal}

        <Analytics />
      </body>
    </html>
  )
}
