import { Panel } from '@/components/panel'

export function ProfilePageSkeleton() {
  return (
    <Panel>
      <div className="space-y-4">
        {/* 名前 */}
        <div>
          <div className="mb-1 h-5 w-12 animate-pulse rounded bg-muted/20" />
          <div className="h-7 w-40 animate-pulse rounded bg-muted/20" />
        </div>

        {/* タイムゾーン */}
        <div>
          <div className="mb-1 h-5 w-28 animate-pulse rounded bg-muted/20" />
          <div className="h-6 w-40 animate-pulse rounded bg-muted/20" />
        </div>

        {/* ソーシャルリンク */}
        <div>
          <div className="mb-2 h-5 w-40 animate-pulse rounded bg-muted/20" />
          <div className="space-y-1">
            {[0, 1, 2].map((i) => (
              <div
                className="h-5 w-56 animate-pulse rounded bg-muted/20"
                key={`social-${i}`}
              />
            ))}
          </div>
        </div>

        {/* 技術タグ */}
        <div>
          <div className="mb-2 h-5 w-24 animate-pulse rounded bg-muted/20" />
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                className="h-7 w-20 animate-pulse rounded bg-muted/20"
                key={`tech-${i}`}
              />
            ))}
          </div>
        </div>

        {/* 作成日 */}
        <div>
          <div className="mb-1 h-5 w-16 animate-pulse rounded bg-muted/20" />
          <div className="h-5 w-48 animate-pulse rounded bg-muted/20" />
        </div>

        {/* 更新日 */}
        <div>
          <div className="mb-1 h-5 w-16 animate-pulse rounded bg-muted/20" />
          <div className="h-5 w-48 animate-pulse rounded bg-muted/20" />
        </div>
      </div>

      {/* 編集ボタン */}
      <div className="mt-4 border-border border-t pt-4">
        <div className="h-10 w-16 animate-pulse rounded bg-muted/20" />
      </div>
    </Panel>
  )
}
