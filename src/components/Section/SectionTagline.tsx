import clsx from 'clsx'
import { type FC, type ReactNode } from 'react'
import { useSectionContext } from './context'

type Props = {
  children: ReactNode
}

const SectionTagline: FC<Props> = ({ children }) => {
  const { active, intro } = useSectionContext()

  return (
    <>
      <p
        className={clsx({
          intro__tagline: intro,
          'intro__tagline--active': intro && active
        })}
      >
        {children}
      </p>

      <style jsx>{`
        .intro__tagline {
          font-family: Raleway, Helvetica, Noto Sans JP, sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.175rem;
          line-height: 2.5;
          margin-left: auto;
          text-transform: uppercase;
          width: 20rem;
        }

        @media (max-width: 1280px) and (max-width: 1152px) {
          .intro__tagline {
            width: 100%;
          }
        }

        @media (max-width: 1280px) {
          .intro__tagline {
            opacity: 0;
            transform: translate(-0.5rem);
            transition: transform 1s ease, opacity 1s ease;
          }
        }

        @media (max-width: 1152px) {
          .intro__tagline {
            width: 100%;
          }
        }

        @media (max-width: 1280px) {
          .intro__tagline--active {
            opacity: 1;
            transform: translate(0);
          }
        }
      `}</style>
    </>
  )
}

export default SectionTagline
