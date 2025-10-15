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
        "section-header relative space-y-10 px-6 py-9 after:absolute after:top-0 after:right-22 after:hidden after:h-dvh after:w-0.5 after:bg-brand-dark after:content-[''] sm:px-8 sm:py-12 md:p-16 lg:mt-16 lg:py-0 lg:pr-40 lg:pl-20 lg:text-right group-data-intro:lg:mt-60 lg:after:block",
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
        "before:-right-7 before:-mt-0.75 after:-right-18 group-data-intro:lg:-mt-[0.5lh] relative ml-auto font-bold font-heading text-xl/loose uppercase tracking-widest before:absolute before:top-[0.5lh] before:hidden before:size-2 before:rounded before:bg-brand-dark before:content-[''] after:absolute after:top-[0.5lh] after:hidden after:h-0.5 after:w-12 after:bg-brand-dark after:content-[''] group-data-intro:font-main-title group-data-intro:text-5xl group-data-intro:normal-case group-data-intro:tracking-tighter group-data-intro:sm:text-8xl group-data-intro:lg:w-80 lg:after:block lg:before:block",
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
        'ml-auto font-heading text-sm/loose uppercase tracking-widest group-data-intro:font-semibold lg:w-80',
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
        'section-content bg-white px-6 py-9 md:px-8 md:py-12 lg:p-16',
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
        'section-footer relative ml-auto bg-white px-6 pt-0 pb-9 sm:px-8 sm:pb-12 md:px-16 md:pb-16 lg:bg-transparent lg:px-40 lg:py-0 lg:text-right',
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
