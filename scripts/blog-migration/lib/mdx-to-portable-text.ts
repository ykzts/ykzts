/**
 * MDX to Portable Text Converter
 *
 * Converts MDX content to Sanity Portable Text format for database storage.
 * This conversion is only applied to content stored in the database - the
 * original MDX files in the git repository remain unchanged.
 */

import { toString as mdastToString } from 'mdast-util-to-string'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import type { Node, Parent } from 'unist'

interface PortableTextBlock {
  _key: string
  _type: string
  [key: string]: unknown
}

interface TextSpan {
  _key: string
  _type: 'span'
  text: string
  marks?: string[]
}

interface BlockContent extends PortableTextBlock {
  _type: 'block'
  style: string
  children: TextSpan[]
  markDefs?: Array<{
    _key: string
    _type: string
    href?: string
  }>
}

interface ImageBlock extends PortableTextBlock {
  _type: 'image'
  asset: {
    _type: 'reference'
    url: string
  }
  alt?: string
}

interface CodeBlock extends PortableTextBlock {
  _type: 'code'
  code: string
  language?: string
}

type PortableTextContent = BlockContent | ImageBlock | CodeBlock

let keyCounter = 0
function generateKey(): string {
  return `key_${keyCounter++}`
}

/**
 * Extract excerpt from MDX content based on truncate markers
 * Supports: <!-- truncate --> and {/* truncate *\/}
 */
