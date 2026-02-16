'use server'

import slugify from 'slugify'
import { createClient } from './supabase/server'

/**
 * Generate a unique slug for a post
 * If the generated slug exists, automatically increments with -2, -3, etc.
 */
export async function generateUniqueSlugForPost(
  title: string,
  excludePostId?: string
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
  let query = supabase
    .from('posts')
    .select('slug')
    .eq('slug', baseSlug)
    .limit(1)

  // Exclude current post when editing
  if (excludePostId) {
    query = query.neq('id', excludePostId)
  }

  const { data: existingPost } = await query.maybeSingle()

  // If base slug is available, return it
  if (!existingPost) {
    return baseSlug
  }

  // Base slug exists, find the next available number
  // Fetch all slugs that match the pattern baseSlug-N to find the highest number
  let allSlugsQuery = supabase
    .from('posts')
    .select('slug')
    .like('slug', `${baseSlug}-%`)

  if (excludePostId) {
    allSlugsQuery = allSlugsQuery.neq('id', excludePostId)
  }

  const { data: existingSlugs } = await allSlugsQuery

  // Extract numbers from existing slugs and find the next available
  const existingNumbers = new Set(
    (existingSlugs || [])
      .map((item) => {
        if (!item.slug) return null
        const match = item.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`))
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
 * Generate a unique slug for a work
 * If the generated slug exists, automatically increments with -2, -3, etc.
 */
export async function generateUniqueSlugForWork(
  title: string,
  excludeWorkId?: string
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
  let query = supabase
    .from('works')
    .select('slug')
    .eq('slug', baseSlug)
    .limit(1)

  // Exclude current work when editing
  if (excludeWorkId) {
    query = query.neq('id', excludeWorkId)
  }

  const { data: existingWork } = await query.maybeSingle()

  // If base slug is available, return it
  if (!existingWork) {
    return baseSlug
  }

  // Base slug exists, find the next available number
  // Fetch all slugs that match the pattern baseSlug-N to find the highest number
  let allSlugsQuery = supabase
    .from('works')
    .select('slug')
    .like('slug', `${baseSlug}-%`)

  if (excludeWorkId) {
    allSlugsQuery = allSlugsQuery.neq('id', excludeWorkId)
  }

  const { data: existingSlugs } = await allSlugsQuery

  // Extract numbers from existing slugs and find the next available
  const existingNumbers = new Set(
    (existingSlugs || [])
      .map((item) => {
        if (!item.slug) return null
        const match = item.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`))
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
