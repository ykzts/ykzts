import type { PortableTextBlock } from '@portabletext/types'

/**
 * Extracts plain text from a PortableText block's children
 */
function extractTextFromBlock(block: PortableTextBlock): string {
  if (!('children' in block) || !Array.isArray(block.children)) {
    return ''
  }

  return block.children
    .map((child) => {
      if (typeof child === 'object' && child !== null && 'text' in child) {
        return String(child.text)
      }
      return ''
    })
    .join('')
}

/**
 * Extract the first paragraph from PortableText content
 * @param content - PortableText content (array of blocks)
 * @param maxLength - Maximum length of content before ellipsis (default: 150). The returned string may be up to maxLength + 3 characters when truncated.
 * @returns Extracted text or empty string
 */
export function extractFirstParagraph(
  content: PortableTextBlock[] | null | undefined,
  maxLength = 150
): string {
  if (!content || !Array.isArray(content)) {
    return ''
  }

  for (const block of content) {
    // Only process text blocks (not code, image, etc.)
    if (block._type !== 'block') {
      continue
    }

    // Look for text blocks with 'normal' style (paragraphs)
    if (
      'style' in block &&
      block.style === 'normal' &&
      'children' in block &&
      Array.isArray(block.children)
    ) {
      const text = extractTextFromBlock(block)
      const trimmedText = text.trim()

      if (trimmedText) {
        // Truncate to maxLength and add ellipsis if needed
        if (trimmedText.length > maxLength) {
          return `${trimmedText.slice(0, maxLength)}...`
        }
        return trimmedText
      }
    }
  }

  return ''
}
