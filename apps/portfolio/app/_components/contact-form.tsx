'use client'

import { type FormEvent, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Turnstile from 'react-turnstile'
import { type ContactFormData, submitContactForm } from '@/app/actions/contact'
import { Button, Input, Textarea } from '@/components/form'

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
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
      setIsSubmitted(true)
      setIsSubmitting(false)
      // Reset form
      e.currentTarget.reset()
      setTurnstileToken('')
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

  if (isSubmitted) {
    return (
      <>
        <Toaster />
        <div className="mx-auto my-8 max-w-[600px] rounded border-2 border-brand bg-[rgba(73,252,212,0.1)] p-8 text-center">
          <h3 className="mb-4 text-2xl font-semibold text-brand">送信完了</h3>
          <p className="mb-4">
            お問い合わせいただきありがとうございます。内容を確認次第、ご返信させていただきます。
          </p>
          <p className="mb-6">通常、2〜3営業日以内にご返信いたします。</p>
          <Button onClick={() => setIsSubmitted(false)} type="button">
            新しいお問い合わせを送信
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <Toaster />
      <form className="mx-auto max-w-[600px]" onSubmit={handleSubmit}>
        <Input
          error={errors.name}
          id="name"
          label="お名前"
          name="name"
          required
          type="text"
        />

        <Input
          error={errors.email}
          id="email"
          label="メールアドレス"
          name="email"
          required
          type="email"
        />

        <Input
          error={errors.subject}
          id="subject"
          label="件名"
          name="subject"
          required
          type="text"
        />

        <Textarea
          error={errors.message}
          id="message"
          label="メッセージ"
          name="message"
          required
          rows={6}
        />

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
          <Button disabled={isSubmitting || !turnstileToken} type="submit">
            {isSubmitting ? '送信中...' : '送信する'}
          </Button>
        </div>
      </form>
    </>
  )
}
