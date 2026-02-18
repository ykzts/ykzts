import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPostCountByYear, getPostsByYear } from '@/lib/supabase/posts'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const yearParam = searchParams.get('year')

  if (!yearParam) {
    return NextResponse.json(
      { error: 'Year parameter is required' },
      { status: 400 }
    )
  }

  const year = Number.parseInt(yearParam, 10)

  if (!Number.isFinite(year) || year < 1970 || year > 2100) {
    return NextResponse.json(
      { error: 'Invalid year parameter' },
      { status: 400 }
    )
  }

  const draft = await draftMode()
  const isDraft = draft.isEnabled

  try {
    const posts = await getPostsByYear(year, isDraft)
    const count = await getPostCountByYear(year, isDraft)

    return NextResponse.json({
      count,
      posts,
      year
    })
  } catch (error) {
    console.error('Failed to fetch year data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch year data' },
      { status: 500 }
    )
  }
}
