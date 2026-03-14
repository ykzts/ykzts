import { createServerClient } from '@ykzts/supabase/server'
import { cacheTag } from 'next/cache'

export async function getCurrentUser() {
  'use cache: private'
  cacheTag('auth-user')

  const supabase = await createServerClient()
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  // Auth session missing is not an error, just means user is not logged in
  if (error && error.message !== 'Auth session missing!') {
    throw new Error(`Failed to fetch current user: ${error.message}`)
  }

  return user
}

export async function getOwnerProfile() {
  'use cache: private'
  cacheTag('auth-user')

  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const supabase = await createServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  return data
}
