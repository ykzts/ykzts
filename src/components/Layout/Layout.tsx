import clsx from 'clsx'
import { useInView } from 'react-intersection-observer'
import paradigm from '../../assets/paradigm.svg'
import Intro from './Intro'
import LayoutFooter from './LayoutFooter'
import type { ReactNode, VFC } from 'react'

type Props = {
  children: ReactNode
}

const Layout: VFC<Props> = ({ children }) => {
  const [ref, inView] = useInView({ triggerOnce: true })

  return (
    <>
      <div className={clsx('wrapper', { 'wrapper--active': inView })} ref={ref}>
        <Intro />

        <main className="content" id="content">
          {children}
        </main>

        <LayoutFooter />
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
          background-image: url('${paradigm.src}');
          background-position: -50% 10%;
          background-repeat: no-repeat;
          background-size: 75% auto;
          content: '';
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
      `}</style>
    </>
  )
}

export default Layout
