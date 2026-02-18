import type { PortableTextBlock } from '@portabletext/types'
import type { PortableTextValue } from './portable-text'

export interface Heading {
  id: string
  level: number
  text: string
}

/**
 * Extracts headings (h2, h3) from PortableText content for Table of Contents
 * @param content - PortableText array of blocks
 * @returns Array of heading objects with id, level, and text
 */
export function extractHeadings(content: PortableTextValue): Heading[] {
  const headings: Heading[] = []

  for (const block of content) {
    // Check if this is a block with a heading style
    if (
      block._type === 'block' &&
      'style' in block &&
      typeof block.style === 'string' &&
      /^h[23]$/.test(block.style)
    ) {
      // Extract text from children
      const text = extractTextFromBlock(block)

      if (text) {
        const level = Number.parseInt(block.style.charAt(1), 10)
        const id = generateHeadingId(text)

        headings.push({
          id,
          level,
          text
        })
      }
    }
  }

  return headings
}

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
 * Generates a URL-safe ID from heading text
 * Converts to lowercase, replaces spaces/special chars with hyphens
 */
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Remove special chars but keep letters, numbers, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}
