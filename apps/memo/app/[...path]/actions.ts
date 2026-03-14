'use server'

import { createServerClient } from '@ykzts/supabase/server'
import type { Json } from '@ykzts/supabase/types'
import { revalidatePath } from 'next/cache'
import { getOwnerProfile } from '@/lib/auth'

export type UpdateMemoState = {
  error?: string
  success?: boolean
} | null

export async function updateMemo(
  _prevState: UpdateMemoState,
  formData: FormData
): Promise<UpdateMemoState> {
  const ownerProfile = await getOwnerProfile()
  if (!ownerProfile) {
    return { error: '認証が必要です' }
  }

  const memoId = formData.get('memoId')
  const title = formData.get('title')
  const content = formData.get('content')
  const visibility = formData.get('visibility')
  const memoPath = formData.get('memoPath')

  if (
    typeof memoId !== 'string' ||
    !memoId ||
    typeof title !== 'string' ||
    !title.trim() ||
    typeof content !== 'string' ||
    !content ||
    typeof visibility !== 'string' ||
    !['public', 'private'].includes(visibility) ||
    typeof memoPath !== 'string' ||
    !memoPath
  ) {
    return { error: '入力値が正しくありません' }
  }

  let contentJson: Json
  try {
    contentJson = JSON.parse(content) as Json
  } catch {
    return { error: 'コンテンツのフォーマットが正しくありません' }
  }

  const supabase = await createServerClient()

  // Verify ownership
  const { data: memo, error: memoError } = await supabase
    .from('memos')
    .select('id, profile_id')
    .eq('id', memoId)
    .eq('profile_id', ownerProfile.id)
    .maybeSingle()

  if (memoError) {
    return { error: `メモの取得に失敗しました: ${memoError.message}` }
  }

  if (!memo) {
    return { error: 'メモが見つかりません' }
  }

  // Create new version
  const { data: version, error: versionError } = await supabase
    .from('memo_versions')
    .insert({ content: contentJson, memo_id: memoId, title: title.trim() })
    .select('id')
    .single()

  if (versionError || !version) {
    return {
      error: `バージョンの作成に失敗しました: ${versionError?.message ?? '不明なエラー'}`
    }
  }

  // Update memo with new version and visibility
  const { error: updateError } = await supabase
    .from('memos')
    .update({
      current_version_id: version.id,
      updated_at: new Date().toISOString(),
      visibility
    })
    .eq('id', memoId)

  if (updateError) {
    return { error: `メモの更新に失敗しました: ${updateError.message}` }
  }

  revalidatePath(`/${memoPath}`)

  return { success: true }
}
