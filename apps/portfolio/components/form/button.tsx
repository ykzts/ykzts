import { Button as BaseButton } from '@ykzts/ui/button'
import type { ButtonHTMLAttributes } from 'react'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export default function Button({ variant = 'primary', ...props }: ButtonProps) {
  const mappedVariant = variant === 'primary' ? 'default' : 'outline'

  return <BaseButton variant={mappedVariant} {...props} />
}
