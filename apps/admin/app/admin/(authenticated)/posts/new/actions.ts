'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getProfile } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'

export type ActionState = {
  error?: string
  success?: boolean
} | null

// Zod schema for post validation
const postSchema = z.object({
  title: z
    .string()
    .max(256, 'タイトルは256文字以内で入力してください')
    .optional()
})

export async function createPost(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extract FormData values
  const title = formData.get('title')

  // Check types - FormData.get() can return string | File | null
  if (title !== null && typeof title !== 'string') {
    return { error: '無効な入力データです' }
  }

  // Validate with Zod
  const validation = postSchema.safeParse({
    title: title?.trim() || undefined
  })

  if (!validation.success) {
    const firstError = validation.error.issues[0]
    return { error: firstError?.message ?? 'バリデーションエラー' }
  }

  const validatedData = validation.data

  // Get current user's profile ID
  let profileId: string
  try {
    const profile = await getProfile()
    if (!profile) {
      return { error: 'プロフィールが見つかりません' }
    }
    profileId = profile.id
  } catch (error) {
    return {
      error: `プロフィールの取得に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  try {
    const supabase = await createClient()

    // Insert new post
    const { data, error } = await supabase
      .from('posts')
      .insert({
        profile_id: profileId,
        title: validatedData.title || null
      })
      .select('id')
      .maybeSingle()

    if (error) {
      return { error: `投稿の作成に失敗しました: ${error.message}` }
    }

    // Verify that a row was actually inserted
    if (!data) {
      return { error: '投稿の作成に失敗しました' }
    }

    revalidateTag('posts', 'max')
  } catch (error) {
    return {
      error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  redirect('/admin/posts')
}
