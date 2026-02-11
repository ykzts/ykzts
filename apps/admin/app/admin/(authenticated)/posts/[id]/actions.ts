'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { deletePost, updatePost } from '@/lib/posts'

export type ActionState = {
  error?: string
} | null

// Zod schema for post validation
const postSchema = z.object({
  content: z.string().optional(),
  excerpt: z.string().trim().max(1000, '抜粋は1000文字以内で入力してください').optional(),
  id: z.string().uuid({ message: '無効なIDです' }),
  published_at: z.string().optional(),
  redirect_from: z.string().optional(),
  slug: z.string().trim().min(1, 'スラッグは必須です').max(256, 'スラッグは256文字以内で入力してください'),
  status: z.enum(['draft', 'scheduled', 'published']).optional(),
  tags: z.string().optional(),
  title: z.string().trim().min(1, 'タイトルは必須です').max(256, 'タイトルは256文字以内で入力してください')
})

export async function updatePostAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extract and validate FormData values with Zod
  const validation = postSchema.safeParse({
    content: formData.get('content'),
    excerpt: formData.get('excerpt') || undefined,
    id: formData.get('id'),
    published_at: formData.get('published_at') || undefined,
    redirect_from: formData.get('redirect_from') || undefined,
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
    // Parse JSON fields
    const content = validatedData.content
      ? JSON.parse(validatedData.content)
      : undefined
    const tags = validatedData.tags ? JSON.parse(validatedData.tags) : undefined
    const redirectFrom = validatedData.redirect_from
      ? JSON.parse(validatedData.redirect_from)
      : undefined

    await updatePost({
      changeSummary: 'Updated post',
      content,
      excerpt: validatedData.excerpt,
      postId: validatedData.id,
      publishedAt: validatedData.published_at,
      slug: validatedData.slug,
      status: validatedData.status,
      tags
    })

    // Handle redirect_from separately if needed (would require additional DB support)

    revalidateTag('posts')
  } catch (error) {
    return {
      error: `更新に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  redirect('/admin/posts')
}

export async function deletePostAction(id: string): Promise<void> {
  // Validate ID as UUID before querying the database
  const idValidation = z.string().uuid({ message: '無効なIDです' }).safeParse(id)

  if (!idValidation.success) {
    const firstError = idValidation.error.issues[0]
    throw new Error(firstError?.message ?? '無効なIDです')
  }

  try {
    await deletePost(idValidation.data)

    revalidateTag('posts')
    revalidateTag('counts')
  } catch (error) {
    throw new Error(
      `削除に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    )
  }

  redirect('/admin/posts')
}
