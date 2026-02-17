import { readFile } from 'node:fs/promises'

export interface Frontmatter {
  authors?: string[]
  date?: string
  lastmod?: string
  last_update?: {
    author?: string
    date?: string
  }
  publishdate?: string // Legacy field for publish date
  publishDate?: string // Alternative form of publishdate
  tags?: string[]
  title?: string
}

export interface ParsedMDX {
  frontmatter: Frontmatter
  content: string
}

/**
 * Parse YAML-like frontmatter from MDX content
 * @param frontmatterText - Frontmatter text without --- markers
 * @returns Parsed frontmatter object
 */
function parseFrontmatter(frontmatterText: string): Frontmatter {
  const frontmatter: Frontmatter = {}
  const lines = frontmatterText.split('\n')

  let inLastUpdate = false

  /**
   * Parse array value from string like "[item1, item2]"
   * @param value - String value that may contain an array notation
   * @returns Array of trimmed non-empty strings
   * @example parseArray('[ykzts]') // returns ['ykzts']
   * @example parseArray('[tech, web, javascript]') // returns ['tech', 'web', 'javascript']
   */
  const parseArray = (value: string): string[] => {
    const arrayMatch = value.match(/\[(.*?)\]/)
    if (arrayMatch) {
      return arrayMatch[1]
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v)
    }
    return []
  }

  for (const line of lines) {
    if (line.trim() === '') continue

    // Check for last_update block
    if (line.match(/^last_update:\s*$/)) {
      frontmatter.last_update = {}
      inLastUpdate = true
      continue
    }

    // Handle last_update fields
    if (inLastUpdate && line.startsWith('  ')) {
      const match = line.match(/^\s+(\w+):\s*(.+)$/)
      if (match) {
        const [, key, value] = match
        if (key === 'date') {
          frontmatter.last_update = frontmatter.last_update || {}
          frontmatter.last_update.date = value.trim()
        } else if (key === 'author') {
          frontmatter.last_update = frontmatter.last_update || {}
          frontmatter.last_update.author = value.trim()
        }
      }
      continue
    }

    // End of last_update block
    if (inLastUpdate && !line.startsWith('  ')) {
      inLastUpdate = false
    }

    // Parse top-level fields
    const match = line.match(/^(\w+):\s*(.*)$/)
    if (match) {
      const [, key, value] = match

      if (key === 'date') {
        frontmatter.date = value.trim()
      } else if (key === 'lastmod') {
        frontmatter.lastmod = value.trim()
      } else if (key === 'publishdate') {
        frontmatter.publishdate = value.trim()
      } else if (key === 'publishDate') {
        frontmatter.publishDate = value.trim()
      } else if (key === 'title') {
        // Remove quotes from YAML values (e.g., 'text' -> text, "text" -> text)
        let titleValue = value.trim()
        if (
          (titleValue.startsWith("'") && titleValue.endsWith("'")) ||
          (titleValue.startsWith('"') && titleValue.endsWith('"'))
        ) {
          titleValue = titleValue.slice(1, -1)
        }
        frontmatter.title = titleValue
      } else if (key === 'authors') {
        frontmatter.authors = parseArray(value)
      } else if (key === 'tags') {
        frontmatter.tags = parseArray(value)
      }
    }
  }

  return frontmatter
}

/**
 * Parse MDX file and extract frontmatter and content
 * @param filePath - Path to the MDX file
 * @returns Parsed frontmatter and content
 */
export async function parseMDX(filePath: string): Promise<ParsedMDX> {
  const fileContent = await readFile(filePath, 'utf-8')
  return parseMDXContent(fileContent)
}

/**
 * Convert HTML comments to MDX comments
 * @param content - MDX content
 * @returns Content with HTML comments converted to MDX comments
 */
function convertHtmlCommentsToMdx(content: string): string {
  // Convert <!-- comment --> to {/* comment */}
  // Use [\s\S] to match across line breaks
  return content.replace(/<!--\s*([\s\S]*?)\s*-->/g, '{/* $1 */}')
}

/**
 * Fix common MDX syntax issues for legacy content
 * @param content - MDX content
 * @returns Content with syntax issues fixed
 */
function fixLegacyMdxSyntax(content: string): string {
  let fixed = content

  // Fix self-closing tags with space before slash (e.g., <br /> -> <br/>)
  fixed = fixed.replace(/<(\w+)\s+\/>/g, '<$1/>')

  // Fix common HTML tags that should be self-closing in MDX
  // <br> -> <br/>
  fixed = fixed.replace(/<br\s*>/gi, '<br/>')
  fixed = fixed.replace(/<hr\s*>/gi, '<hr/>')
  // Only convert <img ...> that are not already self-closing
  fixed = fixed.replace(/<img\s+([^>]*?)(?<!\/)>/gi, '<img $1/>')

  // Fix JSX expressions that might have issues - escape braces in code blocks
  // This is a simple fix - if there are standalone braces not in code blocks, wrap them
  // But for now, let's just handle the most common case

  // Remove trailing slashes in closing tags (e.g., </p/> -> </p>)
  fixed = fixed.replace(/<\/(\w+)\/>/g, '</$1>')

  return fixed
}

/**
 * Parse MDX content string and extract frontmatter and content
 * @param fileContent - MDX file content as string
 * @returns Parsed frontmatter and content
 */
export function parseMDXContent(fileContent: string): ParsedMDX {
  // Extract frontmatter between --- markers
  const frontmatterMatch = fileContent.match(
    /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  )

  if (!frontmatterMatch) {
    throw new Error('No frontmatter found in content')
  }

  const [, frontmatterText, rawContent] = frontmatterMatch

  // Convert HTML comments to MDX comments before parsing
  let content = convertHtmlCommentsToMdx(rawContent)

  // Fix common legacy MDX syntax issues
  content = fixLegacyMdxSyntax(content)

  return {
    content: content.trim(),
    frontmatter: parseFrontmatter(frontmatterText)
  }
}
