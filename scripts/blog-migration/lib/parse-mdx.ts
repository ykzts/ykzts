import { readFile } from 'node:fs/promises'

export interface Frontmatter {
  authors?: string[]
  date?: string
  last_update?: {
    author?: string
    date?: string
  }
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
      } else if (key === 'title') {
        frontmatter.title = value.trim()
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

  const [, frontmatterText, content] = frontmatterMatch

  return {
    content: content.trim(),
    frontmatter: parseFrontmatter(frontmatterText)
  }
}
