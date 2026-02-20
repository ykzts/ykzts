import { markdownToPortableText as convertFromMarkdown } from '@portabletext/markdown'

export type MarkdownPostParseResult = {
  title: string
  contentJson: string
}

type PortableTextCodeBlock = {
  _key: string
  _type: 'code'
  language?: string
  code?: string
}

type PortableTextBlock = {
  _key?: string
  _type: string
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
 * Parse a markdown string and extract the title and body content.
 * The first `# Heading` line is extracted as the title.
 * The remaining content is converted to Portable Text JSON string.
 */
export function parseMarkdownForPost(
  markdown: string
): MarkdownPostParseResult {
  const lines = markdown.split('\n')
  let title = ''
  let titleIndex = -1

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^#\s+(.+)$/)
    if (match) {
      title = match[1].trim()
      titleIndex = i
      break
    }
  }

  const bodyLines =
    titleIndex >= 0
      ? [...lines.slice(0, titleIndex), ...lines.slice(titleIndex + 1)]
      : lines

  const bodyMarkdown = bodyLines.join('\n').trim()

  let portableText: PortableTextBlock[] = []
  try {
    const converted = convertFromMarkdown(bodyMarkdown)
    portableText = converted.map((block) =>
      transformBlock(block as PortableTextBlock)
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(
      `Failed to convert Markdown to Portable Text: ${errorMessage}`
    )
  }

  return {
    contentJson: JSON.stringify(portableText),
    title
  }
}
