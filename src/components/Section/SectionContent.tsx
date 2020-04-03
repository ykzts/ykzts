import clsx from 'clsx'
import React, { FC } from 'react'
import { useSectionContext } from './context'

type Props = {
  className?: string
}

const SectionContent: FC<Props> = ({ children, className }) => {
  const { active, intro } = useSectionContext()

  return (
    <>
      <div
        className={clsx('section__content', className, {
          intro__content: intro,
          'intro__content--active': intro && active
        })}
      >
        {children}
      </div>

      <style jsx>{`
        .section__content {
          grid-area: content;
          max-width: 60rem;
          padding: 0 5rem;
          position: relative;
        }

        @media (max-width: 1152px) {
          .section__content {
            padding: 4rem 4rem;
            width: 100%;
            overflow-x: hidden;
          }
        }

        @media (max-width: 736px) {
          .section__content {
            padding: 3rem 2rem;
          }
        }

        @media (max-width: 360px) {
          .section__content {
            padding: 2.25rem 1.5rem;
          }
        }

        .intro__content {
          height: 100vh;
          max-width: none;
          transform: translateY(-1rem);
          transition: transform 1s ease;
        }

        .intro__content--active {
          transform: translateY(0);
        }

        @media (max-width: 1280px) {
          .intro__content,
          .intro__content--active {
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </>
  )
}

export default SectionContent
