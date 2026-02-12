'use server'

import { revalidateTag } from 'next/cache'
import { getPostVersion, rollbackToVersion } from '@/lib/posts'
import { invalidateCaches } from '@/lib/revalidate'

export async function rollbackAction(postId: string, versionId: string) {
  try {
    // Validate that the version belongs to the post
    const version = await getPostVersion(versionId)
    if (!version || version.post_id !== postId) {
      throw new Error(
        '指定されたバージョンは存在しないか、この投稿に属していません'
      )
    }

    await rollbackToVersion(postId, versionId)
    revalidateTag('posts', 'max')
    await invalidateCaches('posts')
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('不明なエラー')
  }
}
