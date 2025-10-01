import type { ReactNode } from 'react'

export default function LayoutWrapper({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <div className="relative w-screen pb-40 max-xl:pb-32 max-[1152px]:pb-0 before:absolute before:left-0 before:top-0 before:-z-10 before:block before:h-full before:w-[50vw] before:bg-[--color-brand] before:bg-[url('/paradigm.svg')] before:bg-[-50%_10%] before:bg-no-repeat before:bg-fixed before:bg-[length:75%_auto] before:content-[''] max-[1152px]:before:hidden">
      {children}
    </div>
  )
}
