'use client'

import { Turnstile } from '@marsidev/react-turnstile'
import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { Button, Input, Textarea } from '@/components/form'
import { submitContactForm } from '../_actions/contact'

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, null)
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const formRef = useRef<HTMLFormElement>(null)

  // Handle success state - reset form on success
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
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
        <div className="rounded-lg border border-accent/30 bg-accent/10 p-6 text-center">
          <h3 className="mb-3 font-semibold text-foreground text-xl">
            送信完了
          </h3>
          <p className="mb-3 text-base text-muted">
            お問い合わせいただきありがとうございます。内容を確認次第、ご返信させていただきます。
          </p>
          <p className="mb-5 text-base text-muted">
            通常、2〜3営業日以内にご返信いたします。
          </p>
          <Button onClick={() => window.location.reload()} type="button">
            新しいお問い合わせを送信
          </Button>
        </div>
      </>
    )
  }

  const errors = state?.fieldErrors || {}
  const formData = state?.formData || {}

  return (
    <>
      <Toaster />
      <form action={formAction} ref={formRef}>
        <Input
          defaultValue={formData.name || ''}
          error={errors.name}
          id="name"
          label="お名前"
          name="name"
          required
          type="text"
        />

        <Input
          defaultValue={formData.email || ''}
          error={errors.email}
          id="email"
          label="メールアドレス"
          name="email"
          required
          type="email"
        />

        <Input
          defaultValue={formData.subject || ''}
          error={errors.subject}
          id="subject"
          label="件名"
          name="subject"
          required
          type="text"
        />

        <Textarea
          defaultValue={formData.message || ''}
          error={errors.message}
          id="message"
          label="メッセージ"
          name="message"
          required
          rows={6}
        />

        <div className="mb-5">
          <label className="flex cursor-pointer items-start gap-2.5 text-base text-muted">
            <input
              aria-describedby={
                errors.privacyConsent ? 'privacy-error' : undefined
              }
              aria-invalid={Boolean(errors.privacyConsent)}
              className="mt-1 cursor-pointer accent-accent"
              defaultChecked={formData.privacyConsent || false}
              name="privacyConsent"
              required
              type="checkbox"
            />
            <span>
              <Link
                className="text-accent hover:underline"
                href="/privacy"
              >
                プライバシーポリシー
              </Link>
              に同意します <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.privacyConsent && (
            <p className="mt-1.5 text-red-500 text-sm" id="privacy-error">
              {errors.privacyConsent}
            </p>
          )}
        </div>

        <div className="mb-4">
          <Turnstile
            className="w-full"
            onSuccess={(token) => {
              setTurnstileToken(token)
            }}
            options={{ size: 'flexible', theme: 'light' }}
            siteKey={
              process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
              '1x00000000000000000000AA'
            }
          />
          <input name="turnstileToken" type="hidden" value={turnstileToken} />
          {errors.turnstileToken && (
            <p className="mt-1.5 text-red-500 text-sm">{errors.turnstileToken}</p>
          )}
        </div>

        <div className="mt-6">
          <Button disabled={isPending || !turnstileToken} type="submit">
            {isPending ? '送信中...' : '送信する'}
          </Button>
        </div>
      </form>
    </>
  )
}
