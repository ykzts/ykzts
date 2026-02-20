'use server'

import { createClient } from './supabase/server'

/**
 * Get all unique tags used across all posts
 */
export async function getAllExistingTags(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('tags')
    .not('tags', 'is', null)

  if (error) {
    console.error('Failed to fetch existing tags:', error)
    return []
  }

  const allTags = new Set<string>()
  for (const row of data ?? []) {
    if (row.tags) {
      for (const tag of row.tags) {
        allTags.add(tag)
      }
    }
  }

  return [...allTags].sort()
}
