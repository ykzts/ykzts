#!/usr/bin/env node
/**
 * Phase 4.2: Git履歴ベースの移行スクリプト
 *
 * このスクリプトは以下を実行します：
 * 1. apps/blog-legacy/blog内の全MDXファイルを検索
 * 2. 各ファイルのGit履歴を分析して複数バージョンを生成
 * 3. post_versionsテーブルに挿入
 *
 * Usage:
 *   node scripts/blog-migration/migrate-post-versions.ts [--dry-run]
 *
 * Options:
 *   --dry-run  データベースに書き込まずに実行（デバッグ用）
 *
 * Environment:
 *   MIGRATION_USER_ID      (Required) auth.users.idとして使用。画像アップロード先パスとprofile_id解決に使用
 *   MIGRATION_PROFILE_ID   (Optional) 明示的に指定する場合のprofiles.id。未指定時はMIGRATION_USER_IDから自動取得
 */

import { execFile } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@ykzts/supabase'
import {
  generateVersionsFromHistory,
  setRepoRoot
} from './lib/analyze-git-history.ts'
import { detectImages } from './lib/detect-images.ts'
import {
  convertMDXToPortableText,
  extractExcerpt
} from './lib/mdx-to-portable-text.ts'
import {
  createImageMappings,
  transformMDXContent
} from './lib/transform-mdx.ts'
import { uploadImage } from './lib/upload-image.ts'

const execFileAsync = promisify(execFile)

// Repository root - auto-detect using git or environment variable
async function getRepoRoot(): Promise<string> {
  if (process.env.REPO_ROOT) {
    return process.env.REPO_ROOT
  }

  try {
    const { stdout } = await execFileAsync('git', [
      'rev-parse',
      '--show-toplevel'
    ])
    return stdout.trim()
  } catch {
    // Fallback to script location
    return join(dirname(fileURLToPath(import.meta.url)), '..', '..')
  }
}

const REPO_ROOT = await getRepoRoot()
// Set repo root for git history analysis
setRepoRoot(REPO_ROOT)
const BLOG_LEGACY_DIR = join(REPO_ROOT, 'apps/blog-legacy/blog')

// Supabase client (initialized only if not in dry-run mode)
let supabase: ReturnType<typeof createClient<Database>> | null = null

function initSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase credentials not found')
    console.error(
      'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY'
    )
    console.error(
      'Note: SUPABASE_SERVICE_KEY is required for migration (not NEXT_PUBLIC_SUPABASE_ANON_KEY)'
    )
    process.exit(1)
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Recursively find all MDX files in a directory
 */
async function findMDXFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      const subFiles = await findMDXFiles(fullPath)
      files.push(...subFiles)
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Extract slug from file path
 * Example: apps/blog-legacy/blog/2022/11/03/bought-ps5/index.mdx -> bought-ps5
 */
function extractSlug(filePath: string): string {
  const relativePath = relative(BLOG_LEGACY_DIR, filePath)
  // Normalize path separators to forward slash for consistency across platforms
  const normalizedPath = relativePath.split(sep).join('/')
  const parts = normalizedPath.split('/')

  // Expected format: YYYY/MM/DD/slug/index.mdx
  if (parts.length >= 5 && parts[4] === 'index.mdx') {
    return parts[3]
  }

  if (parts.length >= 2 && parts[parts.length - 1] === 'index.mdx') {
    return parts[parts.length - 2]
  }

  // Fallback
  const withoutIndex = normalizedPath.replace(/\/index\.mdx$/, '')
  const lastSegment = withoutIndex.split('/').pop()
  return lastSegment ? lastSegment.replace(/\.mdx$/, '') : normalizedPath
}

/**
 * Extract date parts (year, month, day) from file path
 * Example: apps/blog-legacy/blog/2022/11/03/bought-ps5/index.mdx -> { year: '2022', month: '11', day: '03' }
 */
