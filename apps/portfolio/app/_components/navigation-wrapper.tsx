import { getProfile, getWorks } from '@/lib/supabase'
import Navigation from './navigation'

async function NavigationImpl() {
  let hasAbout = false
  let hasWorks = false

  try {
    const profile = await getProfile()
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

export default NavigationImpl
