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
    <div className="mb-6">
      {label && (
        <label className="mb-2 block font-semibold" htmlFor={id}>
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <textarea
        {...props}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className={twMerge(
          'min-h-[150px] w-full resize-y rounded border-2 bg-gray-500/[0.075] px-3 py-2 font-inherit text-base transition-[border-color,background-color] duration-250 ease-in-out focus:border-brand focus:bg-brand/10 focus:outline-none aria-invalid:border-red-600 aria-invalid:bg-red-600/10',
          error ? '' : 'border-transparent',
          className
        )}
        id={id}
        required={required}
      />
      {error && (
        <p className="mt-2 text-red-600 text-sm" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}
