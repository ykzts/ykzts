import { NextPage } from 'next'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import React from 'react'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTitle
} from '../components/Section'

const NotFound: NextPage = () => (
  <>
    <NextSeo title="404 Not Found" />

    <Section>
      <SectionHeader>
        <SectionTitle>404 Not Found</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <p>このページは見つかりませんでした。</p>

        <p>
          <Link href="/">
            <a href="/">トップページに戻る</a>
          </Link>
        </p>
      </SectionContent>
    </Section>
  </>
)

export default NotFound
