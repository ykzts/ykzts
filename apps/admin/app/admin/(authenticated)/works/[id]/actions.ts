'use server'

import type { Json } from '@ykzts/supabase'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ActionState = {
  error?: string
  success?: boolean
} | null

export async function updateWork(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const startsAt = formData.get('starts_at') as string
  const content = formData.get('content') as string

  // Validation
  if (!title || !slug || !startsAt || !content) {
    return { error: 'すべてのフィールドを入力してください' }
  }

  if (title.length < 1 || title.length > 256) {
    return { error: 'タイトルは1〜256文字で入力してください' }
  }

  // Simple URL-safe validation
  if (!/^[a-zA-Z0-9\-_]+$/.test(slug)) {
    return {
      error: 'スラッグは英数字、ハイフン、アンダースコアのみ使用できます'
    }
  }

  // Parse content as JSON
  let contentJson: Json
  try {
    contentJson = JSON.parse(content) as Json
  } catch {
    return { error: 'コンテンツのフォーマットが正しくありません' }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('works')
      .update({
        content: contentJson,
        slug,
        starts_at: startsAt,
        title
      })
      .eq('id', id)

    if (error) {
      // Check for unique constraint violation on slug
      if (error.code === '23505') {
        return { error: 'このスラッグは既に使用されています' }
      }
      return { error: `更新に失敗しました: ${error.message}` }
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

  const { error } = await supabase.from('works').delete().eq('id', id)

  if (error) {
    throw new Error(`削除に失敗しました: ${error.message}`)
  }

  revalidateTag('works', 'max')
  redirect('/admin/works')
}
