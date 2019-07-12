import { NextPage } from 'next'
import Head from 'next/head'
import React, { ReactElement } from 'react'
import Me from '../components/me'

export const config = {
  amp: true
}

const IndexPage: NextPage = (): ReactElement => {
  const description =
    'JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のポートフォリオです。山岸和利による過去の実績や作品の掲載、各種ソーシャルネットワーキングサービスのアカウントへのリンクなどの連絡先への参照があります。'

  return (
    <>
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

      <header className="hero">
        <h1 className="hero__title">ykzts.com</h1>
      </header>

      <main>
        <section className="section" id="about">
          <div className="section__content">
            <h2 className="section__headline">山岸和利とは</h2>

            <p className="section__paragraph">
              山岸和利はJavaScriptやRubyを用いたウェブアプリケーションの開発を得意とするソフトウェア開発者です。ほかにもGoやPerl、Pythonも扱います。Ruby
              on
              RailsやReactに造詣が深く、多くのウェブアプリケーションの開発を行っています。バックエンドからフロントエンドまで幅広く担当します。またウェブアプリケーション以外にもReact
              Nativeを使ったスマートフォン向けアプリケーションの開発も行えます。ウェブ関連の技術を中心とした学習を意欲的にしています。
            </p>
            <p className="section__paragraph">
              さらにAmazon Web Services (AWS) やGoogle Cloud Platform (GCP)
              といったクラウドサービスを利用したインフラストラクチャーの構築も得意としています。ウェブアプリケーションやウェブサービスの開発に関わる多くの領域の作業ができるという自負があります。
            </p>
            <p className="section__paragraph">
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
            </p>
          </div>
        </section>

        <section className="section" id="mastodon">
          <div className="section__content">
            <h2 className="section__headline">Mastodon</h2>

            <p className="section__paragraph">
              山岸和利は2017年7月から
              <a
                href="https://joinmastodon.org/"
                rel="noopener"
                target="_blank"
              >
                Mastodon
              </a>
              のコミッターを務めています。
            </p>
            <p className="section__paragraph">
              Mastodonはオープンソースのソーシャルネットワークサーバーです。Mastodonの特徴としてActivityPubとOStatusの二つのプロトコルをサポートしている点が挙げられます。Mastodonだけではなく同じくActivityPubやOStatusをサポートしているアプリケーションと相互に接続することができ、脱中央集権を目論むウェブアプリケーションとなっています。
            </p>
            <p className="section__paragraph">
              山岸和利は主にバグの修正やソースコードのリファクタリング、UIの日本語翻訳などの地域化といったことを行っています。またコミッターとしては世界中の開発者から送られてきたPull
              Requestのコードレビューを行い、その中でも簡単なバグの修正や翻訳の追加などの軽微な変更については自身でmergeしています。
            </p>
          </div>
        </section>

        <section className="section" id="manael">
          <div className="section__content">
            <h2 className="section__headline">Manael</h2>

            <p className="section__paragraph">
              山岸和利は2017年11月からオープンソースのリバースプロキシアプリケーションである
              <a href="https://manael.org/" rel="noopener" target="_blank">
                Manael
              </a>
              の開発を行っています。
            </p>
            <p className="section__paragraph">
              Manaelは画像の変換に主眼を置いたリバースプロキシです。PNGやJPEG形式の画像をWebP形式へと動的に変換する機能を有しています。Manael自体の機能は最小限に留められていて、NginxやVarnishといったキャッシュ機能を有するリバースプロキシを利用して変換済みのファイルをキャッシュすることを前提としています。
            </p>
            <p className="section__paragraph">
              またManaelはGoで書かれています。これにより平易な書き方でありながらも高速な処理が実現されています。
            </p>
          </div>
        </section>
      </main>

      <style jsx>{`
        .hero {
          align-items: center;
          background-color: #212121;
          color: #f5f5f5;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 100vh;
        }

        .hero__title {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          margin: 0;
          padding: 0.5em 0 1em;
        }

        @media (min-width: 650px) {
          .hero__title {
            font-size: 4rem;
          }
        }

        .section {
          background-color: #f5f5f5;
          background-repeat: no-repeat;
          box-sizing: border-box;
          color: #212121;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem 1rem;
        }

        .section__content {
          margin: 0 auto;
          max-width: 840px;
        }

        .section__headline {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 1.5rem;
          letter-spacing: 0.2em;
          padding: 0;
          text-align: center;
        }

        @media (min-width: 650px) {
          .section__headline {
            font-size: 4rem;
            text-align: left;
          }
        }

        .section__paragraph {
          line-height: 2;
          margin: 0;
          padding: 0;
          text-align: justify;
        }

        .section__paragraph + .section__paragraph {
          margin-top: 1rem;
        }

        .section__paragraph a {
          color: #757575;
          display: inline-block;
          margin: 0 0.1em;
        }

        .section__paragraph a:hover {
          color: #424242;
        }
      `}</style>
    </>
  )
}

export default IndexPage
