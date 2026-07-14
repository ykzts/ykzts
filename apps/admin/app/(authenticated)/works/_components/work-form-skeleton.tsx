export function WorkFormSkeleton() {
  return (
    <div
      aria-label="読み込み中..."
      aria-live="polite"
      className="space-y-6"
      role="status"
    >
      <div>
        <div
          aria-hidden="true"
          className="mb-2 h-5 w-20 animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="h-10 w-full animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="mt-1 h-4 w-32 animate-pulse rounded bg-muted"
        />
      </div>

      <div>
        <div
          aria-hidden="true"
          className="mb-2 h-5 w-20 animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="h-10 w-full animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="mt-1 h-4 w-64 animate-pulse rounded bg-muted"
        />
      </div>

      <div>
        <div
          aria-hidden="true"
          className="mb-2 h-5 w-20 animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="h-10 w-full animate-pulse rounded bg-muted"
        />
      </div>

      <div>
        <div
          aria-hidden="true"
          className="mb-2 h-5 w-32 animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="h-[300px] w-full animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="mt-1 h-4 w-96 max-w-full animate-pulse rounded bg-muted"
        />
      </div>

      <div className="flex justify-between gap-4">
        <div
          aria-hidden="true"
          className="h-10 w-20 animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="h-10 w-20 animate-pulse rounded bg-muted"
        />
      </div>
    </div>
  );
}
