import { describe, expect, it } from 'vitest'
import type { GitCommit } from '../lib/analyze-git-history.ts'
import { detectLastUpdateChanges } from '../lib/analyze-git-history.ts'

describe('detectLastUpdateChanges', () => {
  it('should detect when last_update.date is added', () => {
    const commits: GitCommit[] = [
      {
        content: 'Updated content',
        date: new Date('2024-12-07'),
        frontmatter: {
          date: '2022-11-03T21:45:00+09:00',
          last_update: {
            date: '2024-12-07T12:00:00+09:00'
          }
        },
        hash: 'commit3',
        message: 'Update post'
      },
      {
        content: 'Some content',
        date: new Date('2023-01-01'),
        frontmatter: {
          date: '2022-11-03T21:45:00+09:00'
        },
        hash: 'commit2',
        message: 'Minor fix'
      },
      {
        content: 'Initial content',
        date: new Date('2022-11-03'),
        frontmatter: {
          date: '2022-11-03T21:45:00+09:00'
        },
        hash: 'commit1',
        message: 'Initial post'
      }
    ]

    const changes = detectLastUpdateChanges(commits)

    // Should detect the commit where last_update was added
    expect(changes).toHaveLength(1)
    expect(changes[0].hash).toBe('commit3')
    expect(changes[0].frontmatter.last_update?.date).toBe(
      '2024-12-07T12:00:00+09:00'
    )
  })

  it('should detect multiple last_update.date changes', () => {
    const commits: GitCommit[] = [
      {
        content: 'Latest content',
        date: new Date('2024-12-07'),
        frontmatter: {
          date: '2022-11-03T21:45:00+09:00',
          last_update: {
            date: '2024-12-07T12:00:00+09:00'
          }
        },
        hash: 'commit4',
        message: 'Update 2'
      },
      {
        content: 'Updated content',
        date: new Date('2023-06-15'),
        frontmatter: {
          date: '2022-11-03T21:45:00+09:00',
          last_update: {
            date: '2023-06-15T10:00:00+09:00'
          }
        },
        hash: 'commit3',
        message: 'Update 1'
      },
      {
        content: 'Some content',
        date: new Date('2023-01-01'),
        frontmatter: {
          date: '2022-11-03T21:45:00+09:00'
        },
        hash: 'commit2',
        message: 'Minor fix'
      },
      {
        content: 'Initial content',
        date: new Date('2022-11-03'),
        frontmatter: {
          date: '2022-11-03T21:45:00+09:00'
        },
        hash: 'commit1',
        message: 'Initial post'
      }
    ]

    const changes = detectLastUpdateChanges(commits)

    // Should detect both commits where last_update was added or changed
    expect(changes).toHaveLength(2)
    expect(changes[0].hash).toBe('commit3')
    expect(changes[0].frontmatter.last_update?.date).toBe(
      '2023-06-15T10:00:00+09:00'
    )
    expect(changes[1].hash).toBe('commit4')
    expect(changes[1].frontmatter.last_update?.date).toBe(
      '2024-12-07T12:00:00+09:00'
    )
  })

  it('should return empty array when last_update never changed', () => {
    const commits: GitCommit[] = [
      {
        content: 'Some content',
        date: new Date('2023-01-01'),
        frontmatter: {
          date: '2022-11-03T21:45:00+09:00'
        },
        hash: 'commit2',
        message: 'Minor fix'
      },
      {
        content: 'Initial content',
        date: new Date('2022-11-03'),
        frontmatter: {
          date: '2022-11-03T21:45:00+09:00'
        },
        hash: 'commit1',
        message: 'Initial post'
      }
    ]

    const changes = detectLastUpdateChanges(commits)

    expect(changes).toHaveLength(0)
  })

  it('should handle empty commits array', () => {
    const commits: GitCommit[] = []

    const changes = detectLastUpdateChanges(commits)

    expect(changes).toHaveLength(0)
  })
})
