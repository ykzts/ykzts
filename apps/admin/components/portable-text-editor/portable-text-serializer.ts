'use client'

import { $createCodeNode, $isCodeNode } from '@lexical/code'
import { $createLinkNode, $isLinkNode, type LinkNode } from '@lexical/link'
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
  type ListItemNode,
  type ListNode
} from '@lexical/list'
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  type HeadingNode
} from '@lexical/rich-text'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  $isTextNode,
  type ElementNode,
  type LexicalEditor,
  type TextNode
} from 'lexical'
import { $createImageNode, $isImageNode } from './nodes/image-node'

// Type alias for child nodes to improve readability
type LexicalChildNodes = ReturnType<ElementNode['getChildren']>

// Portable Text types
type PortableTextBlock = {
  _key: string
  _type: 'block'
  children: PortableTextSpan[]
  listItem?: 'bullet' | 'number'
  level?: number
  markDefs: PortableTextMarkDef[]
  style?: string
}

type PortableTextImage = {
  _key: string
  _type: 'image'
  alt?: string
  asset: {
    _type: 'reference'
    url: string
  }
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

type PortableTextValue = (PortableTextBlock | PortableTextImage)[]

/**
 * Process text content from a paragraph or list item
 */
function processTextContent(textNodes: LexicalChildNodes) {
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
      // Check for strikethrough
      if (format & 4) {
        marks.push('strike-through')
      }
      // Check for underline
      if (format & 8) {
        marks.push('underline')
      }
      // Check for code
      if (format & 16) {
        marks.push('code')
      }

      spans.push({
        _key: crypto.randomUUID(),
        _type: 'span',
        marks: marks.length > 0 ? marks : undefined,
        text
      })
    } else if ($isLinkNode(node)) {
      const linkNode = node as LinkNode
      const url = linkNode.getURL()

      // Generate a unique key for the mark definition
      const markKey = `link-${crypto.randomUUID()}`

      markDefs.push({
        _key: markKey,
        _type: 'link',
        href: url
      })

      // Create separate spans for each child to preserve per-child formatting
      const linkChildren = linkNode.getChildren()
      for (const linkChild of linkChildren) {
        if ($isTextNode(linkChild)) {
          const text = linkChild.getTextContent()
          const format = linkChild.getFormat()
          const childMarks: string[] = [markKey]

          // Check for bold
          if (format & 1) {
            childMarks.push('strong')
          }
          // Check for italic
          if (format & 2) {
            childMarks.push('em')
          }
          // Check for strikethrough
          if (format & 4) {
            childMarks.push('strike-through')
          }
          // Check for underline
          if (format & 8) {
            childMarks.push('underline')
          }
          // Check for code
          if (format & 16) {
            childMarks.push('code')
          }

          spans.push({
            _key: crypto.randomUUID(),
            _type: 'span',
            marks: childMarks,
            text
          })
        }
      }
    }
  }

  // Add empty span if no content
  if (spans.length === 0) {
    spans.push({
      _key: crypto.randomUUID(),
      _type: 'span',
      text: ''
    })
  }

  return { markDefs, spans }
}

/**
 * Convert Lexical editor state to Portable Text format
 */
