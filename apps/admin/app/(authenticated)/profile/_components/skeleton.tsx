export default function ProfileEditSkeleton() {
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
          className="mb-2 h-5 w-16 animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="h-10 w-full animate-pulse rounded-md bg-muted"
        />
      </div>

      <div>
        <div
          aria-hidden="true"
          className="mb-2 h-5 w-32 animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="h-10 w-full animate-pulse rounded-md bg-muted"
        />
      </div>

      <div>
        <div
          aria-hidden="true"
          className="mb-2 h-5 w-36 animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="h-10 w-full animate-pulse rounded-md bg-muted"
        />
      </div>

      <div>
        <div
          aria-hidden="true"
          className="mb-2 h-5 w-20 animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="h-32 w-full animate-pulse rounded-md bg-muted"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div
            aria-hidden="true"
            className="h-5 w-32 animate-pulse rounded bg-muted"
          />
          <div
            aria-hidden="true"
            className="h-8 w-16 animate-pulse rounded bg-muted"
          />
        </div>
        <div
          aria-hidden="true"
          className="h-16 w-full animate-pulse rounded-md bg-muted"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div
            aria-hidden="true"
            className="h-5 w-24 animate-pulse rounded bg-muted"
          />
          <div
            aria-hidden="true"
            className="h-8 w-16 animate-pulse rounded bg-muted"
          />
        </div>
        <div
          aria-hidden="true"
          className="h-16 w-full animate-pulse rounded-md bg-muted"
        />
      </div>

      <div className="flex gap-4">
        <div
          aria-hidden="true"
          className="h-10 w-20 animate-pulse rounded-md bg-muted"
        />
        <div
          aria-hidden="true"
          className="h-10 w-24 animate-pulse rounded-md bg-muted"
        />
      </div>
    </div>
  );
}
