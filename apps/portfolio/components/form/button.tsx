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
    'rounded border-0 px-10 py-3.5 text-base font-semibold transition-[background-color,opacity] duration-250 ease-in-out focus:outline-3 focus:outline-offset-2 focus:outline-brand'

  const variantClasses = {
    primary:
      'bg-brand text-white hover:enabled:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'bg-transparent border-2 border-brand text-brand hover:enabled:bg-brand/10'
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
