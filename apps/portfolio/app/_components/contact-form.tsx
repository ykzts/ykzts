'use client'

import { Turnstile } from '@marsidev/react-turnstile'
import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { submitContactForm } from '@/app/actions/contact'
import { Button, Input, Textarea } from '@/components/form'

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, null)
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const formRef = useRef<HTMLFormElement>(null)

  // Form field state
  const [formData, setFormData] = useState({
    email: '',
    message: '',
    name: '',
    privacyConsent: false,
    subject: ''
  })

  // Handle success state
  useEffect(() => {
    if (state?.success) {
      // Reset form
      setFormData({
        email: '',
        message: '',
        name: '',
        privacyConsent: false,
        subject: ''
      })
      setTurnstileToken('')
    }
  }, [state?.success])

  // Show toast for general errors
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error, {
        duration: 5000,
        position: 'bottom-center'
      })
    }
  }, [state?.error])

  if (state?.success) {
    return (
      <>
        <Toaster />
        <div className="mx-auto my-8 max-w-[600px] rounded border-2 border-brand bg-brand/10 p-8 text-center">
          <h3 className="mb-4 text-2xl font-semibold text-gray-900">
            送信完了
          </h3>
          <p className="mb-4">
            お問い合わせいただきありがとうございます。内容を確認次第、ご返信させていただきます。
          </p>
          <p className="mb-6">通常、2〜3営業日以内にご返信いたします。</p>
          <Button onClick={() => window.location.reload()} type="button">
            新しいお問い合わせを送信
          </Button>
        </div>
      </>
    )
  }

  const errors = state?.fieldErrors || {}

  return (
    <>
      <Toaster />
      <form action={formAction} className="mx-auto max-w-[600px]" ref={formRef}>
        <Input
          error={errors.name}
          id="name"
          label="お名前"
          name="name"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          type="text"
          value={formData.name}
        />

        <Input
          error={errors.email}
          id="email"
          label="メールアドレス"
          name="email"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          type="email"
          value={formData.email}
        />

        <Input
          error={errors.subject}
          id="subject"
          label="件名"
          name="subject"
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
          required
          type="text"
          value={formData.subject}
        />

        <Textarea
          error={errors.message}
          id="message"
          label="メッセージ"
          name="message"
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          required
          rows={6}
          value={formData.message}
        />

        <div className="mb-6">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              aria-describedby={
                errors.privacyConsent ? 'privacy-error' : undefined
              }
              aria-invalid={Boolean(errors.privacyConsent)}
              checked={formData.privacyConsent}
              className="mt-1 cursor-pointer accent-brand"
              name="privacyConsent"
              onChange={(e) =>
                setFormData({ ...formData, privacyConsent: e.target.checked })
              }
              required
              type="checkbox"
            />
            <span>
              <Link
                className="text-gray-900 underline hover:text-gray-700"
                href="/privacy"
              >
                プライバシーポリシー
              </Link>
              に同意します <span className="text-red-600">*</span>
            </span>
          </label>
          {errors.privacyConsent && (
            <p className="mt-2 text-sm text-red-600" id="privacy-error">
              {errors.privacyConsent}
            </p>
          )}
        </div>

        <div className="mb-6">
          <Turnstile
            onSuccess={(token) => {
              setTurnstileToken(token)
            }}
            siteKey={
              process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
              '1x00000000000000000000AA'
            }
          />
          <input name="turnstileToken" type="hidden" value={turnstileToken} />
          {errors.turnstileToken && (
            <p className="mt-2 text-sm text-red-600">{errors.turnstileToken}</p>
          )}
        </div>

        <div className="mt-8 text-center">
          <Button disabled={isPending || !turnstileToken} type="submit">
            {isPending ? '送信中...' : '送信する'}
          </Button>
        </div>
      </form>
    </>
  )
}
