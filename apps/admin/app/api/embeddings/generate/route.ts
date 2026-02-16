import type { Json } from '@ykzts/supabase'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { generatePostEmbedding } from '@/lib/embeddings'
import { createClient } from '@/lib/supabase/server'

/**
 * API endpoint to generate embeddings for posts
 * POST /api/embeddings/generate
 *
 * Request body:
 * - postId (optional): Generate embedding for specific post
 * - all (optional): Generate embeddings for all posts without embeddings
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '認証されていません' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get user's profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: 'プロフィールが見つかりません' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { postId, all } = body

    let postsToProcess: Array<{
      content: Json
      excerpt: string | null
      id: string
      title: string
    }> = []

    if (postId) {
      // Generate embedding for specific post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select(
          `
          id,
          title,
          excerpt,
          profile_id,
          current_version:post_versions!posts_current_version_id_fkey(content)
        `
        )
        .eq('id', postId)
        .eq('profile_id', profileData.id)
        .maybeSingle()

      if (postError || !post) {
        return NextResponse.json(
          { error: '投稿が見つかりません' },
          { status: 404 }
        )
      }

      // Extract content from current version
      const content =
        post.current_version && typeof post.current_version === 'object'
          ? (post.current_version as { content: Json }).content
          : null

      if (!content) {
        return NextResponse.json(
          { error: 'コンテンツが見つかりません' },
          { status: 400 }
        )
      }

      postsToProcess.push({
        content,
        excerpt: post.excerpt,
        id: post.id,
        title: post.title ?? ''
      })
    } else if (all) {
      // Generate embeddings for all posts without embeddings
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(
          `
          id,
          title,
          excerpt,
          embedding,
          current_version:post_versions!posts_current_version_id_fkey(content)
        `
        )
        .eq('profile_id', profileData.id)
        .is('embedding', null)

      if (postsError) {
        return NextResponse.json(
          { error: `投稿の取得に失敗しました: ${postsError.message}` },
          { status: 500 }
        )
      }

      postsToProcess =
        posts
          ?.map((post) => {
            const content =
              post.current_version && typeof post.current_version === 'object'
                ? (post.current_version as { content: Json }).content
                : null

            if (!content) return null

            return {
              content,
              excerpt: post.excerpt,
              id: post.id,
              title: post.title ?? ''
            }
          })
          .filter((p): p is NonNullable<typeof p> => p !== null) ?? []
    } else {
      return NextResponse.json(
        { error: 'postId または all パラメータを指定してください' },
        { status: 400 }
      )
    }

    // Generate embeddings and update database
    const results: Array<{ error?: string; id: string; success: boolean }> = []

    for (const post of postsToProcess) {
      try {
        const embedding = await generatePostEmbedding({
          content: post.content,
          excerpt: post.excerpt,
          title: post.title
        })

        // Update post with embedding
        const { error: updateError } = await supabase
          .from('posts')
          .update({ embedding: JSON.stringify(embedding) })
          .eq('id', post.id)

        if (updateError) {
          results.push({
            error: updateError.message,
            id: post.id,
            success: false
          })
        } else {
          results.push({
            id: post.id,
            success: true
          })
        }
      } catch (error) {
        results.push({
          error: error instanceof Error ? error.message : 'Unknown error',
          id: post.id,
          success: false
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      failureCount,
      results,
      successCount,
      total: results.length
    })
  } catch (error) {
    console.error('Embedding generation error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Embedding生成中にエラーが発生しました'
      },
      { status: 500 }
    )
  }
}
