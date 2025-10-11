import type { Metadata } from 'next'

export const metadata: Metadata = {
  referrer: 'no-referrer',
  robots: {
    follow: false,
    index: false
  },
  title: {
    default: 'studio.ykzts.com',
    template: '%s - studio.ykzts.com'
  }
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
