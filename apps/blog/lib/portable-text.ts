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

export interface FootnoteBlock extends TypedObject {
  _type: 'footnote'
  identifier: string
  children: PortableTextBlock[]
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
