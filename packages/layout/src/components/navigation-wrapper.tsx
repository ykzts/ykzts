import { getProfile, getWorks } from '@ykzts/supabase/queries'
import { Suspense } from 'react'
import SiteNavigation from './site-navigation'

async function NavigationImpl() {
  const [profileResult, worksResult] = await Promise.allSettled([
    getProfile(),
    getWorks()
  ])

  if (profileResult.status === 'rejected') {
    console.error(
      'Failed to load profile for navigation:',
      profileResult.reason
    )
  }

  if (worksResult.status === 'rejected') {
    console.error('Failed to load works for navigation:', worksResult.reason)
  }

  const hasAbout =
    profileResult.status === 'fulfilled' && !!profileResult.value.about
  const hasWorks =
    worksResult.status === 'fulfilled' && worksResult.value.length > 0

  return <SiteNavigation hasAbout={hasAbout} hasWorks={hasWorks} />
}

function NavigationSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-9 w-32 animate-pulse rounded-md bg-muted"
    />
  )
}

export default function NavigationWrapper() {
  return (
    <Suspense fallback={<NavigationSkeleton />}>
      <NavigationImpl />
    </Suspense>
  )
}
