'use client'

import { useEffect, useState } from 'react'

type PortableTextBlock = {
  _key: string
  _type: 'block'
  children: PortableTextSpan[]
  markDefs: PortableTextMarkDef[]
  style?: string
}

type PortableTextSpan = {
  _key: string
  _type: 'span'
  marks?: string[]
  text: string
}

type PortableTextMarkDef = {
  _key: string
  _type: string
  href?: string
}

type PortableTextValue = PortableTextBlock[]

type PortableTextPreviewProps = {
  value?: string
}

export function PortableTextPreview({ value }: PortableTextPreviewProps) {
  const [blocks, setBlocks] = useState<PortableTextValue>([])

  useEffect(() => {
    if (!value) {
      setBlocks([])
      return
    }

    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        setBlocks(parsed)
      }
    } catch (error) {
      console.error('Failed to parse Portable Text:', error)
      setBlocks([])
    }
  }, [value])

  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        プレビューがありません
      </div>
    )
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {blocks.map((block) => {
        if (block._type !== 'block') return null

        // Create a map of mark definitions
        const markDefMap = new Map<string, PortableTextMarkDef>()
        if (block.markDefs) {
          for (const markDef of block.markDefs) {
            markDefMap.set(markDef._key, markDef)
          }
        }

        return (
          <p className="mb-2" key={block._key}>
            {block.children.map((span) => {
              if (span._type !== 'span') return null

              const marks = span.marks || []
              let content: React.ReactNode = span.text

              // Apply marks
              const hasStrong = marks.includes('strong')
              const hasEm = marks.includes('em')
              const linkMark = marks.find((mark) => markDefMap.has(mark))

              if (hasStrong) {
                content = <strong>{content}</strong>
              }

              if (hasEm) {
                content = <em>{content}</em>
              }

              if (linkMark) {
                const markDef = markDefMap.get(linkMark)
                if (markDef && markDef._type === 'link' && markDef.href) {
                  content = (
                    <a
                      className="text-primary hover:underline"
                      href={markDef.href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {content}
                    </a>
                  )
                }
              }

              return <span key={span._key}>{content}</span>
            })}
          </p>
        )
      })}
    </div>
  )
}
