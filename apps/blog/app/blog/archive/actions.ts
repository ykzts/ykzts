'use server'

import { getPostCountByYear, getPostsByYear } from '@/lib/supabase/posts'

export async function getYearData(year: number) {
  const posts = await getPostsByYear(year)
  const count = await getPostCountByYear(year)

  return {
    count,
    posts,
    year
  }
}
