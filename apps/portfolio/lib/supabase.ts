import { createClient } from '@supabase/supabase-js'
import type { Database } from '@ykzts/supabase'
import { cacheTag } from 'next/cache'
import { isPortableTextValue } from '@/lib/portable-text'

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null

export async function getProfile() {
  'use cache'

  cacheTag('profile')

  if (!supabase) {
    throw new Error(
      'Supabase is not properly configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    )
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select(
      `
        id,
        name,
        tagline,
        about,
        email,
        avatar_url,
        social_links(url, service),
        technologies(name)
      `
    )
    .maybeSingle()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  if (!profileData) {
    throw new Error('Profile not found')
  }

  const about = isPortableTextValue(profileData.about)
    ? profileData.about
    : null

  return {
    ...profileData,
    about
  }
}

export async function getWorks() {
  'use cache'

  cacheTag('works')

  if (!supabase) {
    throw new Error(
      'Supabase is not properly configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    )
  }

  const { data, error } = await supabase
    .from('works')
    .select('content, slug, title, starts_at')
    .order('starts_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch works: ${error.message}`)
  }

  return data.map((work) => ({
    ...work,
    content: isPortableTextValue(work.content) ? work.content : null
  }))
}
