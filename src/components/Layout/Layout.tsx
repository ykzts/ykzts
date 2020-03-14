import clsx from 'clsx'
import Head from 'next/head'
import React, { FC } from 'react'
import { FaFacebookF, FaGithub, FaTwitter } from 'react-icons/fa'
import { useInView } from 'react-intersection-observer'
import css from 'styled-jsx/css'
import paradigm from '../../assets/paradigm.svg'
import ExternalLink from '../ExternalLink'
import Image from '../Image'
import List, { ListItem, ListTitle } from '../List'
import Section, {
  SectionContent,
  SectionFooter,
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

const { className: iconClassName, styles: iconStyles } = css.resolve`
  a {
    border-bottom: 0;
    border-radius: 2.25rem;
    display: inline-block;
    font-size: 1.25rem;
    height: 2.25rem;
    line-height: 2.25rem;
    position: relative;
    text-align: center;
    text-decoration: none;
    transition: background-color 0.25s ease-in-out;
    width: 2.25rem;
  }

  a:hover {
    background-color: rgba(144, 144, 144, 0.1);
  }
`

const { className: footerClassName, styles: footerStyles } = css.resolve`
  a {
    color: inherit;
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

        <Section last>
          <SectionHeader>
            <SectionTitle>Get in touch</SectionTitle>
          </SectionHeader>

          <SectionContent></SectionContent>

          <SectionFooter>
            <List>
              <ListItem>
                <ListTitle>Email</ListTitle>

                <a href="mailto:ykzts@desire.sh">ykzts@desire.sh</a>
              </ListItem>
              <ListItem>
                <ListTitle>Elsewhere</ListTitle>

                <ul className="icons">
                  <li className="icons__item">
                    <ExternalLink
                      className={iconClassName}
                      href="https://twitter.com/ykzts"
                    >
                      <FaTwitter />
                    </ExternalLink>
                  </li>
                  <li className="icons__item">
                    <ExternalLink
                      className={iconClassName}
                      href="https://www.facebook.com/ykzts"
                    >
                      <FaFacebookF />
                    </ExternalLink>
                  </li>
                  <li className="icons__item">
                    <ExternalLink
                      className={iconClassName}
                      href="https://github.com/ykzts"
                    >
                      <FaGithub />
                    </ExternalLink>
                  </li>
                </ul>
              </ListItem>
            </List>
          </SectionFooter>
        </Section>

        <footer className="footer">
          <div className="copyright">
            © Yamagishi Kazutosh. Design{' '}
            <ExternalLink
              className={footerClassName}
              href="https://html5up.net/"
            >
              HTML5 UP
            </ExternalLink>
            .
          </div>
        </footer>
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

        .icons {
          cursor: default;
          list-style: none;
          padding-left: 0;
        }

        .icons__item {
          display: inline-block;
        }

        .icons__item:last-child {
          padding-right: 0;
        }

        .footer {
          color: rgba(0, 0, 0, 0.25);
          font-size: 1rem;
          left: 50vw;
          padding: 0 5rem;
          position: relative;
          width: 50vw;
        }

        @media (max-width: 1280px) {
          .footer {
            padding: 0 4rem;
          }
        }

        @media (max-width: 1152px) {
          .footer {
            left: 0;
            padding: 0 4rem 4rem 4rem;
            width: 100%;
          }
        }

        @media (max-width: 736px) {
          .footer {
            padding: 0 2rem 2rem 2rem;
          }
        }

        @media (max-width: 360px) {
          .footer {
            padding: 0 1.5rem 1.5rem 1.5rem;
          }
        }
      `}</style>

      {fillStyles}
      {iconStyles}
      {footerStyles}
    </>
  )
}

export default Layout