export function extractExcerpt(mdxContent: string): string | null {
  // Match HTML comment truncate marker
  const htmlTruncateMatch = mdxContent.match(/<!--\s*truncate\s*-->/i)

  // Match JSX comment truncate marker
  const jsxTruncateMatch = mdxContent.match(/\{\s*\/\*\s*truncate\s*\*\/\s*\}/i)

  let truncateIndex = -1

  if (htmlTruncateMatch && jsxTruncateMatch) {
    // Both exist, use whichever comes first
    truncateIndex = Math.min(
      htmlTruncateMatch.index ?? -1,
      jsxTruncateMatch.index ?? -1
    )
  } else if (htmlTruncateMatch) {
    truncateIndex = htmlTruncateMatch.index ?? -1
  } else if (jsxTruncateMatch) {
    truncateIndex = jsxTruncateMatch.index ?? -1
  }

  if (truncateIndex === -1) {
    return null
  }

  // Extract content before truncate marker
  const excerptContent = mdxContent.slice(0, truncateIndex).trim()

  // Remove frontmatter if present
  const withoutFrontmatter = excerptContent.replace(/^---\n[\s\S]*?\n---\n/, '')

  // Convert to plain text (remove markdown syntax)
  return withoutFrontmatter
    .replace(/^#{1,6}\s+/gm, '') // Remove headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/\n{2,}/g, ' ') // Replace multiple newlines with space
    .trim()
}

/**
 * Convert mdast node to Portable Text blocks
 */
function convertNode(
  node: Node,
  parentMarks: string[] = []
): PortableTextContent[] {
  const blocks: PortableTextContent[] = []

  if (node.type === 'root') {
    const parent = node as Parent
    for (const child of parent.children) {
      blocks.push(...convertNode(child, parentMarks))
    }
    return blocks
  }

  if (node.type === 'paragraph') {
    const parent = node as Parent
    const children: TextSpan[] = []
    const markDefs: Array<{ _key: string; _type: string; href?: string }> = []

    // Check if paragraph contains only an image - if so, treat it as a standalone image block
    if (parent.children.length === 1 && parent.children[0].type === 'image') {
      const imageNode = parent.children[0] as { url: string; alt?: string }
      blocks.push({
        _key: generateKey(),
        _type: 'image',
        alt: imageNode.alt,
        asset: {
          _type: 'reference',
          url: imageNode.url
        }
      })
      return blocks
    }

    function processInlineNode(inlineNode: Node, marks: string[] = []): void {
      if (inlineNode.type === 'text') {
        const textNode = inlineNode as { value: string }
        if (textNode.value) {
          children.push({
            _key: generateKey(),
            _type: 'span',
            marks: marks.length > 0 ? marks : undefined,
            text: textNode.value
          })
        }
      } else if (inlineNode.type === 'strong') {
        const strongNode = inlineNode as Parent
        for (const child of strongNode.children) {
          processInlineNode(child, [...marks, 'strong'])
        }
      } else if (inlineNode.type === 'emphasis') {
        const emNode = inlineNode as Parent
        for (const child of emNode.children) {
          processInlineNode(child, [...marks, 'em'])
        }
      } else if (inlineNode.type === 'inlineCode') {
        const codeNode = inlineNode as { value: string }
        children.push({
          _key: generateKey(),
          _type: 'span',
          marks: [...marks, 'code'],
          text: codeNode.value
        })
      } else if (inlineNode.type === 'link') {
        const linkNode = inlineNode as Parent & { url: string }
        const markKey = generateKey()
        markDefs.push({
          _key: markKey,
          _type: 'link',
          href: linkNode.url
        })

        for (const child of linkNode.children) {
          processInlineNode(child, [...marks, markKey])
        }
      } else if (inlineNode.type === 'image') {
        const imageNode = inlineNode as { url: string; alt?: string }
        // Handle inline images in paragraphs by breaking out and creating image blocks
        // First, save any accumulated text as a block
        if (children.length > 0) {
          const block: BlockContent = {
            _key: generateKey(),
            _type: 'block',
            children: [...children],
            style: 'normal'
          }

          if (markDefs.length > 0) {
            block.markDefs = [...markDefs]
          }

          blocks.push(block)
          children.length = 0
          markDefs.length = 0
        }

        // Add image as a separate block
        blocks.push({
          _key: generateKey(),
          _type: 'image',
          alt: imageNode.alt,
          asset: {
            _type: 'reference',
            url: imageNode.url
          }
        })
      }
    }

    for (const child of parent.children) {
      processInlineNode(child, parentMarks)
    }

    if (children.length > 0) {
      const block: BlockContent = {
        _key: generateKey(),
        _type: 'block',
        children,
        style: 'normal'
      }

      if (markDefs.length > 0) {
        block.markDefs = markDefs
      }

      blocks.push(block)
    }

    return blocks
  }

  if (node.type === 'heading') {
    const headingNode = node as Parent & { depth: number }
    const text = mdastToString(headingNode)

    blocks.push({
      _key: generateKey(),
      _type: 'block',
      children: [
        {
          _key: generateKey(),
          _type: 'span',
          text
        }
      ],
      style: `h${headingNode.depth}`
    })

    return blocks
  }

  if (node.type === 'code') {
    const codeNode = node as { value: string; lang?: string }

    blocks.push({
      _key: generateKey(),
      _type: 'code',
      code: codeNode.value,
      language: codeNode.lang
    })

    return blocks
  }

  if (node.type === 'image') {
    const imageNode = node as { url: string; alt?: string }

    blocks.push({
      _key: generateKey(),
      _type: 'image',
      alt: imageNode.alt,
      asset: {
        _type: 'reference',
        url: imageNode.url
      }
    })

    return blocks
  }

  if (node.type === 'list') {
    const listNode = node as Parent & { ordered?: boolean }

    for (const item of listNode.children) {
      if (item.type === 'listItem') {
        const listItemNode = item as Parent
        for (const child of listItemNode.children) {
          const childBlocks = convertNode(child, parentMarks)
          // Wrap first block with list item style
          if (childBlocks.length > 0 && childBlocks[0]._type === 'block') {
            const firstBlock = childBlocks[0] as BlockContent
            firstBlock.listItem = listNode.ordered ? 'number' : 'bullet'
            firstBlock.level = 1
          }
          blocks.push(...childBlocks)
        }
      }
    }

    return blocks
  }

  if (node.type === 'blockquote') {
    const quoteNode = node as Parent
    for (const child of quoteNode.children) {
      const childBlocks = convertNode(child, parentMarks)
      // Mark first block as blockquote
      if (childBlocks.length > 0 && childBlocks[0]._type === 'block') {
        const firstBlock = childBlocks[0] as BlockContent
        firstBlock.style = 'blockquote'
      }
      blocks.push(...childBlocks)
    }

    return blocks
  }

  // Handle mdxJsxFlowElement and other MDX-specific nodes
  if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
    const jsxNode = node as Parent
    // Recursively process children
    for (const child of jsxNode.children) {
      blocks.push(...convertNode(child, parentMarks))
    }
    return blocks
  }

  // Skip HTML comments and JSX comments (including truncate markers)
  if (node.type === 'html' || node.type === 'mdxFlowExpression') {
    return blocks
  }

  // For other nodes, try to extract text
  if ('children' in node) {
    const parent = node as Parent
    for (const child of parent.children) {
      blocks.push(...convertNode(child, parentMarks))
    }
  }

  return blocks
}

/**
 * Convert MDX content to Portable Text
 */
export function convertMDXToPortableText(
  mdxContent: string
): PortableTextContent[] {
  // Reset key counter for consistent keys in tests
  keyCounter = 0

  // Remove frontmatter before parsing
  let contentWithoutFrontmatter = mdxContent.replace(
    /^---\n[\s\S]*?\n---\n/,
    ''
  )

  // Remove truncate markers before parsing to avoid MDX parse errors
  contentWithoutFrontmatter = contentWithoutFrontmatter
    .replace(/<!--\s*truncate\s*-->/gi, '')
    .replace(/\{\s*\/\*\s*truncate\s*\*\/\s*\}/gi, '')

  // Parse MDX to AST
  const processor = unified().use(remarkParse).use(remarkMdx)

  const tree = processor.parse(contentWithoutFrontmatter)

  // Convert AST to Portable Text
  const blocks = convertNode(tree)

  return blocks
}
