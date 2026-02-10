import { createClient } from './supabase/server'

export async function getCurrentUser() {
  'use cache: private'

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  return user
}
