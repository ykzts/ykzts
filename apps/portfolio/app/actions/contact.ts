'use server'

import { Resend } from 'resend'
import * as z from 'zod'
import { verifyTurnstile } from '@/lib/turnstile'

const resend = new Resend(process.env.RESEND_API_KEY)

const contactFormSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  message: z.string().min(10, 'メッセージは10文字以上入力してください'),
  name: z.string().min(1, 'お名前を入力してください'),
  privacyConsent: z
    .boolean()
    .refine((val) => val === true, 'プライバシーポリシーに同意してください'),
  subject: z.string().min(1, '件名を入力してください'),
  turnstileToken: z.string().min(1, 'スパム対策の確認が必要です')
})

export type ContactFormData = z.infer<typeof contactFormSchema>

export type ContactFormResponse = {
  success: boolean
  error?: string
  fieldErrors?: Partial<Record<keyof ContactFormData, string>>
  formData?: Partial<ContactFormData>
}

export async function submitContactForm(
  _prevState: ContactFormResponse | null,
  formData: FormData
): Promise<ContactFormResponse> {
  // Extract form data
  const rawData = {
    email: formData.get('email'),
    message: formData.get('message'),
    name: formData.get('name'),
    privacyConsent: formData.get('privacyConsent') === 'on',
    subject: formData.get('subject'),
    turnstileToken: formData.get('turnstileToken')
  }

  const data: ContactFormData = {
    email: typeof rawData.email === 'string' ? rawData.email : '',
    message: typeof rawData.message === 'string' ? rawData.message : '',
    name: typeof rawData.name === 'string' ? rawData.name : '',
    privacyConsent: rawData.privacyConsent,
    subject: typeof rawData.subject === 'string' ? rawData.subject : '',
    turnstileToken:
      typeof rawData.turnstileToken === 'string' ? rawData.turnstileToken : ''
  }

  try {
    // Validate form data
    const validatedData = contactFormSchema.parse(data)

    // Verify Turnstile token
    const isValidToken = await verifyTurnstile(validatedData.turnstileToken)
    if (!isValidToken) {
      return {
        error: 'スパム対策の確認に失敗しました。もう一度お試しください。',
        formData: data,
        success: false
      }
    }

    // Send email using Resend
    if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
      if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not configured.')
      }

      if (!process.env.CONTACT_EMAIL) {
        console.error('CONTACT_EMAIL is not configured.')
      }

      return {
        error:
          'メール送信の設定が正しくありません。管理者にお問い合わせください。',
        formData: data,
        success: false
      }
    }

    const emailResult = await resend.emails.send({
      from: `${validatedData.name} <no-reply@ykzts.com>`,
      replyTo: `${validatedData.name} <${validatedData.email}>`,
      subject: `[お問い合わせ] ${validatedData.subject}`,
      text: validatedData.message,
      to: [process.env.CONTACT_EMAIL]
    })

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error)
      return {
        error:
          'メールの送信に失敗しました。しばらくしてからもう一度お試しください。',
        formData: data,
        success: false
      }
    }

    return {
      success: true
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {}
      for (const issue of error.issues) {
        const field = issue.path[0] as keyof ContactFormData
        if (field) {
          fieldErrors[field] = issue.message
        }
      }
      return {
        fieldErrors,
        formData: data,
        success: false
      }
    }

    console.error('Unexpected error in submitContactForm:', error)
    return {
      error:
        '予期しないエラーが発生しました。しばらくしてからもう一度お試しください。',
      success: false
    }
  }
}
