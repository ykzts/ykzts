import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'

// Validation schema for similar posts request
const similarRequestSchema = z.object({
  limit: z.number().min(1).max(20).optional().default(5),
  post_id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid post ID format'),
  threshold: z.number().min(0).max(1).optional().default(0.5)
})

// Type for similar posts result from database function
type SimilarPostResult = {
  excerpt: string | null
  id: string
  published_at: string
  similarity: number
  slug: string
  tags: string[] | null
  title: string
}

/**
 * GET /api/blog/similar
 * Get similar posts using vector embedding similarity
 *
 * Query parameters:
 * - post_id: UUID of the post to find similar posts for (required)
 * - limit: Number of results (1-20, default: 5)
 * - threshold: Minimum similarity score (0-1, default: 0.5)
 *
 * Example: /api/blog/similar?post_id=123e4567-e89b-12d3-a456-426614174000&limit=3&threshold=0.6
 *
 * Response:
 * {
 *   "results": [
 *     {
 *       "id": "uuid",
 *       "title": "Similar Post Title",
 *       "slug": "similar-post-slug",
 *       "excerpt": "Post excerpt",
 *       "published_at": "2024-01-01T00:00:00Z",
 *       "tags": ["tag1", "tag2"],
 *       "similarity": 0.75
 *     }
 *   ],
 *   "post_id": "123e4567-e89b-12d3-a456-426614174000",
 *   "count": 3
 * }
 */
export async function GET(request: NextRequest) {
  // Check if Supabase is configured
  if (!supabase) {
    return NextResponse.json(
      { error: 'Similar posts service not available' },
      { status: 503 }
    )
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams
  const rawParams = {
    limit: searchParams.get('limit')
      ? Number.parseInt(searchParams.get('limit') as string, 10)
      : undefined,
    post_id: searchParams.get('post_id'),
    threshold: searchParams.get('threshold')
      ? Number.parseFloat(searchParams.get('threshold') as string)
      : undefined
  }

  // Validate query parameters
  const validation = similarRequestSchema.safeParse(rawParams)

  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Invalid query parameters',
        issues: validation.error.issues
      },
      { status: 400 }
    )
  }

  const { limit, post_id, threshold } = validation.data

  try {
    // Call database function to get similar posts
    const { data, error } = await supabase.rpc('get_similar_posts', {
      match_count: limit,
      match_threshold: threshold,
      post_id
    })

    if (error) {
      console.error('Similar posts error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch similar posts' },
        { status: 500 }
      )
    }

    const results = (data as SimilarPostResult[]) || []

    return NextResponse.json({
      count: results.length,
      post_id,
      results
    })
  } catch (error) {
    console.error('Similar posts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch similar posts' },
      { status: 500 }
    )
  }
}
