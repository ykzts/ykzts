import React, { FC } from 'react'
import css from 'styled-jsx/css'
import ExternalLink from '../ExternalLink'

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
    <footer className="footer">
      <div className="copyright">
        © Yamagishi Kazutosh. Design{' '}
        <ExternalLink
          className={footerLinkClassName}
          href="https://html5up.net/"
        >
          HTML5 UP
        </ExternalLink>
        . Artwork by{' '}
        <ExternalLink
          className={footerLinkClassName}
          href="https://twitter.com/diru_k1005"
        >
          Kannazuki Diru
        </ExternalLink>
        .
      </div>
    </footer>

    <style jsx>{`
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

    {footerLinkStyles}
  </>
)

export default Footer
