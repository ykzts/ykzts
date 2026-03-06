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
