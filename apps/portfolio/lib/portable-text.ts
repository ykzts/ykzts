import type { PortableTextBlock } from '@portabletext/types'

export type PortableTextValue = PortableTextBlock[]

export interface CodeBlock {
  _type: 'code'
  code: string
  language?: string
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
