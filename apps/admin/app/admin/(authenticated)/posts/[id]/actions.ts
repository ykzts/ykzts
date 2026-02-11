'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { deletePost, updatePost } from '@/lib/posts'
import { postUpdateSchema } from '@/lib/validations'

export type ActionState = {
  error?: string
} | null

export async function updatePostAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extract and validate FormData values with Zod
  const validation = postUpdateSchema.safeParse({
    change_summary: formData.get('change_summary') || undefined,
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
      changeSummary: validatedData.change_summary || 'Updated post',
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
