'use server'

import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signInWithGitHub() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin')

  // Prevent invalid redirect URL if origin is missing
  if (!origin) {
    // Fallback: construct from protocol and host headers
    const protocol = headersList.get('x-forwarded-proto') ?? 'https'
    const host = headersList.get('host')
    if (!host) {
      throw new Error('Unable to determine origin for OAuth redirect')
    }
    const safeOrigin = `${protocol}://${host}`
    const redirectTo = `${safeOrigin}/auth/callback`

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
      return data.url
    }

    return null
  }

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
  revalidateTag('auth-user')
  redirect('/login')
}
