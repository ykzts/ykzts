import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP, Raleway, Source_Sans_3 } from 'next/font/google'
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
      className={twMerge(
        'scroll-smooth antialiased',
        notoSansJp.variable,
        raleway.variable,
        sourceSans3.variable
      )}
      lang="ja"
    >
      <head />
      <body className="bg-brand bg-(image:--paradigm) bg-fixed bg-repeat-y bg-size-[75%_auto] bg-position-[-50%_10%]">
        <a
          className="absolute -top-20 left-2 z-1000 rounded bg-black px-4 py-2 text-white no-underline transition-[top] duration-300 focus:top-2"
          href="#content"
        >
          メインコンテンツにスキップ
        </a>

        <SVGSymbols />

        {children}

        <Analytics />
      </body>
    </html>
  )
}
