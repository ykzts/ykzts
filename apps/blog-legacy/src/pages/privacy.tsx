import styled from '@emotion/styled'
import React, { FC, ReactElement } from 'react'
import Layout from '../components/layout'

const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0;
`

const Body = styled.div`
  margin: 2rem 0 0;

  h2 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 1.5rem 0 1rem;
  }

  p {
    line-height: 2;
    margin: 0;
  }
`

const Privacy: FC = (): ReactElement => {
  return (
    <Layout>
      <Title>プライバシーポリシー</Title>

      <Body>
        <p>
          ykzts.blog (以下 当ブログ)
          における個人情報の取り扱いについて以下の通り定めています。
        </p>

        <h2>取得する情報</h2>
        <p>
          当ブログでは
          <a
            href="https://developers.google.com/analytics/?hl=ja"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google アナリティクス
          </a>
          を利用してトラフィックデータの収集を行っています。収集されたトラフィックデータは匿名化され、あなたの個人が特定されることはありません。
        </p>
        <p>
          Google アナリティクスの詳細は
          <a
            href="https://marketingplatform.google.com/about/analytics/terms/jp/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google アナリティクス利用規約
          </a>
          を参照してください。
        </p>

        <p>
          また当ブログでは
          <a
            href="https://www.google.com/adsense/start/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google AdSense
          </a>
          を利用して広告の配信を行っています。Google
          AdSenseの運営者であるGoogleなどの広告配信事業者はあなたの行動に基いた広告配信のためにCookieを利用します。
        </p>

        <p>
          CookieやJavaScriptを無効にすることによってこれらの情報の取得を拒否できます。
        </p>

        <h2>問い合わせ先</h2>
        <p>
          運営者 山岸和利に対する問い合わせは山岸和利個人の
          <a href="mailto:ykzts@desire.sh">メールアドレス (ykzts@desire.sh)</a>
          にお願いします。
        </p>
      </Body>
    </Layout>
  )
}

export default Privacy
