import type { Json } from '@ykzts/supabase'
import { embed } from 'ai'
import { extractFirstParagraph } from './portable-text-utils'

// Maximum character limit for embedding input to avoid exceeding token limits
// text-embedding-3-small has 8191 token limit (~30000 chars ≈ ~7500 tokens)
const MAX_EMBED_CHARS = 30000

/**
 * Extract text content from Portable Text JSON for embedding generation
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
 * Generate embedding vector for text using Vercel AI SDK
 * Uses text-embedding-3-small model (1536 dimensions) via AI Gateway
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: 'openai/text-embedding-3-small',
    value: text
  })

  return embedding
}

/**
 * Generate embedding for a post
 * Combines title, excerpt, and content for comprehensive semantic search
 */
export async function generatePostEmbedding(params: {
  content: Json
  excerpt?: string | null
  title: string
}): Promise<number[]> {
  const { content, excerpt, title } = params

  // Extract text from content
  const contentText = extractTextFromPortableText(content)

  // Generate excerpt if not provided
  const excerptText = excerpt || extractFirstParagraph(content)

  // Combine title, excerpt, and content for embedding
  // Weight title more heavily by including it twice
  // Truncate to safe character limit to avoid exceeding token limits
  const combinedText = `${title} ${title} ${excerptText} ${contentText}`
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_EMBED_CHARS)

  return generateEmbedding(combinedText)
}
