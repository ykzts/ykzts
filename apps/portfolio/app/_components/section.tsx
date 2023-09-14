'use client'

import clsx from 'clsx'
import { type ReactNode, createContext, useContext } from 'react'
import { useInView } from 'react-intersection-observer'
import styles from './section.module.css'

function* range(start: number, end: number) {
  for (let i = start; i <= end; i++) {
    yield i
  }
}

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
  className,
  id,
  intro = false
}: {
  children: ReactNode
  className?: string
  id?: string
  intro?: boolean
}) {
  const [ref, inView] = useInView({ triggerOnce: true })

  return (
    <SectionProvider value={{ active: inView, intro }}>
      <section
        className={clsx(
          styles.section,
          {
            [styles['section--active']]: inView,
            [styles.intro]: intro,
            [styles['intro--active']]: intro && inView
          },
          className
        )}
        id={id}
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

export function SectionTitle({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  const { active, intro } = useContext(SectionContext)
  const Title = intro ? 'h1' : 'h2'

  return (
    <Title
      className={clsx(
        styles.section__title,
        {
          [styles.intro__title]: intro,
          [styles['intro__title--active']]: intro && active
        },
        className
      )}
    >
      {children}
    </Title>
  )
}

export function SectionTagline({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  const { active, intro } = useContext(SectionContext)

  return (
    <p
      className={clsx(
        {
          [styles.intro__tagline]: intro,
          [styles['intro__tagline--active']]: intro && active
        },
        className
      )}
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

export function SectionFooter({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return <footer className={clsx(styles.footer, className)}>{children}</footer>
}

export function SectionSkeleton() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <span className={styles.textSkeleton} />
        </SectionTitle>
      </SectionHeader>

      <SectionContent>
        {Array.from(range(0, 2), (i) => (
          <p key={`para:${i}`}>
            {Array.from(range(0, 2), (j) => (
              <span
                className={styles.textSkeleton}
                key={`para:${i}/${j}`}
                style={{ width: j === 2 ? '50%' : '100%' }}
              />
            ))}
          </p>
        ))}
      </SectionContent>
    </Section>
  )
}
