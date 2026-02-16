import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateSearchEmbedding } from '@/lib/embeddings'
import { supabase } from '@/lib/supabase/client'

// Validation schema for search request
const searchRequestSchema = z.object({
  query: z.string().min(1, 'Search query must not be empty'),
  limit: z.number().min(1).max(20).optional().default(5),
  threshold: z.number().min(0).max(1).optional().default(0.78)
})

// Type for search result from database function
type SearchResult = {
  excerpt: string | null
  id: string
  published_at: string
  similarity: number
  slug: string
  tags: string[] | null
  title: string
}

/**
 * POST /api/blog/search
 * Semantic search endpoint for blog posts using vector embeddings
 *
 * Request body:
 * {
 *   "query": "search query text",
 *   "limit": 5,        // Optional: number of results (1-20, default: 5)
 *   "threshold": 0.78  // Optional: minimum similarity score (0-1, default: 0.78)
 * }
 *
 * Response:
 * {
 *   "results": [
 *     {
 *       "id": "uuid",
 *       "title": "Post Title",
 *       "slug": "post-slug",
 *       "excerpt": "Post excerpt",
 *       "published_at": "2024-01-01T00:00:00Z",
 *       "tags": ["tag1", "tag2"],
 *       "similarity": 0.85
 *     }
 *   ],
 *   "query": "search query text",
 *   "count": 5
 * }
 */
export async function POST(request: NextRequest) {
  // Check if Supabase is configured
  if (!supabase) {
    return NextResponse.json(
      { error: 'Search service not available' },
      { status: 503 }
    )
  }

  // Parse request body
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate request body
  const validation = searchRequestSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Invalid request body',
        issues: validation.error.issues
      },
      { status: 400 }
    )
  }

  const { limit, query, threshold } = validation.data

  try {
    // Generate embedding for search query
    const queryEmbedding = await generateSearchEmbedding(query)

    // Call database function to search for similar posts
    const { data, error } = await supabase.rpc('search_posts_by_embedding', {
      match_count: limit,
      match_threshold: threshold,
      query_embedding: JSON.stringify(queryEmbedding)
    })

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    const results = (data as SearchResult[]) || []

    return NextResponse.json({
      count: results.length,
      query,
      results
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Search failed'
      },
      { status: 500 }
    )
  }
}