'use server'

import { revalidateTag } from 'next/cache'
import { rollbackToVersion } from '@/lib/posts'

export async function rollbackAction(postId: string, versionId: string) {
  try {
    await rollbackToVersion(postId, versionId)
    revalidateTag('posts', 'max')
  } catch (error) {
    throw new Error(
      `ロールバックに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    )
  }
}
