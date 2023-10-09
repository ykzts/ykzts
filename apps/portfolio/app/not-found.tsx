import { type Metadata } from 'next'
import Link from 'next/link'
import styles from './not-found.module.css'

export const metadata: Metadata = {
  title: '404 Not Found'
}

export default function NotFound() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>404 Not Found</h1>

        <p className={styles.message}>
          お探しのページを見つけられませんでした。
        </p>

        <p>
          <Link href="/">トップページに戻る</Link>
        </p>
      </main>
    </div>
  )
}
