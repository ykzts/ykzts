import { draftMode } from 'next/headers'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  // Verify secret token
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')

  if (!secret || secret !== process.env.DRAFT_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  if (!slug) {
    return NextResponse.json(
      { message: 'Missing slug parameter' },
      { status: 400 }
    )
  }

  // Use service role client to query draft posts (bypasses RLS)
  const client = supabaseAdmin ?? supabase

  if (!client) {
    // If Supabase is not configured, redirect to blog homepage
    return NextResponse.redirect(new URL('/blog', request.url))
  }

  // Enable draft mode
  const draft = await draftMode()
  draft.enable()

  try {
    const { data: post } = await client
      .from('posts')
      .select('slug, published_at')
      .eq('slug', slug)
      .maybeSingle()

    if (post?.published_at) {
      // Construct the full date-based URL
      const publishedDate = new Date(post.published_at)
      const year = String(publishedDate.getUTCFullYear())
      const month = String(publishedDate.getUTCMonth() + 1).padStart(2, '0')
      const day = String(publishedDate.getUTCDate()).padStart(2, '0')

      return NextResponse.redirect(
        new URL(`/blog/${year}/${month}/${day}/${slug}`, request.url)
      )
    }
  } catch (error) {
    console.error('Error fetching post for draft mode:', error)
  }

  // Fallback: redirect to blog homepage if post not found
  return NextResponse.redirect(new URL('/blog', request.url))
}
