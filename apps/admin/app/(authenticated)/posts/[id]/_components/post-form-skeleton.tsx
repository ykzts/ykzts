export function PostFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Two-column layout skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <div className="mb-2 h-5 w-20 rounded bg-muted/20" />
            <div className="h-10 w-full rounded bg-muted/20" />
            <div className="mt-1 h-4 w-32 rounded bg-muted/20" />
          </div>

          {/* Content Editor */}
          <div>
            <div className="mb-2 h-5 w-24 rounded bg-muted/20" />
            <div className="h-96 w-full rounded bg-muted/20" />
          </div>
        </div>

        {/* Right Column - Metadata Sidebar */}
        <div className="space-y-6">
          {/* Slug */}
          <div>
            <div className="mb-2 h-5 w-16 rounded bg-muted/20" />
            <div className="flex gap-2">
              <div className="h-10 flex-1 rounded bg-muted/20" />
              <div className="h-10 w-24 rounded bg-muted/20" />
            </div>
            <div className="mt-1 h-4 w-48 rounded bg-muted/20" />
          </div>

          {/* Excerpt */}
          <div>
            <div className="mb-2 h-5 w-12 rounded bg-muted/20" />
            <div className="h-24 w-full rounded bg-muted/20" />
          </div>

          {/* Tags */}
          <div>
            <div className="mb-2 h-5 w-10 rounded bg-muted/20" />
            <div className="flex gap-2">
              <div className="h-10 flex-1 rounded bg-muted/20" />
              <div className="h-10 w-16 rounded bg-muted/20" />
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="mb-2 h-5 w-20 rounded bg-muted/20" />
            <div className="h-10 w-full rounded bg-muted/20" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <div className="h-10 w-24 rounded bg-muted/20" />
        <div className="h-10 w-20 rounded bg-muted/20" />
      </div>
    </div>
  )
}
