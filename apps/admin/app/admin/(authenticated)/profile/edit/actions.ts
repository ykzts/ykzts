'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const name = formData.get('name') as string
  const tagline = formData.get('tagline') as string
  const email = formData.get('email') as string
  const about = formData.get('about') as string

  // Validation
  if (!name || name.trim() === '') {
    return {
      error: '名前は必須項目です。'
    }
  }

  if (email && email.trim() !== '') {
    // Server-side email validation (HTML5 validation is also applied on the client)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return {
        error: 'メールアドレスの形式が正しくありません。'
      }
    }
  }

  try {
    const supabase = await createClient()

    // Get current profile to check if it exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .maybeSingle()

    const profileData = {
      about: about && about.trim() !== '' ? about : null,
      email: email && email.trim() !== '' ? email : null,
      name: name.trim(),
      tagline: tagline && tagline.trim() !== '' ? tagline : null
    }

    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', existingProfile.id)

      if (error) {
        return {
          error: `プロフィールの保存に失敗しました: ${error.message}`
        }
      }
    } else {
      // Insert new profile
      const { error } = await supabase.from('profiles').insert(profileData)

      if (error) {
        return {
          error: `プロフィールの保存に失敗しました: ${error.message}`
        }
      }
    }

    // Invalidate cache
    revalidateTag('profile', 'max')
  } catch (error) {
    return {
      error: `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  // Redirect to profile page
  redirect('/admin/profile')
}
