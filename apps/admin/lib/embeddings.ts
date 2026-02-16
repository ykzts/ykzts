import type { Json } from '@ykzts/supabase'
import OpenAI from 'openai'
import { extractFirstParagraph } from './portable-text-utils'

/**
 * Initialize OpenAI client
 */
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }

  return new OpenAI({
    apiKey
  })
}

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
 * Generate embedding vector for text using OpenAI text-embedding-3-small model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient()

  const response = await openai.embeddings.create({
    dimensions: 1536,
    input: text,
    model: 'text-embedding-3-small'
  })

  return response.data[0].embedding
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
  const combinedText = `${title} ${title} ${excerptText} ${contentText}`
    .replace(/\s+/g, ' ')
    .trim()

  return generateEmbedding(combinedText)
}
