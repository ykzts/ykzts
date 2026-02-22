import { getWorks } from '@/lib/supabase'
import Navigation from './navigation'

async function NavigationImpl() {
  let hasWorks = true

  try {
    const works = await getWorks()
    hasWorks = works.length > 0
  } catch (error) {
    console.error('Failed to load works for navigation:', error)
  }

  return <Navigation hasWorks={hasWorks} />
}

export default NavigationImpl
