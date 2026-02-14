export function ProfilePageSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-card p-6">
      <div className="space-y-4">
        {/* 名前 */}
        <div>
          <div className="mb-1 h-5 w-12 rounded bg-muted/20" />
          <div className="h-7 w-40 rounded bg-muted/20" />
        </div>

        {/* キャッチコピー */}
        <div>
          <div className="mb-1 h-5 w-32 rounded bg-muted/20" />
          <div className="h-6 w-64 rounded bg-muted/20" />
        </div>

        {/* メールアドレス */}
        <div>
          <div className="mb-1 h-5 w-36 rounded bg-muted/20" />
          <div className="h-6 w-48 rounded bg-muted/20" />
        </div>

        {/* タイムゾーン */}
        <div>
          <div className="mb-1 h-5 w-28 rounded bg-muted/20" />
          <div className="h-6 w-40 rounded bg-muted/20" />
        </div>

        {/* ソーシャルリンク */}
        <div>
          <div className="mb-2 h-5 w-40 rounded bg-muted/20" />
          <div className="space-y-1">
            {[0, 1, 2].map((i) => (
              <div
                className="h-5 w-56 rounded bg-muted/20"
                key={`social-${i}`}
              />
            ))}
          </div>
        </div>

        {/* 技術タグ */}
        <div>
          <div className="mb-2 h-5 w-24 rounded bg-muted/20" />
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div className="h-7 w-20 rounded bg-muted/20" key={`tech-${i}`} />
            ))}
          </div>
        </div>

        {/* 作成日 */}
        <div>
          <div className="mb-1 h-5 w-16 rounded bg-muted/20" />
          <div className="h-5 w-48 rounded bg-muted/20" />
        </div>

        {/* 更新日 */}
        <div>
          <div className="mb-1 h-5 w-16 rounded bg-muted/20" />
          <div className="h-5 w-48 rounded bg-muted/20" />
        </div>
      </div>

      {/* 編集ボタン */}
      <div className="mt-4 border-border border-t pt-4">
        <div className="h-10 w-16 rounded bg-muted/20" />
      </div>
    </div>
  )
}
