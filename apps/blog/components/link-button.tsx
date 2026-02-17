'use client'

import { buttonVariants } from '@ykzts/ui/components/button'
import { cn } from '@ykzts/ui/lib/utils'
import Link from 'next/link'
import type { ComponentProps } from 'react'

type LinkButtonProps = ComponentProps<typeof Link> & {
  className?: string
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'destructive'
    | 'link'
  size?:
    | 'default'
    | 'xs'
    | 'sm'
    | 'lg'
    | 'icon'
    | 'icon-xs'
    | 'icon-sm'
    | 'icon-lg'
}

/**
 * A button-styled link component for navigation.
 * Combines Next.js Link functionality with Button styling.
 */
export default function LinkButton({
  children,
  className,
  variant = 'default',
  size = 'default',
  href,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(buttonVariants({ className, size, variant }))}
      href={href}
      {...props}
    >
      {children}
    </Link>
  )
}
