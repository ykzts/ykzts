import type { Metadata } from 'next'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTitle
} from '@/app/_components/section'
import Link from '@/components/link'
import styles from './page.module.css'

export const metadata: Metadata = {
  description:
    'お問い合わせいただきありがとうございます。内容を確認次第、ご返信させていただきます。',
  title: 'お問い合わせありがとうございます'
}

export default function ThankYouPage() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>お問い合わせありがとうございます</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <div className={styles.message}>
          <p>
            お問い合わせいただきありがとうございます。内容を確認次第、ご返信させていただきます。
          </p>
          <p>通常、2〜3営業日以内にご返信いたします。</p>
        </div>

        <div className={styles.actions}>
          <Link className={styles.link} href="/">
            トップページに戻る
          </Link>
        </div>
      </SectionContent>
    </Section>
  )
}
