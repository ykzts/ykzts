'use cache'

import { cacheTag } from 'next/cache'
import { supabase } from './client'

export async function getPublisherProfile() {
  cacheTag('publisher-profile')

  if (!supabase) {
    throw new Error(
      'Supabase is not properly configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    )
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .maybeSingle()

  if (profileError) {
    throw new Error(
      `Failed to fetch publisher profile: ${profileError.message}`
    )
  }

  if (!profileData) {
    throw new Error('Publisher profile not found')
  }

  return profileData
}
