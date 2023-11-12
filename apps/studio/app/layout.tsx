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
    default: 'studio.ykzts.com',
    template: '%s - studio.ykzts.com'
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
