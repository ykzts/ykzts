'use client'

import { useCallback, useState } from 'react'
import DateDisplay from './date-display'

type Version = {
  change_summary: string | null
  id: string
  plainText: string
  version_date: string
  version_number: number
}

type DiffLine = {
  key: string
  text: string
  type: 'added' | 'removed' | 'unchanged'
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')

  const m = oldLines.length
  const n = newLines.length

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const result: DiffLine[] = []
  let i = m
  let j = n
  let lineNum = 0

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({
        key: `u-${lineNum++}`,
        text: oldLines[i - 1],
        type: 'unchanged'
      })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({
        key: `a-${lineNum++}`,
        text: newLines[j - 1],
        type: 'added'
      })
      j--
    } else {
      result.unshift({
        key: `r-${lineNum++}`,
        text: oldLines[i - 1],
        type: 'removed'
      })
      i--
    }
  }

  return result
}

type VersionCompareProps = {
  versions: Version[]
}

export default function VersionCompare({ versions }: VersionCompareProps) {
  const [selectedIds, setSelectedIds] = useState<[string, string] | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const handleSelect = useCallback(
    (id: string) => {
      if (selectedIds) {
        setSelectedIds(null)
        setPendingId(id)
        return
      }
      if (pendingId === null) {
        setPendingId(id)
        return
      }
      if (pendingId === id) {
        setPendingId(null)
        return
      }
      setSelectedIds([pendingId, id])
      setPendingId(null)
    },
    [selectedIds, pendingId]
  )

  const isChecked = useCallback(
    (id: string) => {
      return pendingId === id || (selectedIds?.includes(id) ?? false)
    },
    [pendingId, selectedIds]
  )

  const diffResult =
    selectedIds !== null
      ? (() => {
          const vA = versions.find((v) => v.id === selectedIds[0])
          const vB = versions.find((v) => v.id === selectedIds[1])
          if (!vA || !vB) return null

          const [older, newer] =
            vA.version_number < vB.version_number ? [vA, vB] : [vB, vA]

          return {
            diff: computeDiff(older.plainText, newer.plainText),
            newerVersion: newer,
            olderVersion: older
          }
        })()
      : null

  return (
    <div>
      <ol className="space-y-4">
        {versions.map((version, index) => (
          <li className="rounded border border-border p-4" key={version.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <input
                  aria-label={
                    isChecked(version.id)
                      ? `バージョン ${version.version_number} の比較対象選択を解除`
                      : `バージョン ${version.version_number} を比較対象として選択`
                  }
                  checked={isChecked(version.id)}
                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                  id={`version-${version.id}`}
                  onChange={() => handleSelect(version.id)}
                  type="checkbox"
                />
                <label
                  className="cursor-pointer"
                  htmlFor={`version-${version.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      バージョン {version.version_number}
                    </span>
                    {index === 0 && (
                      <span className="rounded bg-primary px-2 py-0.5 text-primary-foreground text-xs">
                        最新
                      </span>
                    )}
                  </div>
                  <DateDisplay
                    className="mt-1 text-muted-foreground text-sm"
                    date={version.version_date}
                  />
                  {version.change_summary && (
                    <p className="mt-2 text-sm">{version.change_summary}</p>
                  )}
                </label>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {pendingId !== null && selectedIds === null && (
        <p className="mt-4 text-muted-foreground text-sm">
          比較するもう一つのバージョンを選択してください。
        </p>
      )}

      {diffResult !== null && (
        <section aria-label="バージョン比較結果" className="mt-8">
          <h2 className="mb-4 font-bold text-xl">
            バージョン比較: v{diffResult.olderVersion.version_number} → v
            {diffResult.newerVersion.version_number}
          </h2>
          <div className="overflow-x-auto rounded border border-border">
            <div className="flex gap-4 border-border border-b bg-muted px-4 py-2 text-muted-foreground text-sm">
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-sm bg-red-200 dark:bg-red-900"
                />
                v{diffResult.olderVersion.version_number} (
                <DateDisplay date={diffResult.olderVersion.version_date} />)
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-sm bg-green-200 dark:bg-green-900"
                />
                v{diffResult.newerVersion.version_number} (
                <DateDisplay date={diffResult.newerVersion.version_date} />)
              </span>
            </div>
            <pre className="overflow-x-auto p-0 text-sm">
              {diffResult.diff.map((line) => (
                <div
                  className={
                    line.type === 'added'
                      ? 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100'
                      : line.type === 'removed'
                        ? 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100'
                        : 'bg-transparent'
                  }
                  key={line.key}
                >
                  <span
                    aria-hidden="true"
                    className="inline-block w-6 select-none text-center opacity-60"
                  >
                    {line.type === 'added'
                      ? '+'
                      : line.type === 'removed'
                        ? '-'
                        : ' '}
                  </span>
                  <span className="px-2">{line.text}</span>
                </div>
              ))}
            </pre>
          </div>
          <button
            aria-label="バージョン比較をリセット"
            className="mt-4 text-muted-foreground text-sm underline-offset-2 hover:text-foreground hover:underline"
            onClick={() => setSelectedIds(null)}
            type="button"
          >
            比較をリセット
          </button>
        </section>
      )}
    </div>
  )
}
