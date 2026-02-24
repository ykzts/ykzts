'use server'

import type { Json } from '@ykzts/supabase'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { deletePost, updatePost } from '@/lib/posts'
import { invalidateCaches } from '@/lib/revalidate'
import { postUpdateSchema } from '@/lib/validations'

export type ActionState = {
  error?: string
} | null

export async function updatePostAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extract and validate FormData values with Zod
  const publishedAtRaw = formData.get('published_at')

  // Transform datetime-local format to ISO 8601
  let publishedAt: string | undefined
  if (publishedAtRaw && publishedAtRaw !== '') {
    try {
      publishedAt = new Date(publishedAtRaw.toString()).toISOString()
    } catch {
      return { error: '無効な公開日時形式です' }
    }
  }

  const excerptValue = formData.get('excerpt')
  const validation = postUpdateSchema.safeParse({
    change_summary: formData.get('change_summary') || undefined,
    content: formData.get('content'),
    // Pass empty string for empty excerpt (to trigger auto-generation)
    // Pass undefined only if excerpt field is not present (to preserve existing)
    excerpt: excerptValue === null ? undefined : excerptValue || '',
    id: formData.get('id'),
    published_at: publishedAt,
    slug: formData.get('slug'),
    status: formData.get('status') || undefined,
    tags: formData.get('tags') || undefined,
    title: formData.get('title')
  })

  if (!validation.success) {
    const firstError = validation.error.issues[0]
    return { error: firstError?.message ?? 'バリデーションエラー' }
  }

  const validatedData = validation.data

  try {
    // Parse JSON fields with error handling
    let content: Json | undefined
    let tags: string[] | undefined

    if (validatedData.content) {
      try {
        content = JSON.parse(validatedData.content) as Json
      } catch (_error) {
        return { error: 'コンテンツのJSON形式が不正です' }
      }
    }

    if (validatedData.tags) {
      try {
        tags = JSON.parse(validatedData.tags) as string[]
      } catch (_error) {
        return { error: 'タグのJSON形式が不正です' }
      }
    }

    await updatePost({
      changeSummary: validatedData.change_summary || '投稿を更新',
      content,
      excerpt: validatedData.excerpt,
      postId: validatedData.id,
      publishedAt: validatedData.published_at,
      slug: validatedData.slug,
      status: validatedData.status,
      tags,
      title: validatedData.title
    })

    revalidateTag('posts', 'max')
    await invalidateCaches('posts')
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : '不明なエラー'
    }
  }

  redirect('/posts')
}

export async function deletePostAction(id: string): Promise<void> {
  // Validate ID as UUID before querying the database
  const idValidation = z
    .string()
    .uuid({ message: '無効なIDです' })
    .safeParse(id)

  if (!idValidation.success) {
    const firstError = idValidation.error.issues[0]
    throw new Error(firstError?.message ?? '無効なIDです')
  }

  try {
    await deletePost(idValidation.data)

    revalidateTag('posts', 'max')
    revalidateTag('counts', 'max')
    await invalidateCaches('posts')
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('不明なエラー')
  }

  redirect('/posts')
}
