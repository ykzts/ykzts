import { z } from 'zod'

/**
 * Shared Zod schema for post validation
 * Used in both create and update actions
 */
export const postSchema = z.object({
  content: z.string().optional(),
  excerpt: z
    .string()
    .trim()
    .max(1000, '抜粋は1000文字以内で入力してください')
    .optional(),
  published_at: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(1, 'スラッグは必須です')
    .max(256, 'スラッグは256文字以内で入力してください'),
  status: z.enum(['draft', 'scheduled', 'published']).optional(),
  tags: z.string().optional(),
  title: z
    .string()
    .trim()
    .min(1, 'タイトルは必須です')
    .max(256, 'タイトルは256文字以内で入力してください')
})

/**
 * Schema for post update with optional ID
 */
export const postUpdateSchema = postSchema.extend({
  change_summary: z
    .string()
    .trim()
    .max(500, '変更内容は500文字以内で入力してください')
    .optional(),
  id: z.string().uuid({ message: '無効なIDです' })
})
