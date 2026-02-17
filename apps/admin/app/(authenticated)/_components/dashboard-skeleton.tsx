import { Panel } from '@/components/panel'

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Panel key={`skeleton-panel-${i}`}>
          <div className="mb-2 h-7 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-16 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
        </Panel>
      ))}
    </div>
  )
}
