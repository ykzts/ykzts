import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import Skeleton from '@/components/skeleton'
import range from '@/lib/range'
import { SectionRoot, SectionTitle as SectionTitleImpl } from './context'

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
  return (
    <SectionRoot
      className={twMerge('section-grid', className)}
      id={id}
      intro={intro}
    >
      {children}
    </SectionRoot>
  )
}

export function SectionHeader({
  children,
  className
}: Readonly<{ children: ReactNode; className?: string | undefined }>) {
  return (
    <header
      className={twMerge(
        "section-header relative space-y-10 py-9 px-6 lg:mt-16 sm:py-12 sm:px-8 md:p-16 lg:py-0 lg:pl-20 lg:pr-40 lg:text-right after:hidden after:absolute after:content-[''] after:h-dvh after:w-0.5 after:bg-brand-dark after:top-0 after:right-22 lg:after:block group-data-intro:lg:mt-60",
        className
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
  return (
    <SectionTitleImpl
      className={twMerge(
        "relative ml-auto font-heading font-bold text-xl/loose uppercase tracking-widest before:hidden before:content-[''] before:absolute before:top-[0.5lh] before:-right-7 before:-mt-0.75 before:size-2 before:rounded before:bg-brand-dark after:hidden after:content-[''] after:absolute after:top-[0.5lh] after:-right-18 after:h-0.5 after:w-12 after:bg-brand-dark lg:before:block lg:after:block group-data-intro:font-main-title group-data-intro:text-5xl group-data-intro:tracking-tighter group-data-intro:normal-case group-data-intro:lg:-mt-[0.5lh] group-data-intro:lg:w-80 group-data-intro:sm:text-8xl",
        className
      )}
    >
      {children}
    </SectionTitleImpl>
  )
}

export function SectionTagline({
  children,
  className
}: Readonly<{
  children: ReactNode
  className?: string
}>) {
  return (
    <p
      className={twMerge(
        'ml-auto font-heading text-sm/loose uppercase tracking-widest lg:w-80 group-data-intro:font-semibold',
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
  return (
    <div
      className={twMerge(
        'section-content bg-white py-9 px-6 md:py-12 md:px-8 lg:p-16',
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
      className={twMerge(
        'section-footer relative ml-auto bg-white pt-0 pb-9 px-6 sm:pb-12 sm:px-8 md:pb-16 md:px-16 lg:py-0 lg:px-40 lg:bg-transparent lg:text-right',
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
          <Skeleton className="w-[5em]" />
        </SectionTitle>
      </SectionHeader>

      <SectionContent>
        {Array.from(range(0, 2), (i) => (
          <p key={`para:${i}`}>
            {Array.from(range(0, 2), (j) => (
              <Skeleton className={j === 2 ? 'w-[50%]' : 'w-full'} key={j} />
            ))}
          </p>
        ))}
      </SectionContent>
    </Section>
  )
}
