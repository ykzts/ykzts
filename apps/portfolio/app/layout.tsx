import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import clsx from 'clsx'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP, Raleway, Source_Sans_3 } from 'next/font/google'
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
  themeColor: '#49fcd4'
}

const notoSansJp = Noto_Sans_JP({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  weight: ['300', '600', '700', '800']
})
const raleway = Raleway({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-raleway',
  weight: ['600', '800']
})
const sourceSans3 = Source_Sans_3({
  display: 'swap',
  style: ['italic', 'normal'],
  subsets: ['latin'],
  variable: '--font-source-sans-3',
  weight: ['300', '600', '700']
})

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      className={clsx(
        notoSansJp.variable,
        raleway.variable,
        sourceSans3.variable
      )}
      lang="ja"
    >
      <head />
      <body>
        <a href="#content" className="skip-link">
          メインコンテンツにスキップ
        </a>
        
        <SVGSymbols />

        {children}

        <Analytics />
      </body>
    </html>
  )
}
