'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type ActionState = {
  error?: string
} | null

// Zod schema for post validation
const postSchema = z.object({
  id: z.uuid('無効なIDです'),
  title: z
    .string()
    .trim()
    .max(256, 'タイトルは256文字以内で入力してください')
    .optional()
    .or(z.literal(''))
})

export async function updatePost(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extract and validate FormData values with Zod
  const validation = postSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title') ?? ''
  })

  if (!validation.success) {
    const firstError = validation.error.issues[0]
    return { error: firstError?.message ?? 'バリデーションエラー' }
  }

  const validatedData = validation.data

  try {
    const supabase = await createClient()

    // Update and return the updated row to verify success
    const { data, error } = await supabase
      .from('posts')
      .update({
        title: validatedData.title || null
      })
      .eq('id', validatedData.id)
      .select('id')
      .maybeSingle()

    if (error) {
      return { error: `更新に失敗しました: ${error.message}` }
    }

    // Verify that a row was actually updated
    if (!data) {
      return { error: '更新対象が存在しないか、権限がありません' }
    }

    revalidateTag('posts', 'max')
  } catch (error) {
    return {
      error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  redirect('/admin/posts')
}

export async function deletePost(id: string): Promise<void> {
  // Validate ID as UUID before querying the database
  const idValidation = z.uuid('無効なIDです').safeParse(id)

  if (!idValidation.success) {
    const firstError = idValidation.error.issues[0]
    throw new Error(firstError?.message ?? '無効なIDです')
  }

  const supabase = await createClient()

  // Delete and return the deleted row to verify success
  const { data, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', idValidation.data)
    .select('id')
    .maybeSingle()

  if (error) {
    throw new Error(`削除に失敗しました: ${error.message}`)
  }

  if (!data) {
    throw new Error('削除対象が存在しないか、権限がありません')
  }

  revalidateTag('posts', 'max')
  revalidateTag('counts', 'max')
  redirect('/admin/posts')
}
