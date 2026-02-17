export function WorksPageSkeleton() {
  return (
    <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-border border-b">
              <th className="px-4 py-3 text-left">タイトル</th>
              <th className="px-4 py-3 text-left">スラッグ</th>
              <th className="px-4 py-3 text-left">開始日</th>
              <th className="px-4 py-3 text-left">作成日</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((i) => (
              <tr className="border-border border-b" key={`skeleton-row-${i}`}>
                <td className="px-4 py-3">
                  <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="ml-auto h-5 w-12 animate-pulse rounded bg-muted" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
