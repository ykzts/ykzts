import { Panel } from '@/components/panel'

export function VersionDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Panel>
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={`detail-skeleton-${i}`}>
              <div className="mb-2 h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </Panel>

      <div className="flex justify-between">
        <div className="h-10 w-24 animate-pulse rounded bg-muted" />
        <div className="h-10 w-24 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
