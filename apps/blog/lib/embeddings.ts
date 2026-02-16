import { embed } from 'ai'

// Maximum character limit for embedding input to avoid exceeding token limits
// text-embedding-3-small has 8191 token limit
const MAX_EMBED_CHARS = 8000

/**
 * Generate embedding vector for search query using Vercel AI SDK
 * Uses text-embedding-3-small model (1536 dimensions) via AI Gateway
 *
 * @param query - Search query text
 * @returns Embedding vector (1536 dimensions)
 */
export async function generateSearchEmbedding(
  query: string
): Promise<number[]> {
  // Truncate query to safe character limit
  const truncatedQuery = query.trim().slice(0, MAX_EMBED_CHARS)

  const { embedding } = await embed({
    model: 'openai/text-embedding-3-small',
    value: truncatedQuery
  })

  return embedding
}