import { type FC, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

const SectionFooter: FC<Props> = ({ children }) => (
  <>
    <footer className="footer">{children}</footer>

    <style jsx>{`
      .footer {
        grid-area: footer;
        padding: 0 10rem;
        text-align: right;
      }

      @media (max-width: 1152px) {
        .footer {
          padding: 0 4rem 4rem 4rem;
          text-align: left;
        }
      }

      @media (max-width: 736px) {
        .footer {
          padding: 0 2rem 3rem 2rem;
        }
      }

      @media (max-width: 360px) {
        .footer {
          padding: 0 1.5rem 2.25rem 1.5rem;
        }
      }
    `}</style>
  </>
)

export default SectionFooter
