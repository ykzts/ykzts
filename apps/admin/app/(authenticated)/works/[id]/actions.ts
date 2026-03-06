'use server'

import { createServerClient } from '@ykzts/supabase/server'
import type { Json } from '@ykzts/supabase/types'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { invalidateCaches } from '@/lib/revalidate'

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

const workUrlSchema = z.object({
  label: z.string().min(1, 'ラベルは必須です'),
  url: z.string().url('有効なURLを入力してください')
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

  // Parse work URLs
  const workUrlsCountStr = formData.get('work_urls_count')
  const workUrlsCount =
    typeof workUrlsCountStr === 'string'
      ? Number.parseInt(workUrlsCountStr, 10)
      : 0

  if (Number.isNaN(workUrlsCount) || workUrlsCount < 0 || workUrlsCount > 50) {
    return { error: 'URLの件数が不正です' }
  }

  type WorkUrlInput = { label: string; url: string }
  const workUrlInputs: WorkUrlInput[] = []

  for (let i = 0; i < workUrlsCount; i++) {
    const label = formData.get(`work_url_label_${i}`)
    const url = formData.get(`work_url_url_${i}`)

    if (typeof label !== 'string' || typeof url !== 'string') continue
    if (!label.trim() && !url.trim()) continue

    const urlValidation = workUrlSchema.safeParse({
      label: label.trim(),
      url: url.trim()
    })

    if (!urlValidation.success) {
      return {
        error: `URL #${i + 1}: ${urlValidation.error.issues[0]?.message}`
      }
    }

    workUrlInputs.push({ label: label.trim(), url: url.trim() })
  }

  // Parse selected technology IDs
  const selectedTechIds = formData
    .getAll('work_technology_id')
    .filter((v): v is string => typeof v === 'string' && v.trim() !== '')

  // Parse content as JSON
  let contentJson: Json
  try {
    contentJson = JSON.parse(validatedData.content) as Json
  } catch {
    return { error: 'コンテンツのフォーマットが正しくありません' }
  }

  try {
    const supabase = await createServerClient()

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

    const workId = validatedData.id

    // Sync work URLs: delete all existing, then reinsert
    const { error: deleteUrlsError } = await supabase
      .from('work_urls')
      .delete()
      .eq('work_id', workId)

    if (deleteUrlsError) {
      return {
        error: `URLの更新に失敗しました: ${deleteUrlsError.message}`
      }
    }

    if (workUrlInputs.length > 0) {
      const { error: insertUrlsError } = await supabase
        .from('work_urls')
        .insert(
          workUrlInputs.map((u, i) => ({
            label: u.label,
            sort_order: i,
            url: u.url,
            work_id: workId
          }))
        )

      if (insertUrlsError) {
        return {
          error: `URLの更新に失敗しました: ${insertUrlsError.message}`
        }
      }
    }

    // Sync work technologies: delete all then reinsert
    const { error: deleteTechsError } = await supabase
      .from('work_technologies')
      .delete()
      .eq('work_id', workId)

    if (deleteTechsError) {
      return {
        error: `技術タグの更新に失敗しました: ${deleteTechsError.message}`
      }
    }

    if (selectedTechIds.length > 0) {
      const { error: insertTechsError } = await supabase
        .from('work_technologies')
        .insert(
          selectedTechIds.map((techId) => ({
            technology_id: techId,
            work_id: workId
          }))
        )

      if (insertTechsError) {
        return {
          error: `技術タグの更新に失敗しました: ${insertTechsError.message}`
        }
      }
    }

    revalidateTag('works', 'max')
    await invalidateCaches('works')
  } catch (error) {
    return {
      error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  redirect('/works')
}

export async function deleteWork(id: string): Promise<void> {
  const supabase = await createServerClient()

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
  await invalidateCaches('works')
  redirect('/works')
}
