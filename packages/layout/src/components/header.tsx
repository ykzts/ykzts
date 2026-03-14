import { getSiteName } from '@ykzts/site-config'
import type { ReactNode } from 'react'
import NavigationWrapper from './navigation-wrapper'

type Props = {
  extra?: ReactNode
}

export default function Header({ extra }: Props) {
  const siteName = getSiteName()

  return (
    <header className="sticky top-0 z-10 border-border border-b bg-background/90 px-6 backdrop-blur-sm md:px-12 lg:px-24">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between">
        <a
          aria-label={siteName}
          className="font-semibold text-foreground text-lg"
          href="/"
        >
          {siteName}
        </a>
        <div className="flex items-center gap-2">
          {extra}
          <NavigationWrapper />
        </div>
      </div>
    </header>
  )
}
