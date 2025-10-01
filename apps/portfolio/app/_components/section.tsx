'use client'

import clsx from 'clsx'
import { createContext, type ReactNode, useContext } from 'react'
import { useInView } from 'react-intersection-observer'

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
        className={clsx(
          "relative mt-[7.5rem] grid grid-cols-[50vw_50vw] grid-rows-[1fr] [grid-template-areas:'header_content'_'footer_content'] max-xl:mt-24 max-[1152px]:mt-0 max-[1152px]:grid-cols-1 max-[1152px]:grid-rows-[3fr] max-[1152px]:[grid-template-areas:'header'_'content'_'footer']",
          {
            'items-center mt-0 opacity-0 transition-opacity duration-1000 max-[1152px]:mb-0':
              intro,
            'opacity-100': intro && inView
          },
          className
        )}
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
      className={clsx(
        "w-[35rem] justify-self-end px-20 pr-40 text-right [grid-area:header] before:absolute before:left-[calc(50vw-5rem)] before:mt-4 before:block before:h-[calc(100%+10rem)] before:w-0.5 before:bg-[--color-brand-dark] before:content-[''] [.content_.section:last-of-type_&]:before:h-full [.content_.section:last-of-type_&]:after:absolute [.content_.section:last-of-type_&]:after:-bottom-6 [.content_.section:last-of-type_&]:after:left-[calc(50vw-5rem-0.25rem+1px)] [.content_.section:last-of-type_&]:after:z-[1] [.content_.section:last-of-type_&]:after:block [.content_.section:last-of-type_&]:after:h-2 [.content_.section:last-of-type_&]:after:w-2 [.content_.section:last-of-type_&]:after:rounded-[0.5rem] [.content_.section:last-of-type_&]:after:bg-[--color-brand-dark] [.content_.section:last-of-type_&]:after:content-[''] max-[1152px]:w-full max-[1152px]:justify-self-start max-[1152px]:bg-[--color-brand] max-[1152px]:bg-[url('/paradigm.svg')] max-[1152px]:bg-[25%_50%] max-[1152px]:bg-[length:40rem_auto] max-[1152px]:bg-repeat-y max-[1152px]:bg-fixed max-[1152px]:px-16 max-[1152px]:py-16 max-[1152px]:text-left max-[1152px]:before:hidden [.content_.section:last-of-type_&]:max-[1152px]:after:hidden max-md:px-8 max-md:py-12 max-[360px]:px-6 max-[360px]:py-9",
        {
          'translate-y-0': intro && active,
          'w-full pt-16 translate-y-4 transition-transform duration-1000 before:left-auto before:ml-[calc(50vw-10rem)] before:h-[calc(100vh+10rem)] max-xl:translate-y-0 max-xl:transition-none max-[1152px]:mb-0 max-[1152px]:px-16 max-[1152px]:pb-20 max-[1152px]:pt-32 max-[1152px]:before:ml-0 max-md:px-8 max-md:pb-10 max-[360px]:px-6 max-[360px]:pb-7.5':
            intro
        }
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
      className={clsx(
        "relative mb-20 after:absolute after:right-[-2.5rem] after:top-3 after:block after:h-2 after:w-2 after:rounded-[0.5rem] after:bg-[--color-brand-dark] after:content-[''] before:absolute before:right-[-5rem] before:top-4 before:block before:h-0.5 before:w-10 before:bg-[--color-brand-dark] before:content-[''] max-[1152px]:before:hidden max-[1152px]:after:hidden max-[1152px]:last:mb-0",
        {
          'max-xl:opacity-100 max-xl:translate-x-0': intro && active,
          'w-80 -mt-8 mb-6 ml-auto max-xl:w-full max-xl:opacity-0 max-xl:translate-x-[-0.5rem] max-xl:transition-[transform,opacity] max-xl:duration-1000 max-[1152px]:w-full before:top-12 after:top-11':
            intro
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
}: Readonly<{
  children: ReactNode
  className?: string
}>) {
  const { active, intro } = useContext(SectionContext)

  return (
    <p
      className={clsx(
        {
          'max-xl:opacity-100 max-xl:translate-x-0': intro && active,
          'w-80 ml-auto font-[family-name:var(--font-raleway),Helvetica,var(--font-noto-sans-jp),sans-serif] text-[0.8rem] leading-[2.5] uppercase tracking-[0.175rem] max-xl:w-full max-xl:opacity-0 max-xl:translate-x-[-0.5rem] max-xl:transition-[transform,opacity] max-xl:duration-1000 max-[1152px]:w-full':
            intro
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
}: Readonly<{
  children: ReactNode
  className?: string
}>) {
  const { active, intro } = useContext(SectionContext)

  return (
    <div
      className={clsx(
        'relative max-w-[60rem] px-20 [grid-area:content] max-[1152px]:w-full max-[1152px]:overflow-x-hidden max-[1152px]:px-16 max-[1152px]:py-16 max-md:px-8 max-md:py-12 max-[360px]:px-6 max-[360px]:py-9',
        {
          'max-w-none h-screen -translate-y-4 transition-transform duration-1000 max-xl:translate-y-0 max-xl:transition-none':
            intro,
          'translate-y-0': intro && active
        },
        className
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
      className={clsx(
        'px-40 text-right [grid-area:footer] max-[1152px]:px-16 max-[1152px]:pb-16 max-[1152px]:text-left max-md:px-8 max-md:pb-12 max-[360px]:px-6 max-[360px]:pb-9',
        className
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
