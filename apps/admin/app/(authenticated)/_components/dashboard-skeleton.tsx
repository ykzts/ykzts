import { Panel } from '@/components/panel'

export function DashboardSkeleton() {
  return (
    // biome-ignore lint/a11y/useSemanticElements: role="status" is semantically correct for loading state
    <div
      aria-label="読み込み中..."
      aria-live="polite"
      className="grid grid-cols-1 gap-6 md:grid-cols-2"
      role="status"
    >
      {[0, 1].map((i) => (
        <Panel key={`skeleton-panel-${i}`}>
          <div
            aria-hidden="true"
            className="mb-2 h-7 w-24 animate-pulse rounded bg-muted"
          />
          <div
            aria-hidden="true"
            className="h-9 w-16 animate-pulse rounded bg-muted"
          />
          <div
            aria-hidden="true"
            className="mt-2 h-4 w-32 animate-pulse rounded bg-muted"
          />
        </Panel>
      ))}
    </div>
  )
}
