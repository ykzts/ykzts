'use server'

import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signInWithGitHub() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin')

  let baseOrigin = origin
  if (!baseOrigin) {
    const protocol = (headersList.get('x-forwarded-proto') ?? 'https')
      .split(',')[0]
      .trim()
    const host = headersList.get('host')
    if (!host) {
      throw new Error('Unable to determine origin for OAuth redirect')
    }
    baseOrigin = `${protocol}://${host}`
  }

  const redirectTo = `${baseOrigin}/auth/callback`
  const { data, error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo
    },
    provider: 'github'
  })

  if (error) {
    throw new Error(error.message)
  }

  return data.url ?? null
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { error: error.message }
  }

  revalidateTag('auth-user', 'max')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidateTag('auth-user', 'max')
  redirect('/login')
}
