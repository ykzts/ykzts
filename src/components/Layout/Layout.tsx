import clsx from 'clsx'
import Head from 'next/head'
import React, { FC } from 'react'
import { FaArrowDown } from 'react-icons/fa'
import { useInView } from 'react-intersection-observer'
import { Link as ScrollLink } from 'react-scroll'
import css from 'styled-jsx/css'
import keyVisual from '../../assets/key-visual.jpg'
import lqipKeyVisual from '../../assets/key-visual-lqip.jpg'
import paradigm from '../../assets/paradigm.svg'
import Image from '../Image'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTagline,
  SectionTitle
} from '../Section'
import LayoutFooter from './LayoutFooter'

const { className: fillClassName, styles: fillStyles } = css.resolve`
  .image {
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }
`

const { className: arrowClassName, styles: arrowStyles } = css.resolve`
  a {
    border-bottom: 0;
    display: inline-block;
    font-size: 4rem;
    height: 4rem;
    position: relative;
    width: 6rem;
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

            <ul className="actions">
              <li className="actions__item">
                <ScrollLink
                  aria-label="コンテンツまでスクロール"
                  className={arrowClassName}
                  href="#content"
                  offset={-100}
                  role="button"
                  smooth
                  to="content"
                >
                  <FaArrowDown />
                </ScrollLink>
              </li>
            </ul>
          </SectionHeader>

          <SectionContent>
            <Image
              alt=""
              className={fillClassName}
              height={1024}
              placeholder={lqipKeyVisual}
              src={keyVisual}
              width={1024}
            />
          </SectionContent>
        </Section>

        <main className="content" id="content">
          {children}
        </main>

        <LayoutFooter />
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

        .actions {
          cursor: default;
          display: flex;
          justify-content: flex-end;
          list-style: none;
          margin-left: auto;
          margin-top: -1rem;
          padding-left: 0;
          width: 20rem;
        }

        @media (max-width: 1152px) {
          .actions {
            display: none;
          }
        }

        .actions__item {
          padding: 0 0 0 1rem;
          vertical-align: middle;
        }

        .actions__item:first-child {
          padding-left: 0;
        }

        @media (max-width: 480px) {
          .actions__item {
            flex-grow: 1;
            flex-shrink: 1;
            padding: 1rem 0 0 0;
            text-align: center;
            width: 100%;
          }
        }
      `}</style>

      {fillStyles}
      {arrowStyles}
    </>
  )
}

export default Layout
