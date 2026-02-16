#!/usr/bin/env node
/**
 * Script to generate embeddings for existing posts
 * Usage:
 *   pnpm tsx scripts/generate-embeddings.ts [--all] [--post-id=<id>]
 *
 * Options:
 *   --all         Generate embeddings for all posts without embeddings
 *   --post-id     Generate embedding for a specific post
 *
 * Environment variables required:
 *   OPENAI_API_KEY              - OpenAI API key
 *   NEXT_PUBLIC_SUPABASE_URL    - Supabase project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase anon key
 */

import { createClient } from '@supabase/supabase-js'
import type { Database, Json } from '@ykzts/supabase'
import OpenAI from 'openai'

// Check environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set')
  process.exit(1)
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set'
  )
  process.exit(1)
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

// Default excerpt length when excerpt is not provided
// Used for standalone script; the API uses extractFirstParagraph from portable-text-utils
const DEFAULT_EXCERPT_LENGTH = 500

/**
 * Extract text content from Portable Text JSON
 */
function extractTextFromPortableText(content: Json): string {
  if (!content || typeof content !== 'object') {
    return ''
  }

  const blocks = Array.isArray(content) ? content : [content]
  const texts: string[] = []

  for (const block of blocks) {
    if (
      typeof block === 'object' &&
      block !== null &&
      'children' in block &&
      Array.isArray(block.children)
    ) {
      for (const child of block.children) {
        if (
          typeof child === 'object' &&
          child !== null &&
          'text' in child &&
          typeof child.text === 'string'
        ) {
          texts.push(child.text)
        }
      }
    }
  }

  return texts.join(' ').trim()
}

/**
 * Generate embedding for text
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    dimensions: 1536,
    input: text,
    model: 'text-embedding-3-small'
  })

  return response.data[0].embedding
}

/**
 * Generate embedding for a post
 */
async function generatePostEmbedding(params: {
  content: Json
  excerpt: string | null
  title: string
}): Promise<number[]> {
  const { content, excerpt, title } = params

  // Extract text from content
  const contentText = extractTextFromPortableText(content)

  // Use excerpt if available, otherwise use first DEFAULT_EXCERPT_LENGTH characters
  const excerptText = excerpt || contentText.slice(0, DEFAULT_EXCERPT_LENGTH)

  // Combine title, excerpt, and content
  const combinedText = `${title} ${title} ${excerptText} ${contentText}`
    .replace(/\s+/g, ' ')
    .trim()

  return generateEmbedding(combinedText)
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  const generateAll = args.includes('--all')
  const postIdArg = args.find((arg) => arg.startsWith('--post-id='))
  const postId = postIdArg ? postIdArg.split('=')[1] : null

  if (!generateAll && !postId) {
    console.error('Error: Please specify --all or --post-id=<id>')
    console.error(
      'Usage: pnpm tsx scripts/generate-embeddings.ts [--all] [--post-id=<id>]'
    )
    process.exit(1)
  }

  let postsQuery = supabase.from('posts').select(
    `
      id,
      title,
      excerpt,
      current_version:post_versions!posts_current_version_id_fkey(content)
    `
  )

  if (postId) {
    postsQuery = postsQuery.eq('id', postId)
  } else {
    // Only process posts without embeddings
    postsQuery = postsQuery.is('embedding', null)
  }

  const { data: posts, error: postsError } = await postsQuery

  if (postsError) {
    console.error('Error fetching posts:', postsError.message)
    process.exit(1)
  }

  if (!posts || posts.length === 0) {
    console.log('No posts to process')
    return
  }

  console.log(`Processing ${posts.length} post(s)...`)

  let successCount = 0
  let failureCount = 0

  for (const post of posts) {
    try {
      console.log(`Processing post: ${post.title} (${post.id})`)

      // Extract content from current version
      const content =
        post.current_version && typeof post.current_version === 'object'
          ? (post.current_version as { content: Json }).content
          : null

      if (!content) {
        console.warn(`  ⚠️  No content found, skipping`)
        failureCount++
        continue
      }

      // Generate embedding
      const embedding = await generatePostEmbedding({
        content,
        excerpt: post.excerpt,
        title: post.title ?? ''
      })

      // Update post with embedding
      const { error: updateError } = await supabase
        .from('posts')
        .update({ embedding: JSON.stringify(embedding) })
        .eq('id', post.id)

      if (updateError) {
        console.error(`  ❌ Error updating post: ${updateError.message}`)
        failureCount++
      } else {
        console.log(`  ✅ Successfully generated embedding`)
        successCount++
      }
    } catch (error) {
      console.error(
        `  ❌ Error processing post: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      failureCount++
    }
  }

  console.log('\nSummary:')
  console.log(`  Total: ${posts.length}`)
  console.log(`  Success: ${successCount}`)
  console.log(`  Failed: ${failureCount}`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
