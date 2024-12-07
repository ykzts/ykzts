import { type Metadata } from 'next'
import Title from './(docs)/@title/layout'
import SubLayout from './(docs)/layout'
import styles from './not-found.module.css'

export const metadata: Metadata = {
  title: '404 Not Found'
}

export default function NotFound() {
  return (
    <SubLayout title={<Title>404 Not Found</Title>}>
      <p className={styles.message}>お探しのページを見つけられませんでした。</p>
    </SubLayout>
  )
}
