import { buttonVariants } from '@ykzts/ui/button'
import { cn } from '@ykzts/ui/lib/utils'

export default function ProfileEditSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Name field */}
      <div>
        <div className="mb-2 h-5 w-16 rounded bg-muted/20" />
        <div className="h-10 w-full rounded-md border border-input bg-muted/10" />
      </div>

      {/* Tagline field */}
      <div>
        <div className="mb-2 h-5 w-32 rounded bg-muted/20" />
        <div className="h-10 w-full rounded-md border border-input bg-muted/10" />
      </div>

      {/* Email field */}
      <div>
        <div className="mb-2 h-5 w-36 rounded bg-muted/20" />
        <div className="h-10 w-full rounded-md border border-input bg-muted/10" />
      </div>

      {/* About field */}
      <div>
        <div className="mb-2 h-5 w-20 rounded bg-muted/20" />
        <div className="h-32 w-full rounded-md border border-input bg-muted/10" />
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
        <div
          className={cn(
            buttonVariants(),
            'h-10 w-20 cursor-default bg-muted/10'
          )}
        />
        <div
          className={cn(
            buttonVariants({ variant: 'secondary' }),
            'h-10 w-24 cursor-default bg-muted/10'
          )}
        />
      </div>
    </div>
  )
}
