import type { PortableTextBlock, TypedObject } from '@portabletext/types'

export type PortableTextValue = PortableTextBlock[]

export interface CodeBlock extends TypedObject {
  _type: 'code'
  code: string
  language?: string
}

export interface ImageBlock extends TypedObject {
  _type: 'image'
  alt?: string
  asset: {
    _type: 'reference'
    url: string
  }
}

export function isPortableTextValue(
  value: unknown
): value is PortableTextValue {
  if (!Array.isArray(value)) {
    return false
  }

  return value.every((item) => {
    if (!item || typeof item !== 'object') {
      return false
    }

    const type = (item as { _type?: unknown })._type

    return typeof type === 'string'
  })
}

/**
 * Converts PortableText content to a plain text string for comparison purposes.
 * Each block is converted to a line of text.
 */
export function portableTextToPlainText(
  value: unknown[] | null | undefined
): string {
  if (!value || !Array.isArray(value)) {
    return ''
  }

  return value
    .map((block) => {
      if (!block || typeof block !== 'object') {
        return ''
      }

      const b = block as Record<string, unknown>

      if (b._type === 'code') {
        const code = typeof b.code === 'string' ? b.code : ''
        const lang = typeof b.language === 'string' ? b.language : ''
        return lang ? `[code:${lang}]\n${code}` : `[code]\n${code}`
      }

      if (b._type === 'image') {
        const alt = typeof b.alt === 'string' ? b.alt : ''
        return alt ? `[image: ${alt}]` : '[image]'
      }

      if (b._type === 'block' && Array.isArray(b.children)) {
        return b.children
          .map((child) => {
            if (
              child &&
              typeof child === 'object' &&
              'text' in (child as object)
            ) {
              return String((child as { text: unknown }).text)
            }
            return ''
          })
          .join('')
      }

      return ''
    })
    .join('\n')
}
