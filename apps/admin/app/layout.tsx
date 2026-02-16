import { Toaster } from '@ykzts/ui/components/sonner'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  description: 'Admin application for content management',
  title: '管理画面'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
