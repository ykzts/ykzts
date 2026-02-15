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
 *   MIGRATION_PROFILE_ID  post_versions.created_byに使うprofiles.id
 *   MIGRATION_USER_ID     画像アップロード先パスに使うauth.users.id
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
 * Main migration function
 */
async function migrate(dryRun = false) {
  // Initialize Supabase client if not in dry-run mode
  if (!dryRun) {
    supabase = initSupabase()
  }

  let profileId = process.env.MIGRATION_PROFILE_ID
  const userId = process.env.MIGRATION_USER_ID
  const uploadedUrls = new Map<string, string>()

  if (!dryRun) {
    if (!supabase) {
      console.error('Error: Supabase client is not initialized')
      process.exit(1)
    }

    if (!profileId && userId) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (profileError) {
        throw profileError
      }

      profileId = profile?.id
    }

    if (!profileId) {
      console.error(
        'Error: MIGRATION_PROFILE_ID is required (or MIGRATION_USER_ID mapped to a profile)'
      )
      process.exit(1)
    }

    if (!userId) {
      console.error('Error: MIGRATION_USER_ID is required for image uploads')
      process.exit(1)
    }
  }

  console.log('🔍 Scanning for MDX files...')
  const mdxFiles = await findMDXFiles(BLOG_LEGACY_DIR)
  console.log(`Found ${mdxFiles.length} MDX files\n`)

  let totalVersions = 0
  let filesWithMultipleVersions = 0
  let filesProcessed = 0
  let errors = 0

  for (const filePath of mdxFiles) {
    const relativePath = relative(REPO_ROOT, filePath)
    const slug = extractSlug(filePath)

    try {
      console.log(`\n📄 Processing: ${relativePath}`)
      console.log(`   Slug: ${slug}`)

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
              slug,
              status: 'published',
              tags: latestVersion.frontmatter.tags || null,
              title: latestVersion.frontmatter.title || null
            })
            .select('id')
            .single()

          if (insertPostError || !insertedPost) {
            throw insertPostError
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
