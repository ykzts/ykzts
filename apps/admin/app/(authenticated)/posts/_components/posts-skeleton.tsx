import { Card } from '@ykzts/ui/components/card'

export function PostsSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Table Header Skeleton */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border border-b">
                <th className="px-4 py-3 text-left">タイトル</th>
                <th className="px-4 py-3 text-left">ステータス</th>
                <th className="px-4 py-3 text-left">公開日時</th>
                <th className="px-4 py-3 text-left">更新日時</th>
                <th className="px-4 py-3 text-left">作成者</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {/* Render 5 skeleton rows */}
              {[0, 1, 2, 3, 4].map((i) => (
                <tr
                  className="border-border border-b"
                  key={`post-skeleton-${i}`}
                >
                  <td className="px-4 py-3">
                    <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-24 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                      <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  )
}
