'use server'

import slugify from 'slugify'
import { createClient } from './supabase/server'

/**
 * Internal helper to generate a unique slug for a given table
 * Handles duplicate checking and auto-incrementing
 */
async function generateUniqueSlug(
  title: string,
  table: 'posts' | 'works',
  excludeId?: string
): Promise<string> {
  const baseSlug = slugify(title, {
    locale: 'ja',
    lower: true,
    strict: true,
    trim: true
  })

  if (!baseSlug) {
    throw new Error('スラッグを生成できませんでした')
  }

  const supabase = await createClient()

  // Check if base slug exists
  let query = supabase.from(table).select('slug').eq('slug', baseSlug).limit(1)

  // Exclude current item when editing
  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data: existing, error: existingError } = await query.maybeSingle()

  if (existingError) {
    throw new Error('スラッグの確認に失敗しました')
  }

  // If base slug is available, return it
  if (!existing) {
    return baseSlug
  }

  // Base slug exists, find the next available number
  // Fetch all slugs that match the pattern baseSlug-N to find the highest number
  let allSlugsQuery = supabase
    .from(table)
    .select('slug')
    .like('slug', `${baseSlug}-%`)

  if (excludeId) {
    allSlugsQuery = allSlugsQuery.neq('id', excludeId)
  }

  const { data: existingSlugs, error: slugsError } = await allSlugsQuery

  if (slugsError) {
    throw new Error('スラッグの確認に失敗しました')
  }

  // Extract numbers from existing slugs and find the next available
  const pattern = new RegExp(
    `^${baseSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)$`
  )
  const existingNumbers = new Set(
    (existingSlugs || [])
      .map((item) => {
        if (!item.slug) return null
        const match = item.slug.match(pattern)
        return match ? Number.parseInt(match[1], 10) : null
      })
      .filter((n): n is number => n !== null)
  )

  // Find the first available number starting from 2
  let nextNumber = 2
  while (existingNumbers.has(nextNumber) && nextNumber < 1000) {
    nextNumber++
  }

  if (nextNumber >= 1000) {
    // Fallback: use timestamp if we couldn't find a unique slug
    return `${baseSlug}-${Date.now()}`
  }

  return `${baseSlug}-${nextNumber}`
}

/**
 * Generate a unique slug for a post
 * If the generated slug exists, automatically increments with -2, -3, etc.
 */
export async function generateUniqueSlugForPost(
  title: string,
  excludePostId?: string
): Promise<string> {
  return generateUniqueSlug(title, 'posts', excludePostId)
}

/**
 * Generate a unique slug for a work
 * If the generated slug exists, automatically increments with -2, -3, etc.
 */
export async function generateUniqueSlugForWork(
  title: string,
  excludeWorkId?: string
): Promise<string> {
  return generateUniqueSlug(title, 'works', excludeWorkId)
}

/**
 * Smart slug generation using AI with fallback to traditional slugify
 * This is the recommended method for new implementations
 */
export async function generateSlugSmart(params: {
  title: string
  content: string
  table: 'posts' | 'works'
  excludeId?: string
}): Promise<string> {
  try {
    // Try AI-powered generation first
    const { generateSlugWithAI } = await import('./generate-slug-with-ai')
    return await generateSlugWithAI(params)
  } catch (error) {
    // Fallback to traditional slugify method
    console.error('AI slug generation failed, falling back to slugify:', error)
    return await generateUniqueSlug(
      params.title,
      params.table,
      params.excludeId
    )
  }
}
