import { type Metadata } from 'next'
import { type ReactNode } from 'react'
import StyledComponentsRegistry from './_components/registry'
import styles from './layout.module.css'

export const metadata: Metadata = {
  referrer: 'no-referrer',
  robots: {
    follow: false,
    index: false
  },
  title: {
    absolute: 'studio.ykzts.com'
  },
  viewport: {
    initialScale: 1,
    viewportFit: 'cover',
    width: 'device-width'
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={styles.body}>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  )
}
