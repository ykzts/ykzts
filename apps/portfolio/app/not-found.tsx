import { type Metadata } from 'next'
import Link from 'next/link'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTitle
} from './_components/section'
import styles from './not-found.module.css'

export const metadata: Metadata = {
  title: '404 Not Found'
}

export default function NotFound() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>404 Not Found</SectionTitle>
      </SectionHeader>

      <SectionContent className={styles['section__content']}>
        <p className={styles.message}>
          お探しのページを見つけられませんでした。
        </p>

        <p>
          <Link href="/">トップページに戻る</Link>
        </p>
      </SectionContent>
    </Section>
  )
}
