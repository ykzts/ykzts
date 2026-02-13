import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  // Verify Vercel Cron Secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  if (!supabase) {
    return NextResponse.json(
      { message: 'Supabase not configured' },
      { status: 500 }
    )
  }

  try {
    // Find scheduled posts that should be published now
    const now = new Date().toISOString()
    const { data: scheduledPosts, error: queryError } = await supabase
      .from('posts')
      .select('id, slug, title')
      .eq('status', 'scheduled')
      .lte('published_at', now)

    if (queryError) {
      throw queryError
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return NextResponse.json({
        message: 'No posts to publish',
        publishedCount: 0
      })
    }

    // Update posts to published status
    const postIds = scheduledPosts.map((post) => post.id)
    const { error: updateError } = await supabase
      .from('posts')
      .update({ status: 'published' })
      .in('id', postIds)

    if (updateError) {
      throw updateError
    }

    // Invalidate cache
    revalidateTag('posts', 'max')

    return NextResponse.json({
      message: `Published ${scheduledPosts.length} post(s)`,
      posts: scheduledPosts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title
      })),
      publishedCount: scheduledPosts.length
    })
  } catch (error) {
    console.error('Error publishing scheduled posts:', error)
    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Unknown error'
    return NextResponse.json(
      {
        error: errorMessage,
        message: 'Failed to publish scheduled posts'
      },
      { status: 500 }
    )
  }
}
