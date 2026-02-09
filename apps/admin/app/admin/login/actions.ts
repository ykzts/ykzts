'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')

  // Validate that both fields are present and are strings
  if (!email || typeof email !== 'string') {
    throw new Error('メールアドレスを入力してください')
  }

  if (!password || typeof password !== 'string') {
    throw new Error('パスワードを入力してください')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
