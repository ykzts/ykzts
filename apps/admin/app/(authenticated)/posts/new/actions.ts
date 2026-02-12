'use server'

import type { Json } from '@ykzts/supabase'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { createPost } from '@/lib/posts'
import { invalidateCaches } from '@/lib/revalidate'
import { postSchema } from '@/lib/validations'

export type ActionState = {
  error?: string
  success?: boolean
} | null

export async function createPostAction(
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

  const validation = postSchema.safeParse({
    content: formData.get('content'),
    excerpt: formData.get('excerpt') || undefined,
    published_at: publishedAt,
    slug: formData.get('slug'),
    status: formData.get('status') || 'draft',
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
    const content: Json =
      validatedData.content && validatedData.content !== ''
        ? JSON.parse(validatedData.content)
        : ([] as Json)
    const tags: string[] =
      validatedData.tags && validatedData.tags !== ''
        ? JSON.parse(validatedData.tags)
        : []

    await createPost({
      content,
      excerpt: validatedData.excerpt,
      publishedAt: validatedData.published_at,
      slug: validatedData.slug,
      status: validatedData.status as 'draft' | 'scheduled' | 'published',
      tags,
      title: validatedData.title
    })

    revalidateTag('posts', 'max')
    revalidateTag('counts', 'max')
    await invalidateCaches('posts')
  } catch (error) {
    return {
      error: `作成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  redirect('/posts')
}
