export function PostFormSkeleton() {
  return (
    <div
      aria-label="読み込み中..."
      aria-live="polite"
      className="space-y-6"
      role="status"
    >
      {/* Two-column layout skeleton matching PostForm */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
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
              className="mb-2 h-5 w-24 animate-pulse rounded bg-muted"
            />
            <div
              aria-hidden="true"
              className="h-96 w-full animate-pulse rounded bg-muted"
            />
          </div>
        </div>

        {/* Right Column - Metadata Sidebar */}
        <div className="space-y-6">
          <div>
            <div
              aria-hidden="true"
              className="mb-2 h-5 w-16 animate-pulse rounded bg-muted"
            />
            <div className="flex gap-2">
              <div
                aria-hidden="true"
                className="h-10 flex-1 animate-pulse rounded bg-muted"
              />
              <div
                aria-hidden="true"
                className="h-10 w-24 animate-pulse rounded bg-muted"
              />
            </div>
            <div
              aria-hidden="true"
              className="mt-1 h-4 w-48 animate-pulse rounded bg-muted"
            />
          </div>

          <div>
            <div
              aria-hidden="true"
              className="mb-2 h-5 w-12 animate-pulse rounded bg-muted"
            />
            <div
              aria-hidden="true"
              className="h-24 w-full animate-pulse rounded bg-muted"
            />
          </div>

          <div>
            <div
              aria-hidden="true"
              className="mb-2 h-5 w-10 animate-pulse rounded bg-muted"
            />
            <div className="flex gap-2">
              <div
                aria-hidden="true"
                className="h-10 flex-1 animate-pulse rounded bg-muted"
              />
              <div
                aria-hidden="true"
                className="h-10 w-16 animate-pulse rounded bg-muted"
              />
            </div>
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
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <div
          aria-hidden="true"
          className="h-10 w-24 animate-pulse rounded bg-muted"
        />
        <div
          aria-hidden="true"
          className="h-10 w-20 animate-pulse rounded bg-muted"
        />
      </div>
    </div>
  );
}
