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
  let counter = 2
  while (counter < 1000) {
    // Safety limit
    const candidateSlug = `${baseSlug}-${counter}`

    let checkQuery = supabase
      .from('posts')
      .select('slug')
      .eq('slug', candidateSlug)
      .limit(1)

    if (excludePostId) {
      checkQuery = checkQuery.neq('id', excludePostId)
    }

    const { data: existingSlug } = await checkQuery.maybeSingle()

    if (!existingSlug) {
      return candidateSlug
    }

    counter++
  }

  // Fallback: use timestamp if we couldn't find a unique slug
  return `${baseSlug}-${Date.now()}`
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
  let counter = 2
  while (counter < 1000) {
    // Safety limit
    const candidateSlug = `${baseSlug}-${counter}`

    let checkQuery = supabase
      .from('works')
      .select('slug')
      .eq('slug', candidateSlug)
      .limit(1)

    if (excludeWorkId) {
      checkQuery = checkQuery.neq('id', excludeWorkId)
    }

    const { data: existingSlug } = await checkQuery.maybeSingle()

    if (!existingSlug) {
      return candidateSlug
    }

    counter++
  }

  // Fallback: use timestamp if we couldn't find a unique slug
  return `${baseSlug}-${Date.now()}`
}
