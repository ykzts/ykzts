'use client'

import { cn } from '@ykzts/ui/lib/utils'
import { Separator as SeparatorPrimitive } from '@ykzts/ui/separator'

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      className={cn(
        'bg-border shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
        className
      )}
      data-slot="separator"
      orientation={orientation}
      {...props}
    />
  )
}

export { Separator }
