import * as z from 'zod'

const turnstileResponseSchema = z.object({
  challenge_ts: z.string().optional(),
  'error-codes': z.array(z.string()).optional(),
  hostname: z.string().optional(),
  success: z.boolean()
})

type TurnstileResponse = z.infer<typeof turnstileResponseSchema>

export async function verifyTurnstile(token: string): Promise<boolean> {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    console.warn('TURNSTILE_SECRET_KEY is not configured')
    return true // Allow in development
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        body: JSON.stringify({
          response: token,
          secret: process.env.TURNSTILE_SECRET_KEY
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }
    )

    const json: unknown = await response.json()
    const data: TurnstileResponse = turnstileResponseSchema.parse(json)

    if (!data.success && data['error-codes']) {
      console.warn('Turnstile verification failed:', data['error-codes'])
    }

    return data.success === true
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}
