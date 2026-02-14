import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { Frontmatter } from './parse-mdx'
import { parseMDXContent } from './parse-mdx'

const execFileAsync = promisify(execFile)

// Repository root - will be set by the migration script
export let REPO_ROOT = process.cwd()

export function setRepoRoot(root: string) {
  REPO_ROOT = root
}

export interface GitCommit {
  hash: string
  date: Date
  message: string
  frontmatter: Frontmatter
  content: string
}

/**
 * Get Git commit history for a specific file
 * @param filePath - Path to the file relative to repository root
 * @returns Array of commits with parsed frontmatter and content
 */
export async function getFileHistory(filePath: string): Promise<GitCommit[]> {
  try {
    // Get all commits that affected this file (using %aI for strict ISO 8601 dates)
    const { stdout: logOutput } = await execFileAsync(
      'git',
      ['log', '--all', '--format=%H|%aI|%s', '--follow', '--', filePath],
      { cwd: REPO_ROOT }
    )

    if (!logOutput.trim()) {
      return []
    }

    const commits: GitCommit[] = []
    const commitLines = logOutput.trim().split('\n')

    for (const line of commitLines) {
      const [hash, dateStr, ...messageParts] = line.split('|')
      const message = messageParts.join('|')

      // Get file content at this commit
      try {
        const { stdout: content } = await execFileAsync(
          'git',
          ['show', `${hash}:${filePath}`],
          { cwd: REPO_ROOT }
        )

        // Parse MDX content
        try {
          const parsed = parseMDXContent(content)

          commits.push({
            content: parsed.content,
            date: new Date(dateStr),
            frontmatter: parsed.frontmatter,
            hash,
            message
          })
        } catch (parseError) {
          // Content exists at this commit but could not be parsed
          console.error(
            `Failed to parse MDX content for ${filePath} at commit ${hash}:`,
            parseError
          )
        }
      } catch (gitError) {
        // File might not exist in this commit (e.g., it was deleted then re-added)
        console.warn(
          `Could not get content for ${filePath} at commit ${hash}:`,
          gitError
        )
      }
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
    const currentLastUpdate = commit.frontmatter.last_update?.date

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
 * Creates additional versions when last_update.date changes
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
  const initialDate = firstCommit.frontmatter.date
    ? new Date(firstCommit.frontmatter.date)
    : firstCommit.date

  versions.push({
    commitHash: firstCommit.hash,
    commitMessage: firstCommit.message,
    content: firstCommit.content,
    frontmatter: firstCommit.frontmatter,
    versionDate: initialDate,
    versionNumber: 1
  })

  // Track changes to last_update.date
  let previousLastUpdate = firstCommit.frontmatter.last_update?.date
  let versionNumber = 2

  for (let i = 1; i < chronological.length; i++) {
    const commit = chronological[i]
    const currentLastUpdate = commit.frontmatter.last_update?.date

    // If last_update.date changed
    if (currentLastUpdate && currentLastUpdate !== previousLastUpdate) {
      versions.push({
        commitHash: commit.hash,
        commitMessage: commit.message,
        content: commit.content,
        frontmatter: commit.frontmatter,
        versionDate: new Date(currentLastUpdate),
        versionNumber: versionNumber++
      })
      previousLastUpdate = currentLastUpdate
    }
  }

  return versions
}
