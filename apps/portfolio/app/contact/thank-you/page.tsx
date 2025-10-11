import type { Metadata } from 'next'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTitle
} from '@/app/_components/section'
import Link from '@/components/link'

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
        <div className="mx-auto my-8 max-w-[600px] text-center">
          <p>
            お問い合わせいただきありがとうございます。内容を確認次第、ご返信させていただきます。
          </p>
          <p>通常、2〜3営業日以内にご返信いたします。</p>
        </div>

        <div className="mt-8 text-center">
          <Link
            className="inline-block rounded bg-brand px-10 py-3.5 font-semibold text-white no-underline transition-[background-color] duration-250 ease-in-out hover:bg-brand-dark focus:outline-3 focus:outline-offset-2 focus:outline-brand"
            href="/"
          >
            トップページに戻る
          </Link>
        </div>
      </SectionContent>
    </Section>
  )
}