export function lexicalToPortableText(
  editor: LexicalEditor
): PortableTextValue {
  return editor.read(() => {
    const blocks: (PortableTextBlock | PortableTextImage)[] = []

    const root = $getRoot()
    const children = root.getChildren()

    for (const child of children) {
      if ($isImageNode(child)) {
        // Handle image nodes at the root level
        blocks.push({
          _key: crypto.randomUUID(),
          _type: 'image',
          alt: child.getAltText(),
          asset: {
            _type: 'reference',
            url: child.getSrc()
          }
        })
      } else if ($isListNode(child)) {
        // Handle list nodes
        const listNode = child as ListNode
        const listType = listNode.getListType()
        const listItems = listNode.getChildren()

        for (const item of listItems) {
          if ($isListItemNode(item)) {
            const listItemNode = item as ListItemNode
            const itemChildren = listItemNode.getChildren()

            // List items might have paragraph children, collect all text
            let allTextChildren: LexicalChildNodes = []
            for (const itemChild of itemChildren) {
              if ($isParagraphNode(itemChild)) {
                allTextChildren = allTextChildren.concat(
                  itemChild.getChildren()
                )
              } else if ($isTextNode(itemChild) || $isLinkNode(itemChild)) {
                allTextChildren.push(itemChild)
              } else if ($isListNode(itemChild)) {
                // TODO: Support nested lists - for now, warn and skip
                console.warn(
                  'Nested lists are not yet supported and will be flattened'
                )
              }
            }

            // Process the text content of the list item
            const { spans, markDefs } = processTextContent(allTextChildren)

            blocks.push({
              _key: crypto.randomUUID(),
              _type: 'block',
              children: spans,
              level: 1, // TODO: derive from actual nesting depth when nested lists are supported
              listItem: listType === 'number' ? 'number' : 'bullet',
              markDefs,
              style: 'normal'
            })
          }
        }
      } else if ($isHeadingNode(child)) {
        // Handle heading nodes
        const headingNode = child as HeadingNode
        const tag = headingNode.getTag()
        const { spans, markDefs } = processTextContent(child.getChildren())

        blocks.push({
          _key: crypto.randomUUID(),
          _type: 'block',
          children: spans,
          markDefs,
          style: tag
        })
      } else if ($isQuoteNode(child)) {
        // Handle quote nodes
        const { spans, markDefs } = processTextContent(child.getChildren())

        blocks.push({
          _key: crypto.randomUUID(),
          _type: 'block',
          children: spans,
          markDefs,
          style: 'blockquote'
        })
      } else if ($isCodeNode(child)) {
        // Handle code block nodes
        const { spans, markDefs } = processTextContent(child.getChildren())

        blocks.push({
          _key: crypto.randomUUID(),
          _type: 'block',
          children: spans,
          markDefs,
          style: 'code'
        })
      } else if ($isParagraphNode(child)) {
        const { spans, markDefs } = processTextContent(child.getChildren())

        blocks.push({
          _key: crypto.randomUUID(),
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
        _key: crypto.randomUUID(),
        _type: 'block',
        children: [{ _key: crypto.randomUUID(), _type: 'span', text: '' }],
        markDefs: [],
        style: 'normal'
      })
    }

    return blocks
  })
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

      // Track current list to group consecutive list items
      let currentList: ListNode | null = null
      let currentListType: 'bullet' | 'number' | null = null

      for (const block of portableText) {
        if (block._type === 'image') {
          // Close any open list
          if (currentList) {
            root.append(currentList)
            currentList = null
            currentListType = null
          }

          // Handle image blocks
          if (!block.asset?.url) {
            continue
          }
          const imageNode = $createImageNode({
            altText: block.alt || '',
            src: block.asset.url
          })
          root.append(imageNode)
        } else if (block._type === 'block') {
          // Create a map of mark definitions
          const markDefMap = new Map<string, PortableTextMarkDef>()
          if (block.markDefs) {
            for (const markDef of block.markDefs) {
              markDefMap.set(markDef._key, markDef)
            }
          }

          // Process spans into text nodes
          const textNodes: (TextNode | LinkNode)[] = []
          for (const span of block.children) {
            if (span._type !== 'span') continue

            const marks = span.marks || []
            let currentNode: TextNode | LinkNode | null = null
            let format = 0

            // Check for formatting marks
            const hasStrong = marks.includes('strong')
            const hasEm = marks.includes('em')
            const hasStrikethrough = marks.includes('strike-through')
            const hasUnderline = marks.includes('underline')
            const hasCode = marks.includes('code')

            if (hasStrong) format |= 1 // Bold
            if (hasEm) format |= 2 // Italic
            if (hasStrikethrough) format |= 4 // Strikethrough
            if (hasUnderline) format |= 8 // Underline
            if (hasCode) format |= 16 // Code

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

            textNodes.push(currentNode)
          }

          // Check if this is a list item
          if (block.listItem) {
            const listType = block.listItem

            // Create or reuse list node
            if (!currentList || currentListType !== listType) {
              // Append previous list if exists
              if (currentList) {
                root.append(currentList)
              }
              // Create new list
              currentList = $createListNode(listType)
              currentListType = listType
            }

            // Create list item
            const listItem = $createListItemNode()
            for (const textNode of textNodes) {
              listItem.append(textNode)
            }
            currentList.append(listItem)
          } else if (
            block.style &&
            ['h2', 'h3', 'h4', 'h5', 'h6'].includes(block.style)
          ) {
            // Close any open list
            if (currentList) {
              root.append(currentList)
              currentList = null
              currentListType = null
            }

            // Create heading node
            const headingNode = $createHeadingNode(
              block.style as 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
            )
            for (const textNode of textNodes) {
              headingNode.append(textNode)
            }
            root.append(headingNode)
          } else if (block.style === 'blockquote') {
            // Close any open list
            if (currentList) {
              root.append(currentList)
              currentList = null
              currentListType = null
            }

            // Create quote node
            const quoteNode = $createQuoteNode()
            for (const textNode of textNodes) {
              quoteNode.append(textNode)
            }
            root.append(quoteNode)
          } else if (block.style === 'code') {
            // Close any open list
            if (currentList) {
              root.append(currentList)
              currentList = null
              currentListType = null
            }

            // Create code block node
            const codeNode = $createCodeNode()
            for (const textNode of textNodes) {
              codeNode.append(textNode)
            }
            root.append(codeNode)
          } else {
            // Close any open list
            if (currentList) {
              root.append(currentList)
              currentList = null
              currentListType = null
            }

            // Regular paragraph
            const paragraph = $createParagraphNode()
            for (const textNode of textNodes) {
              paragraph.append(textNode)
            }
            root.append(paragraph)
          }
        }
      }

      // Append any remaining list
      if (currentList) {
        root.append(currentList)
      }
    })
  } catch (error) {
    console.error('Failed to initialize editor with Portable Text:', error)
  }
}
