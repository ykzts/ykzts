import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { Frontmatter } from './parse-mdx.ts'
import { parseMDXContent } from './parse-mdx.ts'

const execFileAsync = promisify(execFile)

// Repository root - will be set by the migration script
export let REPO_ROOT = process.cwd()

export function setRepoRoot(root: string) {
  REPO_ROOT = root
}

/**
 * Normalize content for comparison by removing formatting differences
 * This helps compare content while ignoring whitespace, line breaks, etc.
 */
function normalizeContent(content: string): string {
  return (
    content
      .replace(/\r\n/g, '\n') // Normalize line endings
      // Normalize truncate markers (both HTML and MDX style)
      .replace(/<!--\s*truncate\s*-->/gi, '{/* truncate */}')
      .replace(/\{\s*\/\*\s*truncate\s*\*\/\s*\}/gi, '{/* truncate */}')
      // Normalize HTML comments to MDX comments (handles multi-line)
      .replace(/<!--\s*([\s\S]*?)\s*-->/g, '{/* $1 */}')
      .replace(/[ \t]+$/gm, '') // Remove trailing whitespace
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .replace(/\s+/g, ' ') // Collapse all whitespace
      .trim()
  )
}

function isFormatCommit(message: string): boolean {
  // Detects format commits including historical typo 'pnpm fomat'
  return /(pnpm\s+fomat|pnpm\s+format|\bformat\b)/i.test(message)
}

function getLastUpdateValue(frontmatter: Frontmatter): string | undefined {
  return frontmatter.last_update?.date ?? frontmatter.lastmod
}

/**
 * Check if content has meaningful changes compared to previous content
 */
function hasSignificantContentChange(
  currentContent: string,
  previousContent: string
): boolean {
  const normalized1 = normalizeContent(currentContent)
  const normalized2 = normalizeContent(previousContent)
  return normalized1 !== normalized2
}

/**
 * Check if frontmatter has meaningful changes (title, tags, etc.)
 */
function hasSignificantFrontmatterChange(
  currentFrontmatter: Frontmatter,
  previousFrontmatter: Frontmatter
): boolean {
  // Check title change
  if (currentFrontmatter.title !== previousFrontmatter.title) {
    return true
  }

  // Check tags change
  const currentTags = currentFrontmatter.tags?.slice().sort().join(',') || ''
  const previousTags = previousFrontmatter.tags?.slice().sort().join(',') || ''
  if (currentTags !== previousTags) {
    return true
  }

  return false
}

export interface GitCommit {
  hash: string
  date: Date
  message: string
  frontmatter: Frontmatter
  content: string
}

async function processCommit(
  commit: { hash: string; date: string; message: string; filePath: string },
  commits: GitCommit[]
): Promise<void> {
  try {
    const { stdout: fileContent } = await execFileAsync(
      'git',
      ['show', `${commit.hash}:${commit.filePath}`],
      { cwd: REPO_ROOT, maxBuffer: 1024 * 1024 * 10 }
    )
    const parsed = parseMDXContent(fileContent)
    commits.push({
      content: parsed.content,
      date: new Date(commit.date),
      frontmatter: parsed.frontmatter,
      hash: commit.hash,
      message: commit.message
    })
  } catch {
    console.warn(`Warning: Could not read ${commit.filePath} at ${commit.hash}`)
  }
}

export async function getFileHistory(filePath: string): Promise<GitCommit[]> {
  try {
    // Get all commits that affected this file with file names at each commit
    // --follow enables rename detection
    // --name-status shows the status (M=modified, R=renamed) and file paths
    const { stdout: logOutput } = await execFileAsync(
      'git',
      [
        'log',
        '--all',
        '--format=COMMIT:%H|%aI|%s',
        '--follow',
        '--find-renames',
        '--name-status',
        '--',
        filePath
      ],
      { cwd: REPO_ROOT }
    )

    if (!logOutput.trim()) {
      return []
    }

    const commits: GitCommit[] = []
    const lines = logOutput.trim().split('\n')

    let currentCommit: {
      hash: string
      date: string
      message: string
      filePath?: string
    } | null = null

    for (const line of lines) {
      if (line.startsWith('COMMIT:')) {
        // Save previous commit if exists
        if (currentCommit?.filePath) {
          await processCommit(currentCommit, commits)
        }

        // Parse new commit
        const commitData = line.substring(7) // Remove "COMMIT:"
        const [hash, dateStr, ...messageParts] = commitData.split('|')
        currentCommit = {
          date: dateStr,
          hash,
          message: messageParts.join('|')
        }
      } else if (line.trim() && currentCommit) {
        // Parse file status line (e.g., "M\tpath/to/file.mdx" or "R100\told/path.mdx\tnew/path.mdx")
        const parts = line.split('\t')
        const status = parts[0]

        if (status.startsWith('R')) {
          // Renamed: use the new path (the file path after this commit)
          // parts[1] = old path, parts[2] = new path
          currentCommit.filePath = parts[2]
        } else {
          // Modified, Added, etc.: use the path
          if (parts[1]) {
            currentCommit.filePath = parts[1]
          }
        }
      }
    }

    // Process last commit
    if (currentCommit?.filePath) {
      await processCommit(currentCommit, commits)
    }

    return commits
  } catch (error) {
    console.error(`Error getting history for ${filePath}:`, error)
    return []
  }
}

