export function VersionsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Post Info Skeleton */}
      <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
        <div className="mb-4 h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          <div>
            <div className="mb-2 h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          </div>
          <div>
            <div className="mb-2 h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div>
            <div className="mb-2 h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Versions List Skeleton */}
      <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
        <div className="mb-4 h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              className="rounded border border-border p-4"
              key={`version-skeleton-${i}`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="mb-2 h-5 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
