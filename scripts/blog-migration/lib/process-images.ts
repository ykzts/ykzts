import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@ykzts/supabase'
import { detectImages } from './detect-images.ts'
import { createImageMappings, transformMDXContent } from './transform-mdx.ts'
import { uploadImageToStorage } from './upload-image.ts'

/**
 * Result of processing images for a post
 */
export interface ProcessImagesResult {
  /**
   * Transformed MDX content with updated image URLs
   */
  transformedContent: string
  /**
   * Number of images successfully uploaded
   */
  uploadedCount: number
  /**
   * Number of images that failed to upload
   */
  failedCount: number
  /**
   * Map of original image paths to new Storage URLs
   */
  imageUrlMap: Map<string, string>
}

/**
 * Process images in MDX content: detect, upload, and transform
 *
 * This function is designed to be called during post migration to:
 * 1. Detect images in the MDX content
 * 2. Upload them to Supabase Storage
 * 3. Transform the content to use new image URLs
 *
 * @param mdxContent - Original MDX content
 * @param mdxFilePath - Absolute path to the MDX file (for resolving relative image paths)
 * @param userId - User ID for Supabase Storage path
 * @param supabase - Supabase client instance
 * @returns Result object with transformed content and upload statistics
 *
 * @example
 * ```typescript
 * const result = await processImagesForPost(
 *   mdxContent,
 *   '/path/to/post.mdx',
 *   userId,
 *   supabase
 * )
 * // Use result.transformedContent for database insertion
 * // Check result.failedCount to handle upload failures
 * ```
 */
export async function processImagesForPost(
  mdxContent: string,
  mdxFilePath: string,
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<ProcessImagesResult> {
  // Detect images in the content
  const images = await detectImages(mdxContent, mdxFilePath)

  if (images.length === 0) {
    return {
      failedCount: 0,
      imageUrlMap: new Map(),
      transformedContent: mdxContent,
      uploadedCount: 0
    }
  }

  // Upload images and collect URLs
  const uploadedUrls = new Map<string, string>()
  let uploadedCount = 0
  let failedCount = 0

  for (const image of images) {
    if (!image.exists) {
      console.log(`     ⚠️  Image not found: ${image.path}`)
      failedCount++
      continue
    }

    try {
      const url = await uploadImageToStorage(image, userId, supabase)
      if (url) {
        uploadedUrls.set(image.absolutePath, url)
        uploadedCount++
      } else {
        failedCount++
      }
    } catch (error) {
      console.error(`     ❌ Failed to upload ${image.path}:`, error)
      failedCount++
    }
  }

  // Transform content with new URLs
  const mappings = createImageMappings(images, uploadedUrls)
  const transformedContent = transformMDXContent(mdxContent, mappings)

  return {
    failedCount,
    imageUrlMap: uploadedUrls,
    transformedContent,
    uploadedCount
  }
}
