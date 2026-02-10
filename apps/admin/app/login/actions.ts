'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signInWithGitHub() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')
  const redirectTo = `${origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo
    },
    provider: 'github'
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.url) {
    // OAuth redirects need to use window.location in client
    // For server actions, we return the URL for client-side handling
    return data.url
  }

  return null
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
