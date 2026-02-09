import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  description: 'Content Management System',
  title: 'Admin Panel'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
