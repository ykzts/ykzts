'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Turnstile from 'react-turnstile'
import { type ContactFormData, submitContactForm } from '@/app/actions/contact'
import styles from './contact-form.module.css'

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
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            お名前 <span className={styles.required}>*</span>
          </label>
          <input
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={Boolean(errors.name)}
            className={`${styles.input} ${errors.name ? styles['input--error'] : ''}`}
            id="name"
            name="name"
            required
            type="text"
          />
          {errors.name && (
            <p className={styles.error} id="name-error">
              {errors.name}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            メールアドレス <span className={styles.required}>*</span>
          </label>
          <input
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            className={`${styles.input} ${errors.email ? styles['input--error'] : ''}`}
            id="email"
            name="email"
            required
            type="email"
          />
          {errors.email && (
            <p className={styles.error} id="email-error">
              {errors.email}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="subject">
            件名 <span className={styles.required}>*</span>
          </label>
          <input
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            aria-invalid={Boolean(errors.subject)}
            className={`${styles.input} ${errors.subject ? styles['input--error'] : ''}`}
            id="subject"
            name="subject"
            required
            type="text"
          />
          {errors.subject && (
            <p className={styles.error} id="subject-error">
              {errors.subject}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="message">
            メッセージ <span className={styles.required}>*</span>
          </label>
          <textarea
            aria-describedby={errors.message ? 'message-error' : undefined}
            aria-invalid={Boolean(errors.message)}
            className={`${styles.textarea} ${errors.message ? styles['textarea--error'] : ''}`}
            id="message"
            name="message"
            required
            rows={6}
          />
          {errors.message && (
            <p className={styles.error} id="message-error">
              {errors.message}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles['checkbox-label']}>
            <input
              aria-describedby={
                errors.privacyConsent ? 'privacy-error' : undefined
              }
              aria-invalid={Boolean(errors.privacyConsent)}
              className={styles.checkbox}
              name="privacyConsent"
              required
              type="checkbox"
            />
            <span>
              プライバシーポリシーに同意します{' '}
              <span className={styles.required}>*</span>
            </span>
          </label>
          {errors.privacyConsent && (
            <p className={styles.error} id="privacy-error">
              {errors.privacyConsent}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <Turnstile
            onVerify={(token) => setTurnstileToken(token)}
            sitekey={
              process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
              '1x00000000000000000000AA'
            }
          />
          {errors.turnstileToken && (
            <p className={styles.error}>{errors.turnstileToken}</p>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.submit}
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
