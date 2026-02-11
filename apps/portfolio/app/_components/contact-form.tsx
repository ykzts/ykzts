'use client'

import { Turnstile } from '@marsidev/react-turnstile'
import { Button } from '@ykzts/ui/components/button'
import { Checkbox } from '@ykzts/ui/components/checkbox'
import { Field } from '@ykzts/ui/components/field'
import { Input } from '@ykzts/ui/components/input'
import { Textarea } from '@ykzts/ui/components/textarea'
import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
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
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-6 text-center">
          <h3 className="mb-3 font-semibold text-foreground text-xl">
            送信完了
          </h3>
          <p className="mb-3 text-base text-muted-foreground">
            お問い合わせいただきありがとうございます。内容を確認次第、ご返信させていただきます。
          </p>
          <p className="mb-5 text-base text-muted-foreground">
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
        <Field className="mb-5">
          <Field.Label htmlFor="name">
            お名前 <span className="text-red-500">*</span>
          </Field.Label>
          <Input
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={Boolean(errors.name)}
            defaultValue={formData.name || ''}
            id="name"
            name="name"
            required
            type="text"
          />
          {errors.name && (
            <Field.Error id="name-error">{errors.name}</Field.Error>
          )}
        </Field>

        <Field className="mb-5">
          <Field.Label htmlFor="email">
            メールアドレス <span className="text-red-500">*</span>
          </Field.Label>
          <Input
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            defaultValue={formData.email || ''}
            id="email"
            name="email"
            required
            type="email"
          />
          {errors.email && (
            <Field.Error id="email-error">{errors.email}</Field.Error>
          )}
        </Field>

        <Field className="mb-5">
          <Field.Label htmlFor="subject">
            件名 <span className="text-red-500">*</span>
          </Field.Label>
          <Input
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            aria-invalid={Boolean(errors.subject)}
            defaultValue={formData.subject || ''}
            id="subject"
            name="subject"
            required
            type="text"
          />
          {errors.subject && (
            <Field.Error id="subject-error">{errors.subject}</Field.Error>
          )}
        </Field>

        <Field className="mb-5">
          <Field.Label htmlFor="message">
            メッセージ <span className="text-red-500">*</span>
          </Field.Label>
          <Textarea
            aria-describedby={errors.message ? 'message-error' : undefined}
            aria-invalid={Boolean(errors.message)}
            defaultValue={formData.message || ''}
            id="message"
            name="message"
            required
            rows={6}
          />
          {errors.message && (
            <Field.Error id="message-error">{errors.message}</Field.Error>
          )}
        </Field>

        <div className="mb-5 flex cursor-pointer items-start gap-2.5 text-base text-muted-foreground">
          <Checkbox
            aria-describedby={
              errors.privacyConsent ? 'privacy-error' : undefined
            }
            aria-invalid={Boolean(errors.privacyConsent)}
            aria-label="プライバシーポリシーに同意"
            defaultChecked={formData.privacyConsent || false}
            name="privacyConsent"
            required
          />
          <span>
            <Link className="text-primary hover:underline" href="/privacy">
              プライバシーポリシー
            </Link>
            に同意します <span className="text-red-500">*</span>
          </span>
          {errors.privacyConsent && (
            <p
              className="mt-1.5 w-full text-red-500 text-sm"
              id="privacy-error"
            >
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
            <p className="mt-1.5 text-red-500 text-sm">
              {errors.turnstileToken}
            </p>
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
