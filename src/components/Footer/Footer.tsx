import React, { FC } from 'react'
import { FaFacebookF, FaGithub, FaPatreon, FaTwitter } from 'react-icons/fa'
import css from 'styled-jsx/css'
import ExternalLink from '../ExternalLink'
import List, { ListItem, ListTitle } from '../List'
import Section, {
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle
} from '../Section'

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

const {
  className: footerLinkClassName,
  styles: footerLinkStyles
} = css.resolve`
  a {
    color: inherit;
  }
`

const Footer: FC = () => (
  <>
    <Section last>
      <SectionHeader>
        <SectionTitle>Get in touch</SectionTitle>
      </SectionHeader>

      <SectionContent />

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
                  aria-label="Twitter"
                  className={iconClassName}
                  href="https://twitter.com/ykzts"
                >
                  <FaTwitter />
                </ExternalLink>
              </li>
              <li className="icons__item">
                <ExternalLink
                  aria-label="Facebook"
                  className={iconClassName}
                  href="https://www.facebook.com/ykzts"
                >
                  <FaFacebookF />
                </ExternalLink>
              </li>
              <li className="icons__item">
                <ExternalLink
                  aria-label="GitHub"
                  className={iconClassName}
                  href="https://github.com/ykzts"
                >
                  <FaGithub />
                </ExternalLink>
              </li>
              <li className="icons__item">
                <ExternalLink
                  aria-label="Patreon"
                  className={iconClassName}
                  href="https://www.patreon.com/ykzts"
                >
                  <FaPatreon />
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
          className={footerLinkClassName}
          href="https://html5up.net/"
        >
          HTML5 UP
        </ExternalLink>
        .
      </div>
    </footer>

    <style jsx>{`
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

    {iconStyles}
    {footerLinkStyles}
  </>
)

export default Footer
