export function CompareSkeleton() {
  return (
    <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
      <div className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        </div>

        {/* Diff Items */}
        <div className="space-y-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              className="border-border border-t pt-4"
              key={`compare-skeleton-${i}`}
            >
              <div className="mb-3 h-5 w-20 animate-pulse rounded bg-muted" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 h-4 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-20 w-full animate-pulse rounded bg-muted" />
                </div>
                <div>
                  <div className="mb-2 h-4 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-20 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
