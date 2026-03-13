import type { ReactNode } from 'react'

type Props = {
  children?: ReactNode
  title: string
}

export default function Header({ children, title }: Props) {
  return (
    <header className="sticky top-0 z-10 border-border border-b bg-background/90 px-6 backdrop-blur-sm md:px-12 lg:px-24">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between">
        <a
          aria-label={title}
          className="font-semibold text-foreground text-lg"
          href="/"
        >
          {title}
        </a>
        {children}
      </div>
    </header>
  )
}
