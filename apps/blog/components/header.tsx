import { getSiteName } from '@ykzts/site-config'
import { Suspense } from 'react'
import NavigationWrapper from './navigation-wrapper'
import SearchForm from './search-form'

const siteName = getSiteName()

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-border border-b bg-background/90 px-6 backdrop-blur-sm md:px-12 lg:px-24">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between">
        <a className="font-semibold text-foreground text-lg" href="/">
          {siteName}
        </a>
        <div className="flex items-center gap-2">
          <SearchForm className="hidden md:block md:w-48 lg:w-64" />
          <Suspense>
            <NavigationWrapper />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
