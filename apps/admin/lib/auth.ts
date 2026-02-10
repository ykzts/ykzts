'use server'

import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}
