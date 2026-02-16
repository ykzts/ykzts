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

        // Render based on block style
        const style = block.style || 'normal'

        // Process children to build content
        const renderChildren = () =>
          block.children.map((span) => {
            if (span._type !== 'span') return null

            const marks = span.marks || []
            let content: React.ReactNode = span.text

            // Apply marks
            const hasStrong = marks.includes('strong')
            const hasEm = marks.includes('em')
            const hasCode = marks.includes('code')
            const linkMark = marks.find((mark) => markDefMap.has(mark))

            if (hasStrong) {
              content = <strong>{content}</strong>
            }

            if (hasEm) {
              content = <em>{content}</em>
            }

            if (hasCode) {
              content = (
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                  {content}
                </code>
              )
            }

            if (linkMark) {
              const markDef = markDefMap.get(linkMark)
              if (markDef && markDef._type === 'link' && markDef.href) {
                // Sanitize href to prevent XSS attacks
                const href = markDef.href
                const isSafe =
                  href.startsWith('http://') ||
                  href.startsWith('https://') ||
                  href.startsWith('mailto:')

                if (isSafe) {
                  content = (
                    <a
                      className="text-primary hover:underline"
                      href={href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {content}
                    </a>
                  )
                }
              }
            }

            return <span key={span._key}>{content}</span>
          })

        // Code block - needs special handling to preserve line breaks
        if (style === 'code') {
          // Extract full text content from all spans, preserving original text
          const codeText = block.children
            .map((span) => (span._type === 'span' ? span.text : ''))
            .join('')

          return (
            <pre
              className="my-2 overflow-x-auto rounded border border-border bg-muted/20 p-4 font-mono text-sm"
              key={block._key}
            >
              <code className="whitespace-pre">{codeText}</code>
            </pre>
          )
        }

        // Quote block
        if (style === 'blockquote') {
          return (
            <blockquote
              className="my-2 border-border border-l-4 pl-4 text-muted-foreground italic"
              key={block._key}
            >
              {renderChildren()}
            </blockquote>
          )
        }

        // Heading blocks
        if (style === 'h2') {
          return (
            <h2 className="mb-3 font-bold text-3xl" key={block._key}>
              {renderChildren()}
            </h2>
          )
        }
        if (style === 'h3') {
          return (
            <h3 className="mb-2 font-bold text-2xl" key={block._key}>
              {renderChildren()}
            </h3>
          )
        }
        if (style === 'h4') {
          return (
            <h4 className="mb-2 font-bold text-xl" key={block._key}>
              {renderChildren()}
            </h4>
          )
        }
        if (style === 'h5') {
          return (
            <h5 className="mb-1 font-bold text-lg" key={block._key}>
              {renderChildren()}
            </h5>
          )
        }
        if (style === 'h6') {
          return (
            <h6 className="mb-1 font-bold text-base" key={block._key}>
              {renderChildren()}
            </h6>
          )
        }

        // Default paragraph
        return (
          <p className="mb-2" key={block._key}>
            {renderChildren()}
          </p>
        )
      })}
    </div>
  )
}
