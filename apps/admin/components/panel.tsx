import { cn } from '@ykzts/ui/lib/utils'
import type { ComponentProps } from 'react'

/**
 * Panel component for reusable card containers with standardized styling.
 *
 * Provides a consistent rounded container with card background, padding, and subtle ring.
 * Use this component for simple card-like containers that don't require semantic structure
 * (CardHeader, CardTitle, CardContent, CardFooter). For semantic cards, use the Card component instead.
 *
 * @example
 * ```tsx
 * <Panel>
 *   <h2>Title</h2>
 *   <p>Content</p>
 * </Panel>
 * ```
 *
 * @example With custom className
 * ```tsx
 * <Panel className="transition-shadow hover:shadow-md">
 *   <h2>Interactive Card</h2>
 * </Panel>
 * ```
 */
export function Panel({ className, ...props }: ComponentProps<'div'>) {
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
