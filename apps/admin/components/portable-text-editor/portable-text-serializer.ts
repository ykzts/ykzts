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
  $createTableNodeWithDimensions,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  TableCellHeaderStates
} from '@lexical/table'
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
  language?: string
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
  height?: number
  width?: number
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
  title?: string
}

type PortableTextValue = (
  | PortableTextBlock
  | PortableTextImage
  | PortableTextTable
)[]

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
      const linkTitle = linkNode.getTitle()

      // Generate a unique key for the mark definition
      const markKey = `link-${crypto.randomUUID()}`

      const markDef: PortableTextMarkDef = {
        _key: markKey,
        _type: 'link',
        href: url
      }
      if (linkTitle) {
        markDef.title = linkTitle
      }
      markDefs.push(markDef)

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
 * Process list items recursively to handle nested lists
 */
function processListItems(
  listNode: ListNode,
  level: number,
  blocks: (PortableTextBlock | PortableTextImage)[]
): void {
  const listType = listNode.getListType()
  const listItems = listNode.getChildren()

  for (const item of listItems) {
    if ($isListItemNode(item)) {
      const listItemNode = item as ListItemNode
      const itemChildren = listItemNode.getChildren()

      // List items might have paragraph children, collect all text
      let allTextChildren: LexicalChildNodes = []
      const nestedLists: ListNode[] = []

      for (const itemChild of itemChildren) {
        if ($isParagraphNode(itemChild)) {
          allTextChildren = allTextChildren.concat(itemChild.getChildren())
        } else if ($isTextNode(itemChild) || $isLinkNode(itemChild)) {
          allTextChildren.push(itemChild)
        } else if ($isListNode(itemChild)) {
          // Store nested lists to process after the current item
          nestedLists.push(itemChild as ListNode)
        }
      }

      // Process the text content of the list item first
      const { spans, markDefs } = processTextContent(allTextChildren)

      blocks.push({
        _key: crypto.randomUUID(),
        _type: 'block',
        children: spans,
        level,
        listItem: listType === 'number' ? 'number' : 'bullet',
        markDefs,
        style: 'normal'
      })

      // Then process nested lists
      for (const nestedList of nestedLists) {
        processListItems(nestedList, level + 1, blocks)
      }
    }
  }
}

/**
 * Convert Lexical editor state to Portable Text format
 */
