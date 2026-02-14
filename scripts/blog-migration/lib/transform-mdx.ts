import type { ImageReference } from './detect-images.ts'

export interface ImageUrlMapping {
  originalPath: string
  newUrl: string
  altText: string
}

/**
 * Transform MDX content by replacing image paths with new URLs
 *
 * Handles:
 * - Markdown syntax: ![alt](path) -> ![alt](newUrl)
 * - JSX syntax: <img src="path" alt="alt" /> -> <img src="newUrl" alt="alt" />
 *
 * @param content - Original MDX content
 * @param mappings - Array of image URL mappings
 * @returns Transformed MDX content with updated image URLs
 */
export function transformMDXContent(
  content: string,
  mappings: ImageUrlMapping[]
): string {
  let transformedContent = content

  for (const mapping of mappings) {
    const { altText, newUrl, originalPath } = mapping

    // Escape special regex characters in the path
    const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Pattern 1: Transform markdown images ![alt](path)
    // We need to be careful to only replace images with matching alt text
    const markdownRegex = new RegExp(
      `!\\[([^\\]]*)\\]\\(${escapedPath}\\)`,
      'g'
    )

    transformedContent = transformedContent.replace(
      markdownRegex,
      (match, capturedAlt) => {
        // Only replace if the alt text matches or is empty
        if (capturedAlt === altText || altText === '') {
          return `![${capturedAlt}](${newUrl})`
        }
        return match
      }
    )

    // Pattern 2: Transform JSX img tags
    // Match: <img ... src="path" ... />
    // We need to handle attributes in any order
    const jsxRegex = new RegExp(
      `<img\\s+([^>]*?)src=["']${escapedPath}["']([^>]*?)\\s*\\/?>`,
      'gi'
    )

    transformedContent = transformedContent.replace(
      jsxRegex,
      (match, attrsBefore, attrsAfter) => {
        // Check if this img tag has the matching alt text
        const altMatch = match.match(/alt=["']([^"']*)["']/)
        const imgAltText = altMatch ? altMatch[1] : ''

        if (imgAltText === altText || altText === '') {
          // Replace the src attribute value
          return `<img ${attrsBefore}src="${newUrl}"${attrsAfter} />`
        }
        return match
      }
    )
  }

  return transformedContent
}

/**
 * Create image URL mappings from image references and uploaded URLs
 *
 * @param images - Array of image references
 * @param uploadedUrls - Map of absolute paths to uploaded URLs
 * @returns Array of image URL mappings
 */
export function createImageMappings(
  images: ImageReference[],
  uploadedUrls: Map<string, string>
): ImageUrlMapping[] {
  const mappings: ImageUrlMapping[] = []

  for (const image of images) {
    const newUrl = uploadedUrls.get(image.absolutePath)
    if (newUrl) {
      mappings.push({
        altText: image.altText,
        newUrl,
        originalPath: image.path
      })
    }
  }

  return mappings
}
