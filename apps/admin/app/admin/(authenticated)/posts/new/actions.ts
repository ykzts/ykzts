'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { createPost } from '@/lib/posts'
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
  const publishedAt = formData.get('published_at')
  
  const validation = postSchema.safeParse({
    content: formData.get('content'),
    excerpt: formData.get('excerpt') || undefined,
    published_at: publishedAt && publishedAt !== '' ? publishedAt : undefined,
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
    // Parse JSON fields
    const content = validatedData.content
      ? JSON.parse(validatedData.content)
      : { type: 'root', children: [] }
    const tags = validatedData.tags ? JSON.parse(validatedData.tags) : []

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
  } catch (error) {
    return {
      error: `作成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  redirect('/admin/posts')
}
