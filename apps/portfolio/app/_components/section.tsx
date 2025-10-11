'use client'

import clsx from 'clsx'
import { createContext, type ReactNode, useContext } from 'react'
import { useInView } from 'react-intersection-observer'
import { twMerge } from 'tailwind-merge'

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

export default function Section({
  children,
  className,
  id,
  intro = false
}: Readonly<{
  children: ReactNode
  className?: string
  id?: string
  intro?: boolean
}>) {
  const [ref, inView] = useInView({
    initialInView: intro,
    skip: !intro,
    triggerOnce: true
  })

  return (
    <SectionContext value={{ active: inView, intro }}>
      <section
        className={twMerge(clsx('section-grid', className))}
        data-intro={intro ? '' : undefined}
        id={id}
        ref={ref}
      >
        {children}
      </section>
    </SectionContext>
  )
}

export function SectionHeader({ children }: Readonly<{ children: ReactNode }>) {
  const { active, intro } = useContext(SectionContext)

  return (
    <header
      className={twMerge(
        clsx(
          "section-header relative space-y-10 py-9 px-6 lg:mt-16 sm:py-12 sm:px-8 md:p-16 lg:py-0 lg:pl-20 lg:pr-40 lg:text-right after:hidden after:absolute after:content-[''] after:h-dvh after:w-0.5 after:bg-brand-dark after:top-0 after:right-22 lg:after:block",
          intro && 'lg:mt-60',
          intro && active && ''
        )
      )}
    >
      {children}
    </header>
  )
}

export function SectionTitle({
  children,
  className
}: Readonly<{
  children: ReactNode
  className?: string
}>) {
  const { active, intro } = useContext(SectionContext)
  const Title = intro ? 'h1' : 'h2'

  return (
    <Title
      className={twMerge(
        clsx(
          "relative ml-auto font-heading font-bold text-xl/loose uppercase tracking-widest before:hidden before:content-[''] before:absolute before:top-[0.5lh] before:-right-7 before:-mt-0.75 before:size-2 before:rounded before:bg-brand-dark after:hidden after:content-[''] after:absolute after:top-[0.5lh] after:-right-18 after:h-0.5 after:w-12 after:bg-brand-dark lg:before:block lg:after:block",
          intro &&
            'font-main-title text-5xl tracking-tighter normal-case lg:-mt-[0.5lh] lg:w-80 sm:text-8xl',
          intro && active && '',
          className
        )
      )}
    >
      {children}
    </Title>
  )
}

export function SectionTagline({
  children,
  className
}: Readonly<{
  children: ReactNode
  className?: string
}>) {
  const { active, intro } = useContext(SectionContext)

  return (
    <p
      className={twMerge(
        clsx(
          'ml-auto font-heading text-sm/loose uppercase tracking-widest lg:w-80',
          intro && 'font-semibold',
          intro && active && '',
          className
        )
      )}
    >
      {children}
    </p>
  )
}

export function SectionContent({
  children,
  className
}: Readonly<{
  children: ReactNode
  className?: string
}>) {
  const { active, intro } = useContext(SectionContext)

  return (
    <div
      className={twMerge(
        clsx(
          'section-content bg-white py-9 px-6 md:py-12 md:px-8 lg:p-16',
          intro && '',
          intro && active && '',
          className
        )
      )}
    >
      {children}
    </div>
  )
}

export function SectionFooter({
  children,
  className
}: Readonly<{
  children: ReactNode
  className?: string
}>) {
  return (
    <footer
      className={twMerge(
        clsx(
          'section-footer relative ml-auto bg-white pt-0 pb-9 px-6 sm:pb-12 sm:px-8 md:pb-16 md:px-16 lg:py-0 lg:px-40 lg:bg-transparent lg:text-right',
          className
        )
      )}
    >
      {children}
    </footer>
  )
}

export function SectionSkeleton() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <span className="relative inline-block h-[1em] w-[10em] max-w-full overflow-hidden rounded-[0.25em] bg-[rgba(221,221,221,0.7)] after:absolute after:inset-0 after:block after:bg-[linear-gradient(90deg,transparent,rgba(221,221,221,0.7),transparent)] after:translate-x-[-100%] after:animate-[wave_1.5s_linear_0.3s_infinite] after:content-['']" />
        </SectionTitle>
      </SectionHeader>

      <SectionContent>
        {Array.from(range(0, 2), (i) => (
          <p key={`para:${i}`}>
            {Array.from(range(0, 2), (j) => (
              <span
                className="relative inline-block h-[1em] w-[10em] max-w-full overflow-hidden rounded-[0.25em] bg-[rgba(221,221,221,0.7)] after:absolute after:inset-0 after:block after:bg-[linear-gradient(90deg,transparent,rgba(221,221,221,0.7),transparent)] after:translate-x-[-100%] after:animate-[wave_1.5s_linear_0.3s_infinite] after:content-['']"
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
