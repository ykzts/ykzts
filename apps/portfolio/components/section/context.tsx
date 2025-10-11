'use client'

import { createContext, type ReactNode, useContext } from 'react'
import { useInView } from 'react-intersection-observer'
import { twMerge } from 'tailwind-merge'

const SectionContext = createContext<{
  active: boolean
  intro: boolean
}>({
  active: false,
  intro: false
})

export function SectionRoot({
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
        className={twMerge('group', className)}
        data-active={inView ? '' : undefined}
        data-intro={intro ? '' : undefined}
        id={id}
        ref={ref}
      >
        {children}
      </section>
    </SectionContext>
  )
}

export function SectionTitle(
  props: Readonly<{
    children: ReactNode
    className?: string | undefined
    id?: string | undefined
  }>
) {
  const { intro } = useContext(SectionContext)
  const Title = intro ? 'h1' : 'h2'

  return <Title {...props} />
}
