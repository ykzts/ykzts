import * as React from 'react'

import { cn } from '@ykzts/ui/lib/utils'

function InputGroup({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      className={cn('flex w-full items-stretch', className)}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group-input"
      className={cn('flex-1 min-w-0', className)}
      {...props}
    />
  )
}

function InputGroupAddon({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn('flex items-center', className)}
      {...props}
    />
  )
}

export { InputGroup, InputGroupInput, InputGroupAddon }
