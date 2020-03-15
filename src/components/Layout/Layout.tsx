import clsx from 'clsx'
import Head from 'next/head'
import React, { FC } from 'react'
import { useInView } from 'react-intersection-observer'
import css from 'styled-jsx/css'
import paradigm from '../../assets/paradigm.svg'
import Footer from '../Footer'
import Image from '../Image'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTagline,
  SectionTitle
} from '../Section'

const { className: fillClassName, styles: fillStyles } = css.resolve`
  .image {
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }
`

const Layout: FC = ({ children }) => {
  const [ref, inView] = useInView({ triggerOnce: true })

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css?display=swap&amp;family=Noto+Sans+JP:300,600,700,800,300i,600i,700i|Raleway:600,800|Source+Sans+Pro:300,600,700,300i,600i,700i"
          rel="stylesheet"
        />
      </Head>

      <div className={clsx('wrapper', { 'wrapper--active': inView })} ref={ref}>
        <Section intro>
          <SectionHeader>
            <SectionTitle>{'ykzts\u200b.com'}</SectionTitle>

            <SectionTagline>
              ソフトウェア開発者 山岸和利の
              <br />
              ポートフォリオ
            </SectionTagline>
          </SectionHeader>

          <SectionContent>
            <Image
              alt=""
              className={fillClassName}
              height={1024}
              placeholder="https://www.gravatar.com/avatar/b9025074d487cd0328f1dc816e5ac50a?s=10"
              src="https://www.gravatar.com/avatar/b9025074d487cd0328f1dc816e5ac50a?s=1024"
              width={1024}
            />
          </SectionContent>
        </Section>

        <main>{children}</main>

        <Footer />
      </div>

      <style jsx>{`
        .wrapper {
          padding: 0 0 10rem 0;
          position: relative;
          width: 100vw;
        }

        @media (max-width: 1280px) {
          .wrapper {
            padding: 0 0 8rem 0;
          }
        }

        @media (max-width: 1152px) {
          .wrapper {
            padding: 0;
          }
        }

        .wrapper::before {
          background-attachment: fixed;
          background-color: #49fcd4;
          background-image: url("${paradigm}");
          background-position: -50% 10%;
          background-repeat: no-repeat;
          background-size: 75% auto;
          content: "";
          display: block;
          height: 100%;
          left: 0;
          opacity: 0;
          position: absolute;
          top: 0;
          transition: opacity 1s ease;
          width: 50vw;
          z-index: -1;
        }

        @media (max-width: 1152px) {
          .wrapper:before {
            display: none;
          }
        }

        .wrapper--active::before {
          opacity: 1;
        }
      `}</style>

      {fillStyles}
    </>
  )
}

export default Layout
