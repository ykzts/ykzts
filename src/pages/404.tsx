import { NextPage } from 'next'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import React from 'react'
import css from 'styled-jsx/css'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTitle
} from '../components/Section'

const { className: contentClassName, styles: contentStyles } = css.resolve`
  .section__content {
    min-height: 50vh;
  }
`

const NotFound: NextPage = () => (
  <>
    <NextSeo title="404 Not Found" />

    <Section>
      <SectionHeader>
        <SectionTitle>404 Not Found</SectionTitle>
      </SectionHeader>

      <SectionContent className={contentClassName}>
        <p className="message">お探しのページを見つけられませんでした。</p>

        <p>
          <Link href="/">
            <a>トップページに戻る</a>
          </Link>
        </p>
      </SectionContent>
    </Section>

    <style jsx>{`
      .message {
        margin-bottom: 10rem;
      }
    `}</style>

    {contentStyles}
  </>
)

export default NotFound