function extractDateFromPath(
  filePath: string
): { year: string; month: string; day: string } | null {
  const relativePath = relative(BLOG_LEGACY_DIR, filePath)
  const normalizedPath = relativePath.split(sep).join('/')
  const parts = normalizedPath.split('/')

  // Expected format: YYYY/MM/DD/slug/index.mdx
  if (parts.length >= 5 && parts[4] === 'index.mdx') {
    return {
      day: parts[2],
      month: parts[1],
      year: parts[0]
    }
  }

  return null
}

/**
 * Extract version number from title
 * Examples:
 *   "w3c-xmlhttprequest v3.0.0をリリースしました" -> "v3"
 *   "Version 2.1.0 Released" -> "v2"
 *   "Something 1.0" -> "v1"
 */
function extractVersionFromTitle(title: string): string | null {
  // Match patterns like "v3.0.0", "version 2.1", "1.0.0", etc.
  const patterns = [
    /\bv(\d+)\.\d+/i, // v3.0.0, v2.1
    /\bversion\s+(\d+)\.\d+/i, // version 3.0, Version 2.1
    /\b(\d+)\.\d+\.\d+/i // 3.0.0, 2.1.0
  ]

  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) {
      return `v${match[1]}`
    }
  }

  return null
}

/**
 * Detect and resolve slug duplicates
 */
async function resolveDuplicateSlugs(
  mdxFiles: string[]
): Promise<
  Map<
    string,
    { slug: string; redirectFrom: string[]; filePath: string; title: string }
  >
> {
  const slugMap = new Map<
    string,
    Array<{
      filePath: string
      dateParts: { year: string; month: string; day: string } | null
      originalSlug: string
    }>
  >()

  // Group files by slug
  for (const filePath of mdxFiles) {
    const slug = extractSlug(filePath)
    const dateParts = extractDateFromPath(filePath)

    if (!slugMap.has(slug)) {
      slugMap.set(slug, [])
    }
    slugMap.get(slug)!.push({ dateParts, filePath, originalSlug: slug })
  }

  const result = new Map<
    string,
    { slug: string; redirectFrom: string[]; filePath: string; title: string }
  >()

  // Process each slug group
  for (const [originalSlug, files] of slugMap.entries()) {
    if (files.length === 1) {
      // No duplicates
      const file = files[0]
      result.set(file.filePath, {
        filePath: file.filePath,
        redirectFrom: [],
        slug: originalSlug,
        title: ''
      })
    } else {
      // Has duplicates - need to resolve
      // Sort by date (oldest first)
      files.sort((a, b) => {
        if (!a.dateParts || !b.dateParts) return 0
        const dateA = `${a.dateParts.year}-${a.dateParts.month}-${a.dateParts.day}`
        const dateB = `${b.dateParts.year}-${b.dateParts.month}-${b.dateParts.day}`
        return dateA.localeCompare(dateB)
      })

      // Read titles from files to extract version info
      const { parseMDX } = await import('./lib/parse-mdx.ts')

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        let newSlug = originalSlug
        let redirectFrom: string[] = []

        try {
          const parsed = await parseMDX(file.filePath)
          const title = parsed.frontmatter.title || ''

          if (i === 0) {
            // First occurrence keeps original slug
            result.set(file.filePath, {
              filePath: file.filePath,
              redirectFrom: [],
              slug: originalSlug,
              title
            })
          } else {
            // Try to extract version from title
            const version = extractVersionFromTitle(title)

            if (version) {
              newSlug = `${originalSlug}-${version}`
            } else {
              // Use sequential numbering
              newSlug = `${originalSlug}-${i + 1}`
            }

            // Generate redirect_from path
            if (file.dateParts) {
              const { year, month, day } = file.dateParts
              redirectFrom = [`/blog/${year}/${month}/${day}/${originalSlug}`]
            }

            result.set(file.filePath, {
              filePath: file.filePath,
              redirectFrom,
              slug: newSlug,
              title
            })
          }
        } catch (error) {
          console.warn(
            `Warning: Could not parse ${file.filePath} for duplicate resolution`
          )
          // Fallback to sequential numbering
          if (i > 0) {
            newSlug = `${originalSlug}-${i + 1}`
            if (file.dateParts) {
              const { year, month, day } = file.dateParts
              redirectFrom = [`/blog/${year}/${month}/${day}/${originalSlug}`]
            }
          }

          result.set(file.filePath, {
            filePath: file.filePath,
            redirectFrom,
            slug: newSlug,
            title: ''
          })
        }
      }
    }
  }

  return result
}

