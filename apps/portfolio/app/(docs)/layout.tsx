import Link from 'next/link'
import { type ReactNode } from 'react'
import styles from './layout.module.css'

export const runtime = 'edge'

export default function DocsLayout({
  children,
  title
}: {
  children: ReactNode
  title: ReactNode
}) {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {title}

        {children}

        <p className={styles.backToTop}>
          <Link href="/">トップページに戻る</Link>
        </p>
      </main>
    </div>
  )
}
