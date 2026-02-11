'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createPost } from '@/lib/posts'

export type ActionState = {
  error?: string
  success?: boolean
} | null

// Zod schema for post creation validation
const createPostSchema = z.object({
  content: z.string().optional(),
  excerpt: z.string().trim().max(1000, '抜粋は1000文字以内で入力してください').optional(),
  published_at: z.string().optional(),
  slug: z.string().trim().min(1, 'スラッグは必須です').max(256, 'スラッグは256文字以内で入力してください'),
  status: z.enum(['draft', 'scheduled', 'published']).optional(),
  tags: z.string().optional(),
  title: z.string().trim().min(1, 'タイトルは必須です').max(256, 'タイトルは256文字以内で入力してください')
})

export async function createPostAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extract and validate FormData values with Zod
  const validation = createPostSchema.safeParse({
    content: formData.get('content'),
    excerpt: formData.get('excerpt') || undefined,
    published_at: formData.get('published_at') || undefined,
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

    revalidateTag('posts')
    revalidateTag('counts')
  } catch (error) {
    return {
      error: `作成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  redirect('/admin/posts')
}
