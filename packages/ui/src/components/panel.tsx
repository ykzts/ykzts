import * as React from 'react'

import { cn } from '@ykzts/ui/lib/utils'

function Panel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10',
        className
      )}
      {...props}
    />
  )
}

export { Panel }
