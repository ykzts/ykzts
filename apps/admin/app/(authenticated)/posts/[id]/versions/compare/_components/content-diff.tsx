'use client'

import { diffLines } from 'diff'
import { useMemo } from 'react'

interface ContentDiffProps {
  newContent: string
  oldContent: string
  version1Number: number
  version2Number: number
}

export function ContentDiff({
  newContent,
  oldContent,
  version1Number,
  version2Number
}: ContentDiffProps) {
  const diff = useMemo(() => {
    return diffLines(oldContent, newContent)
  }, [oldContent, newContent])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-500" />
          <span className="text-muted-foreground">
            v{version1Number} (削除)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-500" />
          <span className="text-muted-foreground">
            v{version2Number} (追加)
          </span>
        </div>
      </div>

      <div className="overflow-auto rounded border border-border bg-muted/30">
        <pre className="p-4 text-sm">
          {diff.map((part, index) => {
            const lines = part.value.split('\n')
            // Remove empty last line caused by split
            if (lines[lines.length - 1] === '') {
              lines.pop()
            }

            return lines.map((line, lineIndex) => {
              const key = `${index}-${lineIndex}`
              if (part.added) {
                return (
                  <div
                    className="bg-green-100 text-green-900 dark:bg-green-950/40 dark:text-green-100"
                    key={key}
                  >
                    <span className="select-none text-green-600 dark:text-green-400">
                      +{' '}
                    </span>
                    {line || ' '}
                  </div>
                )
              }
              if (part.removed) {
                return (
                  <div
                    className="bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-100"
                    key={key}
                  >
                    <span className="select-none text-red-600 dark:text-red-400">
                      -{' '}
                    </span>
                    {line || ' '}
                  </div>
                )
              }
              return (
                <div key={key}>
                  <span className="select-none text-muted-foreground"> </span>
                  {line || ' '}
                </div>
              )
            })
          })}
        </pre>
      </div>
    </div>
  )
}
