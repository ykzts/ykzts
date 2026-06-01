'use client'

import { Link } from '@vercel/microfrontends/next/client'
import { Button } from '@ykzts/ui/components/button'
import type { ComponentProps } from 'react'

type LinkButtonProps = Omit<ComponentProps<typeof Button>, 'render'> &
  Pick<ComponentProps<typeof Link>, 'href'>

/**
 * A button-styled link component for navigation.
 * Combines Next.js Link functionality with Button component.
 */
export default function LinkButton({
  children,
  href,
  ...props
}: LinkButtonProps) {
  return <Button render={<Link href={href}>{children}</Link>} {...props} />
}
