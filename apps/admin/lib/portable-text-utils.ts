import type { Json } from '@ykzts/supabase'

/**
 * Portable Text block structure
 */
interface PortableTextBlock {
  _key?: string
  _type: string
  children?: Array<{
    _key?: string
    _type?: string
    marks?: string[]
    text?: string
  }>
  markDefs?: Array<{
    _key: string
    _type: string
    [key: string]: unknown
  }>
  style?: string
  [key: string]: unknown
}

/**
 * Extract the first paragraph from Portable Text content
 * @param content - Portable Text content (array of blocks)
 * @param maxLength - Maximum length of the excerpt (default: 200)
 * @returns Extracted text or empty string
 */
export function extractFirstParagraph(content: Json, maxLength = 200): string {
  if (!Array.isArray(content)) {
    return ''
  }

  for (const block of content) {
    // Type guard to ensure block is an object
    if (!block || typeof block !== 'object' || Array.isArray(block)) {
      continue
    }

    const portableBlock = block as PortableTextBlock

    // Look for text blocks with 'normal' style (paragraphs)
    if (
      portableBlock.style === 'normal' &&
      Array.isArray(portableBlock.children)
    ) {
      const text = portableBlock.children
        .filter((child) => child && typeof child === 'object' && child.text)
        .map((child) => child.text)
        .join('')

      const trimmedText = text.trim()
      if (trimmedText) {
        // Truncate to maxLength and add ellipsis if needed
        if (trimmedText.length > maxLength) {
          return `${trimmedText.slice(0, maxLength).trim()}...`
        }
        return trimmedText
      }
    }
  }

  return ''
}
