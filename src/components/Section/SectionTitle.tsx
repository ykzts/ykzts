import clsx from 'clsx'
import { type FC, type ReactNode } from 'react'
import { useSectionContext } from './context'

type Props = {
  children: ReactNode
}

const SectionTitle: FC<Props> = ({ children }) => {
  const { active, intro } = useSectionContext()
  const Title = intro ? 'h1' : 'h2'

  return (
    <>
      <Title
        className={clsx('section__title', {
          intro__title: intro,
          'intro__title--active': intro && active
        })}
      >
        {children}
      </Title>

      <style jsx>{`
        .section__title {
          margin: 0 0 5rem 0;
          position: relative;
        }

        .section__title::before {
          background-color: #43d9b8;
          content: '';
          display: block;
          height: 2px;
          position: absolute;
          right: -5rem;
          top: 1rem;
          width: 2.5rem;
        }

        @media (max-width: 1152px) {
          .section__title:last-child {
            margin-bottom: 0;
          }
        }

        @media (max-width: 1152px) {
          .section__title::before {
            display: none;
          }
        }

        .section__title::after {
          background-color: #43d9b8;
          border-radius: 0.5rem;
          content: '';
          display: block;
          height: 0.5rem;
          position: absolute;
          right: -2.5rem;
          top: 0.75rem;
          width: 0.5rem;
        }

        @media (max-width: 1152px) {
          .section__title::after {
            display: none;
          }
        }

        .intro__title {
          margin: -2rem 0 1.5rem auto;
          width: 20rem;
        }

        @media (max-width: 1280px) and (max-width: 1152px) {
          .intro__title {
            width: 100%;
          }
        }

        @media (max-width: 1280px) {
          .intro__title {
            opacity: 0;
            transform: translate(-0.5rem);
            transition:
              transform 1s ease,
              opacity 1s ease;
          }
        }

        @media (max-width: 1152px) {
          .intro__title {
            width: 100%;
          }
        }

        .intro__title::before {
          top: 3rem;
        }

        .intro__title::after {
          top: 2.75rem;
        }

        @media (max-width: 1280px) {
          .intro__title--active {
            opacity: 1;
            transform: translate(0);
          }
        }
      `}</style>
    </>
  )
}

export default SectionTitle
