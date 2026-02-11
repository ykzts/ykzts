import { Input as BaseInput } from '@ykzts/ui/input'
import type { InputHTMLAttributes } from 'react'

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
      <BaseInput
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
