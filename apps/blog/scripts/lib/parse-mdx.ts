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
 * Parse MDX file and extract frontmatter and content
 * @param filePath - Path to the MDX file
 * @returns Parsed frontmatter and content
 */
export async function parseMDX(filePath: string): Promise<ParsedMDX> {
  const fileContent = await readFile(filePath, 'utf-8')

  // Extract frontmatter between --- markers
  const frontmatterMatch = fileContent.match(
    /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  )

  if (!frontmatterMatch) {
    throw new Error(`No frontmatter found in ${filePath}`)
  }

  const [, frontmatterText, content] = frontmatterMatch

  // Parse YAML-like frontmatter manually (simple implementation)
  const frontmatter: Frontmatter = {}
  const lines = frontmatterText.split('\n')

  let inLastUpdate = false

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
        // Parse array [ykzts]
        const arrayMatch = value.match(/\[(.*?)\]/)
        if (arrayMatch) {
          frontmatter.authors = arrayMatch[1].split(',').map((v) => v.trim())
        }
      } else if (key === 'tags') {
        // Parse array [tag1, tag2]
        const arrayMatch = value.match(/\[(.*?)\]/)
        if (arrayMatch) {
          frontmatter.tags = arrayMatch[1]
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v)
        }
      }
    }
  }

  return {
    content: content.trim(),
    frontmatter
  }
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

  // Parse YAML-like frontmatter manually (simple implementation)
  const frontmatter: Frontmatter = {}
  const lines = frontmatterText.split('\n')

  let inLastUpdate = false

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
        // Parse array [ykzts]
        const arrayMatch = value.match(/\[(.*?)\]/)
        if (arrayMatch) {
          frontmatter.authors = arrayMatch[1].split(',').map((v) => v.trim())
        }
      } else if (key === 'tags') {
        // Parse array [tag1, tag2]
        const arrayMatch = value.match(/\[(.*?)\]/)
        if (arrayMatch) {
          frontmatter.tags = arrayMatch[1]
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v)
        }
      }
    }
  }

  return {
    content: content.trim(),
    frontmatter
  }
}
