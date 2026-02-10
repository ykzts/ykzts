'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Json } from '@ykzts/supabase'
import { z } from 'zod'
import { getProfile } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'

export type ActionState = {
  error?: string
  success?: boolean
} | null

// Zod schema for work validation
const workSchema = z.object({
  content: z
    .union([z.string(), z.instanceof(File), z.null()])
    .transform((val) => (typeof val === 'string' ? val.trim() : ''))
    .pipe(z.string().min(1, 'コンテンツは必須です')),
  slug: z
    .union([z.string(), z.instanceof(File), z.null()])
    .transform((val) => (typeof val === 'string' ? val.trim() : ''))
    .pipe(
      z
        .string()
        .min(1, 'スラッグは必須です')
        .regex(
          /^[a-z0-9-]+$/,
          'スラッグは小文字英数字とハイフンのみ使用できます'
        )
    ),
  starts_at: z
    .union([z.string(), z.instanceof(File), z.null()])
    .transform((val) => (typeof val === 'string' ? val.trim() : ''))
    .pipe(z.string().min(1, '開始日は必須です')),
  title: z
    .union([z.string(), z.instanceof(File), z.null()])
    .transform((val) => (typeof val === 'string' ? val.trim() : ''))
    .pipe(
      z
        .string()
        .min(1, 'タイトルは必須です')
        .max(256, 'タイトルは256文字以内で入力してください')
    )
})

export async function createWork(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Validate with Zod - pass FormData values directly
  const validation = workSchema.safeParse({
    content: formData.get('content'),
    slug: formData.get('slug'),
    starts_at: formData.get('starts_at'),
    title: formData.get('title')
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
    let contentJson: Json
    try {
      contentJson = JSON.parse(validatedData.content) as Json
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
    revalidateTag('works', 'max')
    revalidateTag('counts', 'max')
  } catch (error) {
    return {
      error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  redirect('/admin/works')
}
