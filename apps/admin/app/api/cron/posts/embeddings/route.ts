import type { Json } from '@ykzts/supabase'
import { NextResponse } from 'next/server'
import { generatePostEmbedding } from '@/lib/embeddings'
import { createClient } from '@/lib/supabase/server'

/**
 * Cron endpoint to generate embeddings for posts
 * Should be called periodically by Vercel Cron or similar service
 *
 * PUT /api/cron/posts/embeddings
 *
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
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
    const supabase = await createClient()

    // Query posts where embedding is outdated (timestamp-based comparison)
    // embedding_updated_at < updated_at means content changed after last embedding
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(
        `
        id,
        title,
        excerpt,
        updated_at,
        embedding_updated_at,
        current_version:post_versions!posts_current_version_id_fkey(content, updated_at)
      `
      )
      .or(
        'embedding.is.null,embedding_updated_at.is.null,embedding_updated_at.lt.updated_at'
      )
      .limit(10) // Process 10 posts per cron run to avoid timeouts

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
        const content =
          post.current_version && typeof post.current_version === 'object'
            ? (post.current_version as { content: Json }).content
            : null

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
