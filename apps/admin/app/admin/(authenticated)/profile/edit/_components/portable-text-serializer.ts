'use client'

import { $createLinkNode, $isLinkNode, type LinkNode } from '@lexical/link'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  $isTextNode,
  type LexicalEditor,
  type TextNode
} from 'lexical'

// Portable Text types
type PortableTextBlock = {
  _type: 'block'
  children: PortableTextSpan[]
  markDefs: PortableTextMarkDef[]
  style?: string
}

type PortableTextSpan = {
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

/**
 * Convert Lexical editor state to Portable Text format
 */
export function lexicalToPortableText(
  editor: LexicalEditor
): PortableTextValue {
  const blocks: PortableTextBlock[] = []

  const root = $getRoot()
  const children = root.getChildren()

  for (const child of children) {
    if ($isParagraphNode(child)) {
      const textNodes = child.getChildren()
      const spans: PortableTextSpan[] = []
      const markDefs: PortableTextMarkDef[] = []

      for (const node of textNodes) {
        if ($isTextNode(node)) {
          const text = node.getTextContent()
          const format = node.getFormat()
          const marks: string[] = []

          // Check for bold
          if (format & 1) {
            marks.push('strong')
          }
          // Check for italic
          if (format & 2) {
            marks.push('em')
          }

          spans.push({
            _type: 'span',
            marks: marks.length > 0 ? marks : undefined,
            text
          })
        } else if ($isLinkNode(node)) {
          const linkNode = node as LinkNode
          const url = linkNode.getURL()
          const linkText = linkNode.getTextContent()

          // Generate a unique key for the mark definition
          const markKey = `link-${crypto.randomUUID()}`

          markDefs.push({
            _key: markKey,
            _type: 'link',
            href: url
          })

          // Get text format from link's children
          const linkChildren = linkNode.getChildren()
          const marks: string[] = [markKey]

          for (const linkChild of linkChildren) {
            if ($isTextNode(linkChild)) {
              const format = linkChild.getFormat()
              if (format & 1) {
                marks.push('strong')
              }
              if (format & 2) {
                marks.push('em')
              }
            }
          }

          spans.push({
            _type: 'span',
            marks,
            text: linkText
          })
        }
      }

      // Add empty span if no content
      if (spans.length === 0) {
        spans.push({
          _type: 'span',
          text: ''
        })
      }

      blocks.push({
        _type: 'block',
        children: spans,
        markDefs,
        style: 'normal'
      })
    }
  }

  // Return at least one empty block
  if (blocks.length === 0) {
    blocks.push({
      _type: 'block',
      children: [{ _type: 'span', text: '' }],
      markDefs: [],
      style: 'normal'
    })
  }

  return blocks
}

/**
 * Initialize editor with Portable Text content
 */
export function initializeEditorWithPortableText(
  editor: LexicalEditor,
  jsonString: string
) {
  try {
    const portableText: PortableTextValue = JSON.parse(jsonString)

    if (!Array.isArray(portableText)) {
      return
    }

    editor.update(() => {
      const root = $getRoot()
      root.clear()

      for (const block of portableText) {
        if (block._type !== 'block') continue

        const paragraph = $createParagraphNode()

        // Create a map of mark definitions
        const markDefMap = new Map<string, PortableTextMarkDef>()
        if (block.markDefs) {
          for (const markDef of block.markDefs) {
            markDefMap.set(markDef._key, markDef)
          }
        }

        for (const span of block.children) {
          if (span._type !== 'span') continue

          const marks = span.marks || []
          let currentNode: TextNode | LinkNode | null = null
          let format = 0

          // Check for formatting marks
          const hasStrong = marks.includes('strong')
          const hasEm = marks.includes('em')

          if (hasStrong) format |= 1 // Bold
          if (hasEm) format |= 2 // Italic

          // Check for link marks
          const linkMark = marks.find((mark) => markDefMap.has(mark))

          if (linkMark) {
            const markDef = markDefMap.get(linkMark)
            if (markDef && markDef._type === 'link' && markDef.href) {
              const textNode = $createTextNode(span.text)
              if (format) {
                textNode.setFormat(format)
              }
              const linkNode = $createLinkNode(markDef.href)
              linkNode.append(textNode)
              currentNode = linkNode
            }
          }

          if (!currentNode) {
            const textNode = $createTextNode(span.text)
            if (format) {
              textNode.setFormat(format)
            }
            currentNode = textNode
          }

          paragraph.append(currentNode)
        }

        root.append(paragraph)
      }
    })
  } catch (error) {
    console.error('Failed to initialize editor with Portable Text:', error)
  }
}
