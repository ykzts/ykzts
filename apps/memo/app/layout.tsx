import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  description: 'メモアプリケーション',
  title: 'Memo'
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
