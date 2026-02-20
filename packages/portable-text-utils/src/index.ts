import { escapeHTML, toHTML, uriLooksSafe } from '@portabletext/to-html'
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
        // Use spreading to handle Unicode code points correctly (emoji, surrogate pairs)
        const codePoints = [...trimmedText]
        if (codePoints.length > maxLength) {
          return `${codePoints.slice(0, maxLength).join('')}...`
        }
        return trimmedText
      }
    }
  }

  return ''
}

/**
 * Convert PortableText to HTML string
 * @param content - PortableText content
 * @returns HTML string
 */
export function portableTextToHTML(
  content: PortableTextBlock[] | null | undefined
): string {
  if (!content) {
    return ''
  }

  return toHTML(content, {
    components: {
      marks: {
        link: ({ children, value }) => {
          const href = value?.href as string | undefined
          const title = value?.title as string | undefined
          if (!href || !uriLooksSafe(href)) return children
          const titleAttr = title ? ` title="${escapeHTML(title)}"` : ''
          const rel =
            href.startsWith('/') || href.startsWith('#')
              ? ''
              : ' rel="noreferrer noopener"'
          return `<a href="${escapeHTML(href)}"${titleAttr}${rel}>${children}</a>`
        }
      }
    }
  })
}
