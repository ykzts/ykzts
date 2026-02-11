import { Textarea as BaseTextarea } from '@ykzts/ui/textarea'
import type { TextareaHTMLAttributes } from 'react'

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
    <div className="mb-5">
      {label && (
        <label className="mb-2 block text-base text-foreground" htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <BaseTextarea
        {...props}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className={className}
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
