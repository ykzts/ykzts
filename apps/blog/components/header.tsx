import SharedHeader from '@ykzts/layout/components/header'
import NavigationWrapper from '@ykzts/layout/components/navigation-wrapper'
import { getSiteName } from '@ykzts/site-config'
import SearchForm from './search-form'

const siteName = getSiteName()

export default function Header() {
  return (
    <SharedHeader title={siteName}>
      <div className="flex items-center gap-2">
        <SearchForm className="hidden md:block md:w-48 lg:w-64" />
        <NavigationWrapper />
      </div>
    </SharedHeader>
  )
}
