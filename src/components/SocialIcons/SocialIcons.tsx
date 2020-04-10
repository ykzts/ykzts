import React, { FC } from 'react'
import {
  FaFacebookF,
  FaGithub,
  FaMastodon,
  FaPatreon,
  FaTwitter
} from 'react-icons/fa'
import css from 'styled-jsx/css'
import ExternalLink from '../ExternalLink'

const { className: iconClassName, styles: iconStyles } = css.resolve`
  a {
    align-items: center;
    border-bottom: 0;
    border-radius: 2.25rem;
    display: inline-flex;
    font-size: 1.25rem;
    height: 2.25rem;
    justify-content: center;
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

const SocialIcons: FC = () => (
  <>
    <ul className="icons">
      <li className="icons__item">
        <ExternalLink
          aria-label="Mastodon"
          className={iconClassName}
          href="https://ykzts.technology/@ykzts"
          rel="me"
        >
          <FaMastodon />
        </ExternalLink>
      </li>
      <li className="icons__item">
        <ExternalLink
          aria-label="Twitter"
          className={iconClassName}
          href="https://twitter.com/ykzts"
          rel="me"
        >
          <FaTwitter />
        </ExternalLink>
      </li>
      <li className="icons__item">
        <ExternalLink
          aria-label="Facebook"
          className={iconClassName}
          href="https://www.facebook.com/ykzts"
          rel="me"
        >
          <FaFacebookF />
        </ExternalLink>
      </li>
      <li className="icons__item">
        <ExternalLink
          aria-label="GitHub"
          className={iconClassName}
          href="https://github.com/ykzts"
          rel="me"
        >
          <FaGithub />
        </ExternalLink>
      </li>
      <li className="icons__item">
        <ExternalLink
          aria-label="Patreon"
          className={iconClassName}
          href="https://www.patreon.com/ykzts"
          rel="me"
        >
          <FaPatreon />
        </ExternalLink>
      </li>
    </ul>

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
    `}</style>

    {iconStyles}
  </>
)

export default SocialIcons
