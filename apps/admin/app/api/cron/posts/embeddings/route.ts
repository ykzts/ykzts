import type { Json } from '@ykzts/supabase'
import { NextResponse } from 'next/server'
import { generatePostEmbedding } from '@/lib/embeddings'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

/**
 * Extract content from current_version returned by database function
 * The function returns a JSONB object with content and updated_at
 */
function extractVersionContent(currentVersion: unknown): Json | null {
  if (!currentVersion || typeof currentVersion !== 'object') {
    return null
  }

  const version = currentVersion as { content?: Json }
  return version?.content ?? null
}

/**
 * Cron endpoint to generate embeddings for posts
 * Should be called periodically by Vercel Cron or similar service
 *
 * GET /api/cron/posts/embeddings (default for Vercel Cron)
 * POST /api/cron/posts/embeddings
 * PUT /api/cron/posts/embeddings
 *
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  return handleCronRequest(request)
}

export async function PUT(request: Request) {
  return handleCronRequest(request)
}

export async function POST(request: Request) {
  return handleCronRequest(request)
}

async function handleCronRequest(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Use service role client to bypass RLS for system operations
    const supabase = createServiceRoleClient()

    // Use RPC function to query posts needing embeddings
    // This function handles column-to-column timestamp comparison on the database side
    // (PostgREST query builder cannot compare columns directly)
    const { data: posts, error: postsError } = await supabase.rpc(
      'get_posts_needing_embeddings',
      { batch_size: 10 }
    )

    if (postsError) {
      throw new Error(`Failed to fetch posts: ${postsError.message}`)
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        message: 'No posts need embedding updates',
        processed: 0
      })
    }

    let successCount = 0
    let failureCount = 0
    const errors: Array<{ id: string; error: string }> = []

    // Process each post
    for (const post of posts) {
      try {
        // Extract content from current version
        const content = extractVersionContent(post.current_version)

        if (!content) {
          errors.push({ error: 'No content found', id: post.id })
          failureCount++
          continue
        }

        // Generate embedding
        const embedding = await generatePostEmbedding({
          content,
          excerpt: post.excerpt,
          title: post.title ?? ''
        })

        // Update post with embedding and set timestamp
        // Don't set updated_at explicitly - the trigger will preserve it
        // automatically when only embedding columns change
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            embedding: JSON.stringify(embedding),
            embedding_updated_at: new Date().toISOString()
          })
          .eq('id', post.id)

        if (updateError) {
          errors.push({ error: updateError.message, id: post.id })
          failureCount++
        } else {
          successCount++
        }
      } catch (error) {
        errors.push({
          error: error instanceof Error ? error.message : 'Unknown error',
          id: post.id
        })
        failureCount++
      }
    }

    return NextResponse.json({
      errors: errors.length > 0 ? errors : undefined,
      failureCount,
      message: 'Embedding generation completed',
      processed: posts.length,
      successCount
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Embedding generation failed'
      },
      { status: 500 }
    )
  }
}
