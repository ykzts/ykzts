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

  // Pattern 1: Markdown image syntax ![alt](path)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let match: RegExpExecArray | null

  // biome-ignore lint/suspicious/noAssignInExpressions: RegExp.exec() is commonly used this way
  while ((match = markdownImageRegex.exec(content)) !== null) {
    const [, altText, imagePath] = match

    // Skip external URLs (http://, https://, //)
    if (
      imagePath.startsWith('http://') ||
      imagePath.startsWith('https://') ||
      imagePath.startsWith('//')
    ) {
      continue
    }

    const absolutePath = isAbsolute(imagePath)
      ? imagePath
      : join(mdxDir, imagePath)

    // Check if file exists and is an image
    let exists = false
    try {
      const stats = await stat(absolutePath)
      const ext = extname(absolutePath)
      exists = stats.isFile() && isImageExtension(ext)
    } catch {
      exists = false
    }

    images.push({
      absolutePath,
      altText: altText || '',
      exists,
      path: imagePath
    })
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

    // Skip external URLs
    if (
      imagePath.startsWith('http://') ||
      imagePath.startsWith('https://') ||
      imagePath.startsWith('//')
    ) {
      continue
    }

    const absolutePath = isAbsolute(imagePath)
      ? imagePath
      : join(mdxDir, imagePath)

    // Check if file exists
    let exists = false
    try {
      const stats = await stat(absolutePath)
      const ext = extname(absolutePath)
      exists = stats.isFile() && isImageExtension(ext)
    } catch {
      exists = false
    }

    // Avoid duplicates
    const isDuplicate = images.some((img) => img.absolutePath === absolutePath)
    if (!isDuplicate) {
      images.push({
        absolutePath,
        altText,
        exists,
        path: imagePath
      })
    }
  }

  return images
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