/**
 * Main migration function
 */
async function migrate(dryRun = false) {
  // Initialize Supabase client if not in dry-run mode
  if (!dryRun) {
    supabase = initSupabase()
  }

  const userId = process.env.MIGRATION_USER_ID
  let profileId = process.env.MIGRATION_PROFILE_ID
  const uploadedUrls = new Map<string, string>()

  if (!dryRun) {
    if (!supabase) {
      console.error('Error: Supabase client is not initialized')
      process.exit(1)
    }

    if (!userId) {
      console.error('Error: MIGRATION_USER_ID is required')
      console.error(
        'Please set MIGRATION_USER_ID to the auth.users.id for this migration'
      )
      process.exit(1)
    }

    // Auto-fetch profile_id from user_id if not explicitly provided
    if (!profileId) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (profileError) {
        throw profileError
      }

      if (!profile) {
        console.error(
          `Error: No profile found for MIGRATION_USER_ID: ${userId}`
        )
        console.error(
          'Please ensure the user has a corresponding profile in the profiles table'
        )
        process.exit(1)
      }

      profileId = profile.id
      console.log(`ℹ️  Auto-detected profile_id: ${profileId}`)
    }
  }

  console.log('🔍 Scanning for MDX files...')
  const mdxFiles = await findMDXFiles(BLOG_LEGACY_DIR)
  console.log(`Found ${mdxFiles.length} MDX files\n`)

  console.log('🔍 Resolving slug duplicates...')
  const slugResolutionMap = await resolveDuplicateSlugs(mdxFiles)
  console.log('✅ Slug resolution complete\n')

  let totalVersions = 0
  let filesWithMultipleVersions = 0
  let filesProcessed = 0
  let errors = 0

  for (const filePath of mdxFiles) {
    const relativePath = relative(REPO_ROOT, filePath)
    const resolution = slugResolutionMap.get(filePath)

    if (!resolution) {
      console.warn(`⚠️  No slug resolution found for ${relativePath}`)
      continue
    }

    const { slug, redirectFrom } = resolution
    const originalSlug = extractSlug(filePath)

    try {
      console.log(`\n📄 Processing: ${relativePath}`)
      console.log(`   Slug: ${slug}`)
      if (slug !== originalSlug) {
        console.log(`   Original slug: ${originalSlug} (adjusted)`)
        console.log(`   Redirect from: ${redirectFrom.join(', ')}`)
      }

      // Generate versions from Git history
      const versions = await generateVersionsFromHistory(relativePath)
      console.log(`   Found ${versions.length} version(s)`)

      if (versions.length === 0) {
        console.log(
          `   ⚠️  No versions found (file might not be in Git history)`
        )
        continue
      }

      if (versions.length > 1) {
        filesWithMultipleVersions++
      }

      totalVersions += versions.length

      // Display version info
      for (const version of versions) {
        console.log(`   Version ${version.versionNumber}:`)
        console.log(`     Date: ${version.versionDate.toISOString()}`)
        console.log(`     Title: ${version.frontmatter.title}`)
        console.log(
          `     Tags: ${version.frontmatter.tags?.join(', ') || 'none'}`
        )

        if (dryRun) {
          console.log(`     [DRY RUN] Would insert into database`)
        }
      }

      if (!dryRun && supabase) {
        const latestVersion = versions[versions.length - 1]
        const initialVersion = versions[0]
        const publishedAt = initialVersion.versionDate.toISOString()

        const { data: existingPost, error: existingPostError } = await supabase
          .from('posts')
          .select('id')
          .eq('slug', slug)
          .maybeSingle()

        if (existingPostError) {
          throw existingPostError
        }

        let postId = existingPost?.id

        if (!postId) {
          // Extract excerpt from latest version for post record
          const postExcerpt = extractExcerpt(latestVersion.content)

          const { data: insertedPost, error: insertPostError } = await supabase
            .from('posts')
            .insert({
              excerpt: postExcerpt,
              profile_id: profileId,
              published_at: publishedAt,
              redirect_from: redirectFrom.length > 0 ? redirectFrom : null,
              slug,
              status: 'published',
              tags: latestVersion.frontmatter.tags || null,
              title: latestVersion.frontmatter.title || null
            })
            .select('id')
            .single()

          if (insertPostError) {
            throw insertPostError
          }
          if (!insertedPost) {
            throw new Error(`Failed to insert post with slug ${slug}`)
          }

          postId = insertedPost.id
        }

        const versionRecords = []

        for (const version of versions) {
          let contentForInsert = version.content

          // Upload images and transform image URLs in content
          if (userId) {
            const images = await detectImages(version.content, filePath)

            if (images.length > 0) {
              for (const image of images) {
                if (!image.exists) {
                  console.warn(
                    `     ⚠️  Image not found: ${image.path} (${relativePath})`
                  )
                  continue
                }

                if (!uploadedUrls.has(image.absolutePath)) {
                  const uploadedUrl = await uploadImage(
                    image,
                    userId,
                    false,
                    supabase
                  )

                  if (uploadedUrl) {
                    uploadedUrls.set(image.absolutePath, uploadedUrl)
                  }
                }
              }

              const mappings = createImageMappings(images, uploadedUrls)
              if (mappings.length > 0) {
                contentForInsert = transformMDXContent(
                  version.content,
                  mappings
                )
              }
            }
          }

          // Extract excerpt from content
          const excerpt = extractExcerpt(contentForInsert)

          // Convert MDX to Portable Text
          const portableTextContent = convertMDXToPortableText(contentForInsert)

          versionRecords.push({
            change_summary: version.commitMessage,
            content: portableTextContent,
            created_by: profileId,
            excerpt,
            post_id: postId,
            tags: version.frontmatter.tags || null,
            title: version.frontmatter.title || null,
            version_date: version.versionDate.toISOString(),
            version_number: version.versionNumber
          })
        }

        const { error: upsertError } = await supabase
          .from('post_versions')
          .upsert(versionRecords, {
            onConflict: 'post_id,version_number'
          })

        if (upsertError) {
          throw upsertError
        }

        const { data: allVersions, error: versionsError } = await supabase
          .from('post_versions')
          .select('id, version_number')
          .eq('post_id', postId)

        if (versionsError || !allVersions?.length) {
          throw (
            versionsError ??
            new Error(`no post_versions found for postId ${postId}`)
          )
        }

        const currentVersion = allVersions.reduce((latest, candidate) => {
          return candidate.version_number > latest.version_number
            ? candidate
            : latest
        })

        // Extract excerpt from latest version for post update
        const postExcerpt = extractExcerpt(latestVersion.content)

        const { error: updatePostError } = await supabase
          .from('posts')
          .update({
            current_version_id: currentVersion.id,
            excerpt: postExcerpt,
            published_at: publishedAt,
            status: 'published',
            tags: latestVersion.frontmatter.tags || null,
            title: latestVersion.frontmatter.title || null
          })
          .eq('id', postId)

        if (updatePostError) {
          throw updatePostError
        }

        console.log('     ✅ Inserted post and versions')
      }

      filesProcessed++
    } catch (error) {
      console.error(`   ❌ Error processing ${relativePath}:`, error)
      errors++
    }
  }

  // Summary
  console.log(`\n\n${'='.repeat(60)}`)
  console.log('📊 Migration Summary')
  console.log('='.repeat(60))
  console.log(`Total files found:              ${mdxFiles.length}`)
  console.log(`Files processed:                ${filesProcessed}`)
  console.log(`Files with multiple versions:   ${filesWithMultipleVersions}`)
  console.log(`Total versions generated:       ${totalVersions}`)
  console.log(`Errors:                         ${errors}`)

  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No data was written to database')
  }
}

// Run migration
const dryRun = process.argv.includes('--dry-run')
migrate(dryRun).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
