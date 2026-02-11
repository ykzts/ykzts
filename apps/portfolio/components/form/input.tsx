import type { InputHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  label?: string
}

export default function Input({
  error,
  label,
  id,
  required,
  className,
  ...props
}: InputProps) {
  return (
    <div className="mb-5">
      {label && (
        <label className="mb-2 block text-base text-foreground" htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        {...props}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className={twMerge(
          'w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground transition-all duration-200 placeholder:text-muted-foreground-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary aria-invalid:border-red-500 aria-invalid:focus:ring-red-500',
          className
        )}
        id={id}
        required={required}
      />
      {error && (
        <p className="mt-1.5 text-red-500 text-sm" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}
