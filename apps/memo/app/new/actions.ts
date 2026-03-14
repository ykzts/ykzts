'use server'

import { createServerClient } from '@ykzts/supabase/server'
import type { Json } from '@ykzts/supabase/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getOwnerProfile } from '@/lib/auth'

export type CreateMemoState = {
  error?: string
} | null

export async function createMemo(
  _prevState: CreateMemoState,
  formData: FormData
): Promise<CreateMemoState> {
  const ownerProfile = await getOwnerProfile()
  if (!ownerProfile) {
    return { error: '認証が必要です' }
  }

  const path = formData.get('path')
  const title = formData.get('title')
  const content = formData.get('content')
  const visibility = formData.get('visibility')

  if (
    typeof path !== 'string' ||
    !path.trim() ||
    typeof title !== 'string' ||
    !title.trim() ||
    typeof content !== 'string' ||
    !content ||
    typeof visibility !== 'string' ||
    !['public', 'private'].includes(visibility)
  ) {
    return { error: '入力値が正しくありません' }
  }

  // Validate path format: alphanumeric, hyphens, underscores, and forward slashes
  const normalizedPath = path.trim().replace(/^\/+|\/+$/g, '')
  if (!/^[a-zA-Z0-9\-_/]+$/.test(normalizedPath)) {
    return {
      error:
        'パスは英数字、ハイフン、アンダースコア、スラッシュのみ使用できます'
    }
  }

  // Reject paths that collide with static routes
  const reservedPaths = ['api', 'auth', 'login', 'new']
  const firstSegment = normalizedPath.split('/')[0]
  if (reservedPaths.includes(firstSegment)) {
    return {
      error: `"${firstSegment}" はシステムで予約されているため、パスに使用できません`
    }
  }

  let contentJson: Json
  try {
    contentJson = JSON.parse(content) as Json
  } catch {
    return { error: 'コンテンツのフォーマットが正しくありません' }
  }

  const supabase = await createServerClient()

  // Check path uniqueness
  const { data: existing, error: existingError } = await supabase
    .from('memos')
    .select('id')
    .eq('path', normalizedPath)
    .maybeSingle()

  if (existingError) {
    console.error('Failed to check memo path uniqueness:', existingError)
    return { error: 'パスの確認に失敗しました' }
  }

  if (existing) {
    return { error: 'そのパスは既に使用されています' }
  }

  // Step 1: Create memo without current_version_id
  const { data: memo, error: memoError } = await supabase
    .from('memos')
    .insert({
      path: normalizedPath,
      profile_id: ownerProfile.id,
      visibility
    })
    .select('id')
    .single()

  if (memoError || !memo) {
    console.error('Failed to create memo:', memoError)
    return {
      error: 'メモの作成に失敗しました'
    }
  }

  // Step 2: Create the version with correct memo_id
  const { data: version, error: versionError } = await supabase
    .from('memo_versions')
    .insert({ content: contentJson, memo_id: memo.id, title: title.trim() })
    .select('id')
    .single()

  if (versionError || !version) {
    const { error: cleanupError } = await supabase
      .from('memos')
      .delete()
      .eq('id', memo.id)
    if (cleanupError) {
      console.error(
        'Failed to clean up memo after version creation failure:',
        cleanupError
      )
    }
    console.error('Failed to create memo version:', versionError)
    return {
      error: 'バージョンの作成に失敗しました'
    }
  }

  // Step 3: Set current_version_id on the memo
  const { error: updateError } = await supabase
    .from('memos')
    .update({ current_version_id: version.id })
    .eq('id', memo.id)

  if (updateError) {
    const { error: cleanupError } = await supabase
      .from('memos')
      .delete()
      .eq('id', memo.id)
    if (cleanupError) {
      console.error(
        'Failed to clean up memo after update failure:',
        cleanupError
      )
    }
    console.error('Failed to update memo current version:', updateError)
    return {
      error: 'メモの更新に失敗しました'
    }
  }

  revalidatePath('/')
  revalidatePath(`/${normalizedPath}`)

  redirect(`/${normalizedPath}`)
}
