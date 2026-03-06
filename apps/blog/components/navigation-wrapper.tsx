import { getProfile, getWorks } from '@ykzts/supabase/queries'
import Navigation from './navigation'

async function NavigationWrapper() {
  const [profileResult, worksResult] = await Promise.allSettled([
    getProfile(),
    getWorks()
  ])

  if (profileResult.status === 'rejected') {
    console.error('Failed to load profile for navigation:', profileResult.reason)
  }

  if (worksResult.status === 'rejected') {
    console.error('Failed to load works for navigation:', worksResult.reason)
  }

  const hasAbout =
    profileResult.status === 'fulfilled' && !!profileResult.value.about
  const hasWorks =
    worksResult.status === 'fulfilled' && worksResult.value.length > 0

  return <Navigation hasAbout={hasAbout} hasWorks={hasWorks} />
}

export default NavigationWrapper
