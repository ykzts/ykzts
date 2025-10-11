import type { InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export default function Input({
  error,
  label,
  id,
  required,
  ...props
}: InputProps) {
  return (
    <div className="mb-6">
      {label && (
        <label className="mb-2 block font-semibold" htmlFor={id}>
          {label} {required && <span className="text-[#e74c3c]">*</span>}
        </label>
      )}
      <input
        {...props}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className={`w-full rounded border-2 bg-[rgba(144,144,144,0.075)] px-3 py-2 font-inherit text-base transition-[border-color,background-color] duration-250 ease-in-out focus:border-brand focus:bg-[rgba(73,252,212,0.1)] focus:outline-none ${error ? 'border-[#e74c3c] bg-[rgba(231,76,60,0.1)]' : 'border-transparent'}`}
        id={id}
        required={required}
      />
      {error && (
        <p className="mt-2 text-sm text-[#e74c3c]" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}
