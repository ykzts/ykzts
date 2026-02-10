import { cacheTag } from 'next/cache'
import { createClient } from './supabase/server'

export async function getCurrentUser() {
  'use cache: private'
  cacheTag('auth-user')

  const supabase = await createClient()
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(`Failed to fetch current user: ${error.message}`)
  }

  return user
}
