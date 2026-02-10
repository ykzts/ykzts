'use server'

import type { Json } from '@ykzts/supabase'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type ActionState = {
  error?: string
  success?: boolean
} | null

// Zod schema for work validation
const workSchema = z.object({
  content: z.string().min(1, 'コンテンツは必須です'),
  id: z.string().uuid('無効なIDです'),
  slug: z
    .string()
    .min(1, 'スラッグは必須です')
    .regex(
      /^[a-zA-Z0-9\-_]+$/,
      'スラッグは英数字、ハイフン、アンダースコアのみ使用できます'
    ),
  starts_at: z.string().min(1, '開始日は必須です'),
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(256, 'タイトルは256文字以内で入力してください')
})

export async function updateWork(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extract and validate FormData values
  const id = formData.get('id')
  const title = formData.get('title')
  const slug = formData.get('slug')
  const startsAt = formData.get('starts_at')
  const content = formData.get('content')

  // Check types - FormData.get() can return string | File | null
  if (
    typeof id !== 'string' ||
    typeof title !== 'string' ||
    typeof slug !== 'string' ||
    typeof startsAt !== 'string' ||
    typeof content !== 'string'
  ) {
    return { error: '無効な入力データです' }
  }

  // Validate with Zod
  const validation = workSchema.safeParse({
    content,
    id,
    slug: slug.trim(),
    starts_at: startsAt,
    title: title.trim()
  })

  if (!validation.success) {
    const firstError = validation.error.issues[0]
    return { error: firstError?.message ?? 'バリデーションエラー' }
  }

  const validatedData = validation.data

  // Parse content as JSON
  let contentJson: Json
  try {
    contentJson = JSON.parse(validatedData.content) as Json
  } catch {
    return { error: 'コンテンツのフォーマットが正しくありません' }
  }

  try {
    const supabase = await createClient()

    // Update and return the updated row to verify success
    const { data, error } = await supabase
      .from('works')
      .update({
        content: contentJson,
        slug: validatedData.slug,
        starts_at: validatedData.starts_at,
        title: validatedData.title
      })
      .eq('id', validatedData.id)
      .select('id')
      .maybeSingle()

    if (error) {
      // Check for unique constraint violation on slug
      if (error.code === '23505') {
        return { error: 'このスラッグは既に使用されています' }
      }
      return { error: `更新に失敗しました: ${error.message}` }
    }

    // Verify that a row was actually updated
    if (!data) {
      return { error: '更新対象が存在しないか、権限がありません' }
    }

    revalidateTag('works', 'max')
  } catch (error) {
    return {
      error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  redirect('/admin/works')
}

export async function deleteWork(id: string): Promise<void> {
  const supabase = await createClient()

  // Delete and return the deleted row to verify success
  const { data, error } = await supabase
    .from('works')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) {
    throw new Error(`削除に失敗しました: ${error.message}`)
  }

  if (!data) {
    throw new Error('削除対象が存在しないか、権限がありません')
  }

  revalidateTag('works', 'max')
  redirect('/admin/works')
}
