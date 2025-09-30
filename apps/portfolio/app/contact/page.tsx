import type { Metadata } from 'next'
import ContactForm from '@/app/_components/contact-form'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTitle
} from '@/app/_components/section'

export const metadata: Metadata = {
  description:
    '山岸和利へのお問い合わせはこちらのフォームからお願いします。スケジュール次第ではありますが有期もしくは案件単位での作業依頼や技術相談でしたら有償で承ります。',
  title: 'お問い合わせ'
}

export default function ContactPage() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>お問い合わせ</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <p>
          山岸和利に対するお問い合わせやご依頼は以下のフォームからお願いします。スケジュール次第ではありますが有期もしくは案件単位での作業依頼や技術相談でしたら有償で承ります。
        </p>
        <p>
          ただし無償もしくは報酬が不明瞭な依頼に関してはお応えできかねます。また依頼主が不明であるスカウトメールやオファーメールにつきましてはご返答いたしかねますのであらかじめご容赦ください。
        </p>
      </SectionContent>

      <ContactForm />
    </Section>
  )
}
