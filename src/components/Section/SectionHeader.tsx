import clsx from 'clsx'
import React, { FC } from 'react'
import paradigm from '../../assets/paradigm.svg'
import { useSectionContext } from './context'

const SectionHeader: FC = ({ children }) => {
  const { active, intro, last } = useSectionContext()

  return (
    <>
      <header
        className={clsx('section__header', {
          'section__header--last': last,
          intro__header: intro,
          'intro__header--active': intro && active
        })}
      >
        {children}
      </header>

      <style jsx>{`
        .section__header {
          grid-area: header;
          justify-self: end;
          padding: 0 10rem 0 5rem;
          text-align: right;
          width: 35rem;
        }

        @media (max-width: 1280px) {
          .section__header {
            padding: 0 8rem 0 4rem;
            width: 33rem;
          }
        }

        @media (max-width: 1152px) {
          .section__header {
            background-attachment: fixed;
            background-color: #49fcd4;
            background-image: url("${paradigm}");
            background-position: 25% 50%;
						background-repeat: repeat-y;
						background-size: 40rem auto;
            justify-self: start;
            padding: 4rem 4rem;
						text-align: left;
						width: 100%;
          }
        }

        @media (max-width: 736px) {
          .section__header {
            padding: 3rem 2rem;
          }
        }

        @media (max-width: 360px) {
          .section__header {
            padding: 2.25rem 1.5rem;
          }
        }

        .section__header::before {
          background-color: #43d9b8;
          content: '';
          display: block;
          height: calc(100% + 10rem);
          left: calc(50vw - 5rem);
          margin-top: 1rem;
          position: absolute;
          width: 2px;
        }

        @media (max-width: 1280px) and (max-width: 1152px) {
          .section__header::before {
            margin-left: 0;
          }
        }

        @media (max-width: 1152px) {
          .section__header::before {
            display: none;
          }
        }

        .section__header--last::before {
          height: 100%;
        }

        .section__header--last::after {
          background-color: #43d9b8;
          border-radius: 0.5rem;
          bottom: -1.5rem;
          content: '';
          display: block;
          height: 0.5rem;
          left: calc(50vw - 5rem - 0.25rem + 1px);
          position: absolute;
          width: 0.5rem;
          z-index: 1;
        }

        @media (max-width: 1152px) {
          .section__header--last::after {
            display: none;
          }
        }

        .intro__header {
          padding-top: 4rem;
          transform: translateY(1rem);
          transition: transform 1s ease;
          width: 100%;
        }

        @media (max-width: 1152px) {
          .intro__header {
            margin-bottom: 0;
            padding: 8rem 4rem 5rem 4rem;
          }
        }

        @media (max-width: 736px) {
          .intro__header {
            padding: 5.5rem 2rem 2.5rem 2rem;
          }
        }

        @media (max-width: 360px) {
          .intro__header {
            padding: 4.875rem 1.5rem 1.875rem 1.5rem;
          }
        }

        .intro__header::before {
          height: calc(100vh + 10rem);
          left: auto;
          margin-left: calc(50vw - 10rem);
        }

        @media (max-width: 1152px) {
          .intro__header::before {
            margin-left: 0;
          }
        }

        .intro__header--active {
          transform: translateY(0);
        }

        @media (max-width: 1280px) {
          .intro__header,
          .intro__header--active {
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </>
  )
}

export default SectionHeader
