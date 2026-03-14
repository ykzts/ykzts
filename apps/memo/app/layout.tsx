import './globals.css'
import { getSiteOrigin } from '@ykzts/site-config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  description: 'メモアプリケーション',
  metadataBase: getSiteOrigin(),
  title: {
    default: 'Memo',
    template: '%s | Memo'
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
