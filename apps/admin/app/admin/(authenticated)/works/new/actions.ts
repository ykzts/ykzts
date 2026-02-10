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

// Zod schema for work validation
const workSchema = z.object({
  content: z.string().min(1, 'コンテンツは必須です'),
  slug: z
    .string()
    .min(1, 'スラッグは必須です')
    .regex(/^[a-z0-9-]+$/, 'スラッグは小文字英数字とハイフンのみ使用できます'),
  starts_at: z.string().min(1, '開始日は必須です'),
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(256, 'タイトルは256文字以内で入力してください')
})

export async function createWork(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extract FormData values
  const title = formData.get('title')
  const slug = formData.get('slug')
  const starts_at = formData.get('starts_at')
  const content = formData.get('content')

  // Check types - FormData.get() can return string | File | null
  if (title !== null && typeof title !== 'string') {
    return { error: '無効な入力データです' }
  }
  if (slug !== null && typeof slug !== 'string') {
    return { error: '無効な入力データです' }
  }
  if (starts_at !== null && typeof starts_at !== 'string') {
    return { error: '無効な入力データです' }
  }
  if (content !== null && typeof content !== 'string') {
    return { error: '無効な入力データです' }
  }

  // Validate with Zod
  const validation = workSchema.safeParse({
    content: content?.trim() || '',
    slug: slug?.trim() || '',
    starts_at: starts_at?.trim() || '',
    title: title?.trim() || ''
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

    // Parse content as JSON for Portable Text format
    let contentJson: unknown
    try {
      contentJson = JSON.parse(validatedData.content)
    } catch {
      return { error: 'コンテンツのJSON形式が無効です' }
    }

    // Insert new work
    const { data, error } = await supabase
      .from('works')
      .insert({
        content: contentJson,
        profile_id: profileId,
        slug: validatedData.slug,
        starts_at: validatedData.starts_at,
        title: validatedData.title
      })
      .select('id')
      .maybeSingle()

    if (error) {
      // Check for unique constraint violation on slug
      if (error.code === '23505' && error.message.includes('slug')) {
        return { error: 'このスラッグは既に使用されています' }
      }
      return { error: `作品の作成に失敗しました: ${error.message}` }
    }

    // Verify that a row was actually inserted
    if (!data) {
      return { error: '作品の作成に失敗しました' }
    }

    // Revalidate both works list and dashboard counts
    revalidateTag('works')
    revalidateTag('counts')
  } catch (error) {
    return {
      error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  redirect('/admin/works')
}
