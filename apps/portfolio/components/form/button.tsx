import type { ButtonHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export default function Button({
  children,
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  const baseClasses =
    'rounded-lg border-0 px-6 py-3 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-2 focus:outline-offset-2 focus:outline-accent'

  const variantClasses = {
    primary:
      'bg-accent text-accent-foreground hover:enabled:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50',
    secondary:
      'bg-transparent border border-border text-foreground hover:enabled:border-accent hover:enabled:text-accent'
  }

  return (
    <button
      {...props}
      className={twMerge(baseClasses, variantClasses[variant], className)}
    >
      {children}
    </button>
  )
}
