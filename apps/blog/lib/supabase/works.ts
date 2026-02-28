'use cache'

import { cacheTag } from 'next/cache'
import { supabase } from './client'

export async function getWorks() {
  cacheTag('works')

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('works')
    .select('slug')
    .order('starts_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch works: ${error.message}`)
  }

  return data
}
