export function PostFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div>
        <div className="mb-2 h-5 w-20 rounded bg-muted/20" />
        <div className="h-10 w-full rounded bg-muted/20" />
        <div className="mt-1 h-4 w-32 rounded bg-muted/20" />
      </div>

      <div className="flex justify-between gap-4">
        <div className="h-10 w-20 rounded bg-muted/20" />
        <div className="h-10 w-20 rounded bg-muted/20" />
      </div>
    </div>
  )
}
