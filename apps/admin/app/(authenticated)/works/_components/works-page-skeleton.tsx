export function WorksPageSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-card p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-border border-b">
              <th className="px-4 py-3 text-left">
                <div className="h-5 w-20 rounded bg-muted/20" />
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-5 w-20 rounded bg-muted/20" />
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-5 w-16 rounded bg-muted/20" />
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-5 w-16 rounded bg-muted/20" />
              </th>
              <th className="px-4 py-3 text-right">
                <div className="ml-auto h-5 w-12 rounded bg-muted/20" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((i) => (
              <tr className="border-border border-b" key={`skeleton-row-${i}`}>
                <td className="px-4 py-3">
                  <div className="h-5 w-32 rounded bg-muted/20" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-24 rounded bg-muted/20" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-20 rounded bg-muted/20" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-20 rounded bg-muted/20" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="ml-auto h-5 w-12 rounded bg-muted/20" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
