'use server'

import { draftMode } from 'next/headers'
import { getPostCountByYear, getPostsByYear } from '@/lib/supabase/posts'

export async function getYearData(year: number) {
  const draft = await draftMode()
  const isDraft = draft.isEnabled

  const posts = await getPostsByYear(year, isDraft)
  const count = await getPostCountByYear(year, isDraft)

  return {
    count,
    posts,
    year
  }
}
