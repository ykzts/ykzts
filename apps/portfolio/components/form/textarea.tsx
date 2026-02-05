import type { TextareaHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string
  label?: string
}

export default function Textarea({
  error,
  label,
  id,
  required,
  className,
  ...props
}: TextareaProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-2 block text-muted text-sm" htmlFor={id}>
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <textarea
        {...props}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className={twMerge(
          'min-h-[120px] w-full resize-y rounded-lg border border-border bg-background px-4 py-2.5 text-foreground text-sm transition-all duration-200 placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent aria-invalid:border-red-400 aria-invalid:focus:ring-red-400',
          className
        )}
        id={id}
        required={required}
      />
      {error && (
        <p className="mt-1.5 text-red-400 text-xs" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}
