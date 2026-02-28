'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@ykzts/ui/components/table'
import { useEffect, useState } from 'react'

type PortableTextBlock = {
  _key: string
  _type: 'block'
  children: PortableTextSpan[]
  language?: string
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

type PortableTextTableCell = {
  _key: string
  content: string
  isHeader: boolean
}

type PortableTextTableRow = {
  _key: string
  cells: PortableTextTableCell[]
}

type PortableTextTable = {
  _key: string
  _type: 'table'
  rows: PortableTextTableRow[]
}

type PortableTextValue = (PortableTextBlock | PortableTextTable)[]

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
        if (block._type === 'table') {
          const tableBlock = block as PortableTextTable
          const hasHeader = tableBlock.rows.some((row) =>
            row.cells.some((cell) => cell.isHeader)
          )
          const headerRow = hasHeader ? tableBlock.rows[0] : null
          const bodyRows = hasHeader
            ? tableBlock.rows.slice(1)
            : tableBlock.rows
          return (
            <Table key={tableBlock._key}>
              {headerRow && (
                <TableHeader>
                  <TableRow>
                    {headerRow.cells.map((cell) => (
                      <TableHead key={cell._key}>{cell.content}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
              )}
              <TableBody>
                {bodyRows.map((row) => (
                  <TableRow key={row._key}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell._key}>{cell.content}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        }

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
            const hasUnderline = marks.includes('underline')
            const hasStrikethrough = marks.includes('strike-through')
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

            if (hasUnderline) {
              content = <u>{content}</u>
            }

            if (hasStrikethrough) {
              content = <s>{content}</s>
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
            <div className="my-2" key={block._key}>
              {block.language && (
                <div className="rounded-t border border-border border-b-0 bg-muted/30 px-3 py-1 font-mono text-muted-foreground text-xs">
                  {block.language}
                </div>
              )}
              <pre
                className={`overflow-x-auto border border-border bg-muted/20 p-4 font-mono text-sm ${
                  block.language ? 'rounded-b' : 'rounded'
                }`}
              >
                <code className="whitespace-pre">{codeText}</code>
              </pre>
            </div>
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
