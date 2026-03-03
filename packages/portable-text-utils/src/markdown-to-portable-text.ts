import { markdownToPortableText as convertFromMarkdown } from '@portabletext/markdown'
import matter from 'gray-matter'

export type MarkdownPostParseResult = {
  title: string
  contentJson: string
  tags: string[]
  excerpt: string
  publishedAt: string | null
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
 * Parse frontmatter tags value into a string array.
 * Accepts a YAML sequence (string[]) or a comma-separated string.
 */
function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((t): t is string => typeof t === 'string')
      .map((t) => t.trim())
      .filter(Boolean)
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }
  return []
}

/**
 * Parse a frontmatter date/datetime value into an ISO 8601 string.
 * Returns null when the value is absent or cannot be parsed.
 */
function parsePublishedAt(raw: unknown): string | null {
  if (raw === null || raw === undefined || raw === '') {
    return null
  }
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? null : raw.toISOString()
  }
  if (typeof raw === 'string' || typeof raw === 'number') {
    const d = new Date(raw)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }
  return null
}

/**
 * Parse a markdown string and extract the title and body content.
 * Strips frontmatter first (using gray-matter), then converts the remaining
 * markdown to Portable Text. The first h1 block is used as the title when no
 * frontmatter title is present. Frontmatter fields title, tags, excerpt, and
 * date/published_at are extracted into the result.
 */
export function parseMarkdownForPost(
  markdown: string
): MarkdownPostParseResult {
  const { data: frontmatter, content: body } = matter(markdown)

  let allBlocks: PortableTextBlock[] = []
  try {
    const converted = convertFromMarkdown(body)
    allBlocks = converted as PortableTextBlock[]
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(
      `Failed to convert Markdown to Portable Text: ${errorMessage}`
    )
    throw error
  }

  let title =
    typeof frontmatter.title === 'string' ? frontmatter.title.trim() : ''
  let titleBlockIndex = -1

  if (!title) {
    for (let i = 0; i < allBlocks.length; i++) {
      const block = allBlocks[i]
      if (block._type === 'block' && block.style === 'h1') {
        title = extractBlockText(block)
        titleBlockIndex = i
        break
      }
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

  const tags = parseTags(frontmatter.tags)
  const excerpt =
    typeof frontmatter.excerpt === 'string' ? frontmatter.excerpt.trim() : ''
  const publishedAt =
    parsePublishedAt(frontmatter.published_at) ??
    parsePublishedAt(frontmatter.date)

  return {
    contentJson: JSON.stringify(portableText),
    excerpt,
    publishedAt,
    tags,
    title
  }
}
