'use server'

import type { Json } from '@ykzts/supabase'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getProfile } from '@/lib/data'
import { invalidateCaches } from '@/lib/revalidate'
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
  starts_at: z.iso.date('日付はYYYY-MM-DD形式で入力してください'),
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(256, 'タイトルは256文字以内で入力してください')
})

const workUrlSchema = z.object({
  label: z.string().min(1, 'ラベルは必須です'),
  url: z.string().url('有効なURLを入力してください')
})

export async function createWork(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extract and validate form data
  const rawData = {
    content: formData.get('content') ?? '',
    slug: formData.get('slug') ?? '',
    starts_at: formData.get('starts_at') ?? '',
    title: formData.get('title') ?? ''
  }

  const validation = workSchema.safeParse(rawData)

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
      // Check for unique constraint violation (PostgreSQL error code 23505)
      if (error.code === '23505') {
        return { error: 'このスラッグは既に使用されています' }
      }
      return { error: `作品の作成に失敗しました: ${error.message}` }
    }

    // Verify that a row was actually inserted
    if (!data) {
      return { error: '作品の作成に失敗しました' }
    }

    const workId = data.id

    // Insert work URLs
    if (workUrlInputs.length > 0) {
      const { error: urlsError } = await supabase.from('work_urls').insert(
        workUrlInputs.map((u, i) => ({
          label: u.label,
          sort_order: i,
          url: u.url,
          work_id: workId
        }))
      )

      if (urlsError) {
        return { error: `URLの追加に失敗しました: ${urlsError.message}` }
      }
    }

    // Insert work technologies
    if (selectedTechIds.length > 0) {
      const { error: techsError } = await supabase
        .from('work_technologies')
        .insert(
          selectedTechIds.map((techId) => ({
            technology_id: techId,
            work_id: workId
          }))
        )

      if (techsError) {
        return {
          error: `技術タグの追加に失敗しました: ${techsError.message}`
        }
      }
    }

    // Revalidate both works list and dashboard counts
    revalidateTag('works', 'max')
    revalidateTag('counts', 'max')
    await invalidateCaches('works')
  } catch (error) {
    return {
      error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  redirect('/works')
}
