export default function ProfileEditSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Name field */}
      <div>
        <div className="mb-2 h-5 w-16 rounded bg-muted/20" />
        <div className="input h-10 w-full bg-muted/10" />
      </div>

      {/* Tagline field */}
      <div>
        <div className="mb-2 h-5 w-32 rounded bg-muted/20" />
        <div className="input h-10 w-full bg-muted/10" />
      </div>

      {/* Email field */}
      <div>
        <div className="mb-2 h-5 w-36 rounded bg-muted/20" />
        <div className="input h-10 w-full bg-muted/10" />
      </div>

      {/* About field */}
      <div>
        <div className="mb-2 h-5 w-20 rounded bg-muted/20" />
        <div className="input h-32 w-full bg-muted/10" />
      </div>

      {/* Social links section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-muted/20" />
          <div className="h-8 w-16 rounded bg-muted/10" />
        </div>
      </div>

      {/* Technologies section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="h-5 w-24 rounded bg-muted/20" />
          <div className="h-8 w-16 rounded bg-muted/10" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <div className="btn h-10 w-20 bg-muted/10" />
        <div className="btn-secondary h-10 w-24 bg-muted/10" />
      </div>
    </div>
  )
}
