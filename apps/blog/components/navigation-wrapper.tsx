import { getPublisherProfile } from '@/lib/supabase/profiles'
import { getWorks } from '@/lib/supabase/works'
import Navigation from './navigation'

async function NavigationWrapper() {
  let hasAbout = true
  let hasWorks = true

  try {
    const profile = await getPublisherProfile()
    hasAbout = !!profile.about
  } catch (error) {
    console.error('Failed to load profile for navigation:', error)
  }

  try {
    const works = await getWorks()
    hasWorks = works.length > 0
  } catch (error) {
    console.error('Failed to load works for navigation:', error)
  }

  return <Navigation hasAbout={hasAbout} hasWorks={hasWorks} />
}

export default NavigationWrapper
