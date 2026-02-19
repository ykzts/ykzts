import { toHTML } from '@portabletext/to-html'
import type { PortableTextValue } from './portable-text'

/**
 * Convert PortableText to HTML string
 * @param content - PortableText content
 * @returns HTML string
 */
export function portableTextToHTML(
  content: PortableTextValue | null | undefined
): string {
  if (!content) {
    return ''
  }

  return toHTML(content)
}
