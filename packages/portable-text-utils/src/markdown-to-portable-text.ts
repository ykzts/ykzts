import { markdownToPortableText as convertFromMarkdown } from '@portabletext/markdown'

export type MarkdownPostParseResult = {
  title: string
  contentJson: string
}

type PortableTextCodeBlock = {
  _key?: string
  _type: 'code'
  language?: string
  code?: string
}

type PortableTextSpan = {
  _key?: string
  _type: 'span'
  text?: string
}

type PortableTextBlock = {
  _key?: string
  _type: string
  style?: string
  children?: PortableTextSpan[]
  [key: string]: unknown
}

function isCodeBlock(block: PortableTextBlock): block is PortableTextCodeBlock {
  return block._type === 'code'
}

/**
 * Transform blocks from @portabletext/markdown format to the internal format
 * used by initializeEditorWithPortableText.
 * Specifically, code blocks need to be transformed from:
 *   { _type: 'code', language: '...', code: '...' }
 * to:
 *   { _type: 'block', style: 'code', language: '...', children: [...] }
 */
function transformBlock(block: PortableTextBlock): PortableTextBlock {
  if (isCodeBlock(block)) {
    return {
      _key: block._key,
      _type: 'block',
      children: [
        {
          _key: crypto.randomUUID(),
          _type: 'span',
          text: block.code ?? ''
        }
      ],
      language: block.language,
      markDefs: [],
      style: 'code'
    }
  }
  return block
}

/**
 * Extract plain text from a Portable Text block's span children.
 */
function extractBlockText(block: PortableTextBlock): string {
  if (!Array.isArray(block.children)) {
    return ''
  }
  return block.children
    .map((span) => (span._type === 'span' ? (span.text ?? '') : ''))
    .join('')
}

/**
 * Parse a markdown string and extract the title and body content.
 * Converts the entire markdown to Portable Text first, then extracts the
 * first h1 block as the title and returns the remaining blocks as body content.
 */
export function parseMarkdownForPost(
  markdown: string
): MarkdownPostParseResult {
  let allBlocks: PortableTextBlock[] = []
  try {
    const converted = convertFromMarkdown(markdown)
    allBlocks = converted as PortableTextBlock[]
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(
      `Failed to convert Markdown to Portable Text: ${errorMessage}`
    )
    throw error
  }

  let title = ''
  let titleBlockIndex = -1

  for (let i = 0; i < allBlocks.length; i++) {
    const block = allBlocks[i]
    if (block._type === 'block' && block.style === 'h1') {
      title = extractBlockText(block)
      titleBlockIndex = i
      break
    }
  }

  const bodyBlocks =
    titleBlockIndex >= 0
      ? [
          ...allBlocks.slice(0, titleBlockIndex),
          ...allBlocks.slice(titleBlockIndex + 1)
        ]
      : allBlocks

  const portableText = bodyBlocks.map(transformBlock)

  return {
    contentJson: JSON.stringify(portableText),
    title
  }
}
