import { portableTextToMarkdown as convertToMarkdown } from '@portabletext/markdown'
import type { Json } from '@ykzts/supabase'

// Simple type for Portable Text blocks
type PortableTextLike = {
  _type: string
  [key: string]: unknown
}

/**
 * Convert Portable Text to Markdown string
 * @param content - Portable Text content (array of blocks)
 * @returns Markdown string or empty string if conversion fails
 */
export function portableTextToMarkdown(content: Json | undefined): string {
  if (!content) {
    return ''
  }

  try {
    // portableTextToMarkdown expects an array of Portable Text blocks
    if (!Array.isArray(content)) {
      return ''
    }

    // Type assertion: Portable Text content should be an array of objects with _type
    return convertToMarkdown(content as PortableTextLike[])
  } catch (error) {
    console.error('Failed to convert Portable Text to Markdown:', error)
    return ''
  }
}