/**
 * Detect when last_update.date changed in the file history
 * @param commits - Array of commits in reverse chronological order (newest first)
 * @returns Array of commits where last_update.date changed or was added
 */
export function detectLastUpdateChanges(commits: GitCommit[]): GitCommit[] {
  const changes: GitCommit[] = []
  let previousLastUpdate: string | undefined

  // Process commits in chronological order (oldest first)
  const chronological = [...commits].reverse()

  for (const commit of chronological) {
    const currentLastUpdate = getLastUpdateValue(commit.frontmatter)

    // If last_update.date changed or was added
    if (currentLastUpdate !== previousLastUpdate) {
      changes.push(commit)
      previousLastUpdate = currentLastUpdate
    }
  }

  return changes
}

/**
 * Generate versions from Git history
 * Creates version 1 from initial commit (using date field as version_date)
 * Creates additional versions when last_update.date changes AND content has meaningful changes
 * @param filePath - Path to the file relative to repository root
 * @returns Array of version data with version_date
 */
export async function generateVersionsFromHistory(filePath: string): Promise<
  Array<{
    versionNumber: number
    versionDate: Date
    frontmatter: Frontmatter
    content: string
    commitHash: string
    commitMessage: string
  }>
> {
  const commits = await getFileHistory(filePath)

  if (commits.length === 0) {
    return []
  }

  const versions: Array<{
    versionNumber: number
    versionDate: Date
    frontmatter: Frontmatter
    content: string
    commitHash: string
    commitMessage: string
  }> = []

  // Sort commits chronologically (oldest first)
  const chronological = [...commits].reverse()

  // Version 1: Initial commit with date field as version_date
  const firstCommit = chronological[0]
  const initialDate =
    firstCommit.frontmatter.date ||
    firstCommit.frontmatter.publishdate ||
    firstCommit.frontmatter.publishDate
      ? new Date(
          firstCommit.frontmatter.date ||
            firstCommit.frontmatter.publishdate ||
            firstCommit.frontmatter.publishDate
        )
      : firstCommit.date

  versions.push({
    commitHash: firstCommit.hash,
    commitMessage: firstCommit.message,
    content: firstCommit.content,
    frontmatter: firstCommit.frontmatter,
    versionDate: initialDate,
    versionNumber: 1
  })

  // Track changes to last_update.date and content
  let previousLastUpdate = getLastUpdateValue(firstCommit.frontmatter)
  let previousContent = firstCommit.content
  let previousFrontmatter = firstCommit.frontmatter
  let versionNumber = 2

  for (let i = 1; i < chronological.length; i++) {
    const commit = chronological[i]
    const currentLastUpdate = getLastUpdateValue(commit.frontmatter)
    const hasContentChange = hasSignificantContentChange(
      commit.content,
      previousContent
    )
    const hasFrontmatterChange = hasSignificantFrontmatterChange(
      commit.frontmatter,
      previousFrontmatter
    )
    const hasLastUpdateChange = currentLastUpdate !== previousLastUpdate

    if (
      isFormatCommit(commit.message) &&
      !hasContentChange &&
      !hasFrontmatterChange &&
      !hasLastUpdateChange
    ) {
      continue
    }

    // Create a new version if any meaningful change is detected
    if (hasContentChange || hasFrontmatterChange || hasLastUpdateChange) {
      versions.push({
        commitHash: commit.hash,
        commitMessage: commit.message,
        content: commit.content,
        frontmatter: commit.frontmatter,
        versionDate: currentLastUpdate
          ? new Date(currentLastUpdate)
          : commit.date,
        versionNumber: versionNumber++
      })
      previousLastUpdate = currentLastUpdate
      previousContent = commit.content
      previousFrontmatter = commit.frontmatter
    }
  }

  return versions
}