export function lexicalToPortableText(
  editor: LexicalEditor
): PortableTextValue {
  return editor.read(() => {
    const blocks: (
      | PortableTextBlock
      | PortableTextImage
      | PortableTextTable
    )[] = []

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
          },
          height: child.getHeight(),
          width: child.getWidth()
        })
      } else if ($isTableNode(child)) {
        // Handle table nodes
        const rows: PortableTextTableRow[] = []

        for (const rowChild of child.getChildren()) {
          if (!$isTableRowNode(rowChild)) continue

          const cells: PortableTextTableCell[] = []

          for (const cellChild of rowChild.getChildren()) {
            if (!$isTableCellNode(cellChild)) continue

            const isHeader = cellChild.hasHeaderState(TableCellHeaderStates.ROW)
            const textContent = cellChild.getTextContent()

            cells.push({
              _key: crypto.randomUUID(),
              content: textContent,
              isHeader
            })
          }

          rows.push({ _key: crypto.randomUUID(), cells })
        }

        blocks.push({ _key: crypto.randomUUID(), _type: 'table', rows })
      } else if ($isListNode(child)) {
        // Handle list nodes with recursive processing for nested lists
        processListItems(child as ListNode, 1, blocks)
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
        // Handle code block nodes - preserve raw text content including newlines
        const textContent = child.getTextContent()
        const language = child.getLanguage() || undefined

        blocks.push({
          _key: crypto.randomUUID(),
          _type: 'block',
          children: [
            {
              _key: crypto.randomUUID(),
              _type: 'span',
              text: textContent
            }
          ],
          language,
          markDefs: [],
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

      // Track current lists at each nesting level
      const listStack: Array<{
        list: ListNode
        level: number
        type: 'bullet' | 'number'
      }> = []

      // Helper function to close all open lists
      const closeAllLists = () => {
        while (listStack.length > 0) {
          const item = listStack.pop()
          // Only append to root if this was the top-level list
          if (item && listStack.length === 0) {
            root.append(item.list)
          }
        }
      }

      for (const block of portableText) {
        if (block._type === 'image') {
          // Close any open lists
          closeAllLists()

          // Handle image blocks
          if (!block.asset?.url) {
            continue
          }
          const imageNode = $createImageNode({
            altText: block.alt || '',
            height:
              typeof block.height === 'number' && Number.isFinite(block.height)
                ? block.height
                : undefined,
            src: block.asset.url,
            width:
              typeof block.width === 'number' && Number.isFinite(block.width)
                ? block.width
                : undefined
          })
          root.append(imageNode)
        } else if (block._type === 'table') {
          // Close any open lists
          closeAllLists()

          // Handle table blocks
          if (block.rows.length === 0) continue

          const tableNode = $createTableNodeWithDimensions(
            block.rows.length,
            block.rows[0].cells.length || 1,
            false
          )

          const tableRows = tableNode.getChildren()
          for (let rowIndex = 0; rowIndex < block.rows.length; rowIndex++) {
            const portableRow = block.rows[rowIndex]
            const tableRowNode = tableRows[rowIndex]
            if (!$isTableRowNode(tableRowNode)) continue

            const tableCells = tableRowNode.getChildren()
            for (
              let cellIndex = 0;
              cellIndex < portableRow.cells.length;
              cellIndex++
            ) {
              const portableCell = portableRow.cells[cellIndex]
              const tableCellNode = tableCells[cellIndex]
              if (!$isTableCellNode(tableCellNode)) continue

              if (portableCell.isHeader) {
                tableCellNode.setHeaderStyles(TableCellHeaderStates.ROW)
              }

              const paragraph = $createParagraphNode()
              const textNode = $createTextNode(portableCell.content)
              paragraph.append(textNode)

              // Clear existing content and append our text
              tableCellNode.clear()
              tableCellNode.append(paragraph)
            }
          }

          root.append(tableNode)
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
                const linkNode = $createLinkNode(markDef.href, {
                  title: markDef.title ?? null
                })
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
            const level = block.level || 1

            // Adjust list stack to match the current level
            // Use >= to pop items at or above current level, creating a clean slate for the new level
            while (listStack.length >= level) {
              const poppedList = listStack.pop()
              if (poppedList && listStack.length === 0) {
                // This was a top-level list
                root.append(poppedList.list)
              }
            }

            // Create new lists for levels that don't exist yet
            while (listStack.length < level) {
              const newLevel = listStack.length + 1
              const newList = $createListNode(listType)

              if (listStack.length > 0) {
                // Append to the last item of the parent list
                const parentList = listStack[listStack.length - 1].list
                let lastItem = parentList.getLastChild()

                // If parent list is empty or last child is not a list item,
                // create an empty list item to anchor the nested list
                if (!lastItem || !$isListItemNode(lastItem)) {
                  lastItem = $createListItemNode()
                  parentList.append(lastItem)
                }

                // TypeScript now knows lastItem is a ListItemNode after the guard
                if ($isListItemNode(lastItem)) {
                  lastItem.append(newList)
                }
              }

              listStack.push({ level: newLevel, list: newList, type: listType })
            }

            // Get the current list at this level
            const currentListInfo = listStack[level - 1]

            // If list type changed at this level, we need to create a new list
            if (currentListInfo.type !== listType) {
              // Pop this level
              listStack.pop()

              // Create new list of correct type
              const newList = $createListNode(listType)

              if (listStack.length > 0) {
                // Append to the last item of the parent list
                const parentList = listStack[listStack.length - 1].list
                let lastItem = parentList.getLastChild()

                // If parent list is empty or last child is not a list item,
                // create an empty list item to anchor the nested list
                if (!lastItem || !$isListItemNode(lastItem)) {
                  lastItem = $createListItemNode()
                  parentList.append(lastItem)
                }

                // TypeScript now knows lastItem is a ListItemNode after the guard
                if ($isListItemNode(lastItem)) {
                  lastItem.append(newList)
                }
              }

              listStack.push({ level, list: newList, type: listType })
            }

            // Create list item and append to current list
            const listItem = $createListItemNode()
            for (const textNode of textNodes) {
              listItem.append(textNode)
            }
            listStack[level - 1].list.append(listItem)
          } else if (
            block.style &&
            ['h2', 'h3', 'h4', 'h5', 'h6'].includes(block.style)
          ) {
            // Close any open lists
            closeAllLists()

            // Create heading node
            const headingNode = $createHeadingNode(
              block.style as 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
            )
            for (const textNode of textNodes) {
              headingNode.append(textNode)
            }
            root.append(headingNode)
          } else if (block.style === 'blockquote') {
            // Close any open lists
            closeAllLists()

            // Create quote node
            const quoteNode = $createQuoteNode()
            for (const textNode of textNodes) {
              quoteNode.append(textNode)
            }
            root.append(quoteNode)
          } else if (block.style === 'code') {
            // Close any open lists
            closeAllLists()

            // Create code block node
            const codeNode = $createCodeNode(block.language)
            for (const textNode of textNodes) {
              codeNode.append(textNode)
            }
            root.append(codeNode)
          } else {
            // Close any open lists
            closeAllLists()

            // Regular paragraph
            const paragraph = $createParagraphNode()
            for (const textNode of textNodes) {
              paragraph.append(textNode)
            }
            root.append(paragraph)
          }
        }
      }

      // Append any remaining lists
      closeAllLists()
    })
  } catch (error) {
    console.error('Failed to initialize editor with Portable Text:', error)
  }
}
