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
    <div className="mb-6">
      {label && (
        <label className="mb-2 block font-semibold" htmlFor={id}>
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <input
        {...props}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className={twMerge(
          'w-full rounded border-2 bg-gray-500/[0.075] px-3 py-2 font-inherit text-base transition-[border-color,background-color] duration-250 ease-in-out focus:border-brand focus:bg-brand/10 focus:outline-none',
          error ? 'border-red-600 bg-red-600/10' : 'border-transparent',
          className
        )}
        id={id}
        required={required}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}
