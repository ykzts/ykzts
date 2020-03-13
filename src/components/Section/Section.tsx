import clsx from 'clsx'
import React, { FC } from 'react'
import { useInView } from 'react-intersection-observer'
import { SectionProvider } from './context'

type Props = {
  intro?: boolean
  last?: boolean
}

const Section: FC<Props> = ({ children, intro = false, last = false }) => {
  const [ref, inView] = useInView({ triggerOnce: true })

  return (
    <>
      <SectionProvider value={{ active: inView, intro, last }}>
        <section
          className={clsx('section', {
            'section--active': inView,
            intro: intro,
            'intro--active': intro && inView
          })}
          ref={ref}
        >
          {children}
        </section>
      </SectionProvider>

      <style jsx>{`
        .section {
          display: grid;
          grid-template-areas: 'header content' 'footer content';
          grid-template-columns: 50vw 50vw;
          grid-template-rows: 1fr;
          margin: 7.5rem 0 0 0;
          position: relative;
        }

        @media (max-width: 1280px) {
          .section {
            margin: 6rem 0 0 0;
          }
        }

        @media (max-width: 1152px) {
          .section {
            grid-template-areas: 'header' 'content' 'footer';
            grid-template-columns: 1fr;
            grid-template-rows: 3fr;
            margin: 0;
          }
        }

        @media (max-width: 736px) {
          .section {
            margin: 0;
          }
        }

        @media (max-width: 360px) {
          .section {
            margin: 0;
          }
        }

        .intro {
          align-items: center;
          margin-top: 0;
          opacity: 0;
          transition: opacity 1s ease;
        }

        @media (max-width: 1152px) {
          .intro {
            margin-bottom: 0;
          }
        }

        .intro--active {
          opacity: 1;
        }
      `}</style>
    </>
  )
}

export default Section
