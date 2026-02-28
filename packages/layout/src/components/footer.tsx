import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function Footer({ children }: Props) {
  return (
    <footer className="border-border border-t px-6 py-12 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl text-base text-muted-foreground">
        {children}
      </div>
    </footer>
  )
}
