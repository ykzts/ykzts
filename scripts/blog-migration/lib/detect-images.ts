import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, isAbsolute, join } from 'node:path'

export interface ImageReference {
  altText: string
  path: string
  absolutePath: string
  exists: boolean
}

/**
 * Supported image file extensions
 */
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']

/**
 * Check if a file extension is a supported image format
 */
function isImageExtension(ext: string): boolean {
  return IMAGE_EXTENSIONS.includes(ext.toLowerCase())
}

/**
 * Detect all image references in MDX content
 * Supports:
 * - Markdown syntax: ![alt](path)
 * - JSX syntax: <img src="path" alt="alt" />
 * - Docusaurus-specific patterns
 *
 * @param content - MDX file content
 * @param mdxFilePath - Absolute path to the MDX file (for resolving relative paths)
 * @returns Array of image references with metadata
 */
export async function detectImages(
  content: string,
  mdxFilePath: string
): Promise<ImageReference[]> {
  const images: ImageReference[] = []
  const mdxDir = dirname(mdxFilePath)

  const buildImageReference = async (
    imagePath: string,
    altText: string
  ): Promise<ImageReference | null> => {
    let normalizedPath = imagePath

    if (normalizedPath.includes(')](')) {
      console.warn(
        `[detect-images] Path contains ')](', normalizing: ${imagePath}`
      )
      normalizedPath = normalizedPath.split(')](')[0]
    }

    // Skip external URLs (http://, https://, //) and data URIs
    if (
      normalizedPath.startsWith('http://') ||
      normalizedPath.startsWith('https://') ||
      normalizedPath.startsWith('//') ||
      normalizedPath.startsWith('data:')
    ) {
      return null
    }

    const absolutePath = isAbsolute(normalizedPath)
      ? normalizedPath
      : join(mdxDir, normalizedPath)

    // Check if file exists and is an image
    let exists = false
    try {
      const stats = await stat(absolutePath)
      const ext = extname(absolutePath)
      exists = stats.isFile() && isImageExtension(ext)
    } catch {
      exists = false
    }

    return {
      absolutePath,
      altText: altText || '',
      exists,
      path: normalizedPath
    }
  }

  // Pattern 1: Markdown image syntax ![alt](path)
  // Use a robust regex that handles parentheses in paths
  // Pattern: ![alt text](path/to/image.png) or ![alt](path "title")
  // Captures: [1] = alt text, [2] = image path (stops at whitespace before optional title)
  // Examples: ![Photo](./img/photo(1).png), ![Alt](image.jpg "Title")
  // The key is [^\s"']+ which allows ) in paths but stops at space (for titles) or closing )
  const markdownImageRegex =
    /!\[([^\]]*)\]\(([^\s"']+)(?:\s+["'][^"']*["'])?\)/g
  let match: RegExpExecArray | null

  // biome-ignore lint/suspicious/noAssignInExpressions: RegExp.exec() is commonly used this way
  while ((match = markdownImageRegex.exec(content)) !== null) {
    const [, altText, imagePath] = match
    const imageRef = await buildImageReference(imagePath, altText)

    if (imageRef) {
      images.push(imageRef)
    }
  }

  // Pattern 2: JSX img tags <img src="path" alt="alt" />
  // This captures both self-closing and regular img tags
  // We need to handle attributes in any order
  const jsxImageRegex = /<img\s+([^>]+)\/?>/gi

  // biome-ignore lint/suspicious/noAssignInExpressions: RegExp.exec() is commonly used this way
  while ((match = jsxImageRegex.exec(content)) !== null) {
    const [, attributes] = match

    // Extract src attribute
    const srcMatch = attributes.match(/src=["']([^"']+)["']/)
    if (!srcMatch) continue

    const imagePath = srcMatch[1]

    // Extract alt attribute (optional)
    const altMatch = attributes.match(/alt=["']([^"']*)["']/)
    const altText = altMatch ? altMatch[1] : ''

    const imageRef = await buildImageReference(imagePath, altText)

    if (imageRef) {
      images.push(imageRef)
    }
  }

  // Deduplicate images by absolutePath
  const seen = new Set<string>()
  const uniqueImages = images.filter((img) => {
    if (seen.has(img.absolutePath)) return false
    seen.add(img.absolutePath)
    return true
  })

  return uniqueImages
}

/**
 * Detect all images in an MDX file
 * Convenience wrapper that reads the file and detects images
 *
 * @param mdxFilePath - Absolute path to the MDX file
 * @returns Array of image references with metadata
 */
export async function detectImagesInFile(
  mdxFilePath: string
): Promise<ImageReference[]> {
  const content = await readFile(mdxFilePath, 'utf-8')
  return detectImages(content, mdxFilePath)
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.gif': 'image/gif',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/gif': 'gif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/svg+xml': 'svg',
    'image/webp': 'webp'
  }
  return extensions[mimeType] || 'bin'
}
