'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Turnstile from 'react-turnstile'
import { type ContactFormData, submitContactForm } from '@/app/actions/contact'

export default function ContactForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({})

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const data: ContactFormData = {
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      name: formData.get('name') as string,
      privacyConsent: formData.get('privacyConsent') === 'on',
      subject: formData.get('subject') as string,
      turnstileToken
    }

    const result = await submitContactForm(data)

    if (result.success) {
      router.push('/contact/thank-you')
    } else {
      setIsSubmitting(false)

      if (result.fieldErrors) {
        setErrors(result.fieldErrors)
      }

      if (result.error) {
        toast.error(result.error, {
          duration: 5000,
          position: 'bottom-center'
        })
      }
    }
  }

  return (
    <>
      <Toaster />
      <form className="mx-auto max-w-[600px]" onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="mb-2 block font-semibold" htmlFor="name">
            お名前 <span className="text-[#e74c3c]">*</span>
          </label>
          <input
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={Boolean(errors.name)}
            className={`w-full rounded border-2 bg-[rgba(144,144,144,0.075)] px-3 py-2 font-inherit text-base transition-[border-color,background-color] duration-250 ease-in-out focus:border-brand focus:bg-[rgba(73,252,212,0.1)] focus:outline-none ${errors.name ? 'border-[#e74c3c] bg-[rgba(231,76,60,0.1)]' : 'border-transparent'}`}
            id="name"
            name="name"
            required
            type="text"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-[#e74c3c]" id="name-error">
              {errors.name}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="mb-2 block font-semibold" htmlFor="email">
            メールアドレス <span className="text-[#e74c3c]">*</span>
          </label>
          <input
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            className={`w-full rounded border-2 bg-[rgba(144,144,144,0.075)] px-3 py-2 font-inherit text-base transition-[border-color,background-color] duration-250 ease-in-out focus:border-brand focus:bg-[rgba(73,252,212,0.1)] focus:outline-none ${errors.email ? 'border-[#e74c3c] bg-[rgba(231,76,60,0.1)]' : 'border-transparent'}`}
            id="email"
            name="email"
            required
            type="email"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-[#e74c3c]" id="email-error">
              {errors.email}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="mb-2 block font-semibold" htmlFor="subject">
            件名 <span className="text-[#e74c3c]">*</span>
          </label>
          <input
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            aria-invalid={Boolean(errors.subject)}
            className={`w-full rounded border-2 bg-[rgba(144,144,144,0.075)] px-3 py-2 font-inherit text-base transition-[border-color,background-color] duration-250 ease-in-out focus:border-brand focus:bg-[rgba(73,252,212,0.1)] focus:outline-none ${errors.subject ? 'border-[#e74c3c] bg-[rgba(231,76,60,0.1)]' : 'border-transparent'}`}
            id="subject"
            name="subject"
            required
            type="text"
          />
          {errors.subject && (
            <p className="mt-2 text-sm text-[#e74c3c]" id="subject-error">
              {errors.subject}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="mb-2 block font-semibold" htmlFor="message">
            メッセージ <span className="text-[#e74c3c]">*</span>
          </label>
          <textarea
            aria-describedby={errors.message ? 'message-error' : undefined}
            aria-invalid={Boolean(errors.message)}
            className={`min-h-[150px] w-full resize-y rounded border-2 bg-[rgba(144,144,144,0.075)] px-3 py-2 font-inherit text-base transition-[border-color,background-color] duration-250 ease-in-out focus:border-brand focus:bg-[rgba(73,252,212,0.1)] focus:outline-none ${errors.message ? 'border-[#e74c3c] bg-[rgba(231,76,60,0.1)]' : 'border-transparent'}`}
            id="message"
            name="message"
            required
            rows={6}
          />
          {errors.message && (
            <p className="mt-2 text-sm text-[#e74c3c]" id="message-error">
              {errors.message}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              aria-describedby={
                errors.privacyConsent ? 'privacy-error' : undefined
              }
              aria-invalid={Boolean(errors.privacyConsent)}
              className="mt-1 cursor-pointer"
              name="privacyConsent"
              required
              type="checkbox"
            />
            <span>
              プライバシーポリシーに同意します{' '}
              <span className="text-[#e74c3c]">*</span>
            </span>
          </label>
          {errors.privacyConsent && (
            <p className="mt-2 text-sm text-[#e74c3c]" id="privacy-error">
              {errors.privacyConsent}
            </p>
          )}
        </div>

        <div className="mb-6">
          <Turnstile
            onVerify={(token) => setTurnstileToken(token)}
            sitekey={
              process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
              '1x00000000000000000000AA'
            }
          />
          {errors.turnstileToken && (
            <p className="mt-2 text-sm text-[#e74c3c]">
              {errors.turnstileToken}
            </p>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            className="rounded border-0 bg-brand px-10 py-3.5 text-base font-semibold text-white transition-[background-color,opacity] duration-250 ease-in-out hover:enabled:bg-brand-dark focus:outline-3 focus:outline-offset-2 focus:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || !turnstileToken}
            type="submit"
          >
            {isSubmitting ? '送信中...' : '送信する'}
          </button>
        </div>
      </form>
    </>
  )
}
