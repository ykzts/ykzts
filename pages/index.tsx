import styled from '@emotion/styled'
import { NextFC } from 'next'
import Head from 'next/head'
import React, { ReactElement } from 'react'
import Me from '../components/me'
import Page from '../layouts/main'

const description =
  'JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のポートフォリオです。山岸和利による過去の実績や作品の掲載、各種ソーシャルネットワーキングサービスのアカウントへのリンクなどの連絡先への参照があります。'

const Header = styled.header`
  align-items: center;
  background-color: #212121;
  color: #f5f5f5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
`

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  margin: 0;
  padding: 0.5em 0 1em;
`

const Section = styled.section`
  background-color: #f5f5f5;
  background-repeat: no-repeat;
  box-sizing: border-box;
  color: #212121;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 1rem;
`

const SectionContent = styled.div`
  margin: 0 auto;
  max-width: 840px;
`

const SectionHeadline = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  letter-spacing: 0.2em;
  padding: 0;
`

const SectionParagraph = styled.p`
  line-height: 2;
  margin: 0;
  padding: 0;

  & + & {
    margin-top: 1rem;
  }

  a {
    color: #757575;
    display: inline-block;
    margin: 0 0.1em;
  }

  a:hover {
    color: #424242;
  }
`

const IndexPage: NextFC = (): ReactElement => (
  <Page>
    <Head>
      <title>ykzts.com - ソフトウェア開発者 山岸和利のポートフォリオ</title>
      <meta content={description} name="description" />
      <meta content={description} property="og:description" />
      <meta
        content="https://ykzts.com/static/images/main-visual.png"
        property="og:image"
      />
      <meta content="ja_JP" property="og:locale" />
      <meta content="ykzts.com" property="og:title" />
      <meta content="profile" property="og:type" />
      <meta content="https://ykzts.com/" property="og:url" />
      <meta content="Kazutoshi" property="profile:first_name" />
      <meta content="male" property="profile:gender" />
      <meta content="Yamagishi" property="profile:last_name" />
      <meta content="ykzts" property="profile:username" />
      <meta content="summary_large_image" name="twitter:card" />
      <meta content="@ykzts" name="twitter:creator" />
      <Me />
    </Head>

    <Header>
      <Title>ykzts.com</Title>
    </Header>

    <main>
      <Section id="about">
        <SectionContent>
          <SectionHeadline>山岸和利とは</SectionHeadline>

          <SectionParagraph>
            山岸和利はJavaScriptやRubyを用いたウェブアプリケーションの開発を得意とするソフトウェア開発者です。ほかにもGoやPerl、Pythonも扱います。Ruby
            on
            RailsやReactに造詣が深く、多くのウェブアプリケーションの開発を行っています。バックエンドからフロントエンドまで幅広く担当します。またウェブアプリケーション以外にもReact
            Nativeを使ったスマートフォン向けアプリケーションの開発も行えます。ウェブ関連の技術を中心とした学習を意欲的にしています。
          </SectionParagraph>
          <SectionParagraph>
            さらにAmazon Web Services (AWS) やGoogle Cloud Platform (GCP)
            といったクラウドサービスを利用したインフラストラクチャーの構築も得意としています。ウェブアプリケーションやウェブサービスの開発に関わる多くの領域の作業ができるという自負があります。
          </SectionParagraph>
          <SectionParagraph>
            詳しくは
            <a
              href="https://github.com/ykzts"
              rel="noopener"
              target="_blank"
              title="ykzts (Yamagishi Kazutoshi) - GitHub"
            >
              山岸和利のGitHubアカウント
            </a>
            も併せてご参照ください。
          </SectionParagraph>
        </SectionContent>
      </Section>

      <Section id="mastodon">
        <SectionContent>
          <SectionHeadline>Mastodon</SectionHeadline>

          <SectionParagraph>
            山岸和利は2017年7月から
            <a href="https://joinmastodon.org/" rel="noopener" target="_blank">
              Mastodon
            </a>
            のコミッターを務めています。
          </SectionParagraph>
          <SectionParagraph>
            Mastodonはオープンソースのソーシャルネットワークサーバーです。Mastodonの特徴としてActivityPubとOStatusの二つのプロトコルをサポートしている点が挙げられます。Mastodonだけではなく同じくActivityPubやOStatusをサポートしているアプリケーションと相互に接続することができ、脱中央集権を目論むウェブアプリケーションとなっています。
          </SectionParagraph>
          <SectionParagraph>
            山岸和利は主にバグの修正やソースコードのリファクタリング、UIの日本語翻訳などの地域化といったことを行っています。またコミッターとしては世界中の開発者から送られてきたPull
            Requestのコードレビューを行い、その中でも簡単なバグの修正や翻訳の追加などの軽微な変更については自身でmergeしています。
          </SectionParagraph>
        </SectionContent>
      </Section>

      <Section id="manael">
        <SectionContent>
          <SectionHeadline>Manael</SectionHeadline>

          <SectionParagraph>
            山岸和利は2017年11月からオープンソースのリバースプロキシアプリケーションである
            <a href="https://manael.org/" rel="noopener" target="_blank">
              Manael
            </a>
            の開発を行っています。
          </SectionParagraph>
          <SectionParagraph>
            Manaelは画像の変換に主眼を置いたリバースプロキシです。PNGやJPEG形式の画像をWebP形式へと動的に変換する機能を有しています。Manael自体の機能は最小限に留められていて、NginxやVarnishといったキャッシュ機能を有するリバースプロキシを利用して変換済みのファイルをキャッシュすることを前提としています。
          </SectionParagraph>
          <SectionParagraph>
            またManaelはGoで書かれています。これにより平易な書き方でありながらも高速な処理が実現されています。
          </SectionParagraph>
        </SectionContent>
      </Section>
    </main>
  </Page>
)

export default IndexPage
