'use client'

import clsx from 'clsx'
import { type ReactNode, createContext, useContext } from 'react'
import { useInView } from 'react-intersection-observer'
import styles from './section.module.css'

const SectionContext = createContext<{
  active: boolean
  intro: boolean
}>({
  active: false,
  intro: false
})

export const SectionProvider = SectionContext.Provider

export default function Section({
  children,
  intro = false
}: {
  children: ReactNode
  intro?: boolean
}) {
  const [ref, inView] = useInView({ triggerOnce: true })

  return (
    <SectionProvider value={{ active: inView, intro }}>
      <section
        className={clsx(styles.section, {
          [styles['section--active']]: inView,
          [styles.intro]: intro,
          [styles['intro--active']]: intro && inView
        })}
        ref={ref}
      >
        {children}
      </section>
    </SectionProvider>
  )
}

export function SectionHeader({ children }: { children: ReactNode }) {
  const { active, intro } = useContext(SectionContext)

  return (
    <header
      className={clsx(styles.section__header, {
        [styles.intro__header]: intro,
        [styles['intro__header--active']]: intro && active
      })}
    >
      {children}
    </header>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const { active, intro } = useContext(SectionContext)
  const Title = intro ? 'h1' : 'h2'

  return (
    <Title
      className={clsx(styles.section__title, {
        [styles.intro__title]: intro,
        [styles['intro__title--active']]: intro && active
      })}
    >
      {children}
    </Title>
  )
}

export function SectionTagline({ children }: { children: ReactNode }) {
  const { active, intro } = useContext(SectionContext)

  return (
    <p
      className={clsx({
        [styles.intro__tagline]: intro,
        [styles['intro__tagline--active']]: intro && active
      })}
    >
      {children}
    </p>
  )
}

export function SectionContent({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  const { active, intro } = useContext(SectionContext)

  return (
    <div
      className={clsx(styles.section__content, className, {
        [styles.intro__content]: intro,
        [styles['intro__content--active']]: intro && active
      })}
    >
      {children}
    </div>
  )
}

export function SectionFooter({ children }: { children: ReactNode }) {
  return <footer className={styles.footer}>{children}</footer>
}
