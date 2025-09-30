import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock environment variables
vi.stubEnv('RESEND_API_KEY', 'test_api_key')
vi.stubEnv('TURNSTILE_SECRET_KEY', 'test_turnstile_key')
vi.stubEnv('CONTACT_EMAIL', 'test@example.com')
vi.stubEnv('RESEND_FROM_EMAIL', 'from@example.com')

// Mock Resend
const mockSend = vi.fn()
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: mockSend
    }
  }))
}))

// Mock fetch for Turnstile verification
global.fetch = vi.fn()

describe('Contact form action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('submitContactForm', () => {
    it('should return field errors for invalid data', async () => {
      const { submitContactForm } = await import('../../app/actions/contact')

      const result = await submitContactForm({
        email: 'invalid-email',
        message: 'short',
        name: '',
        privacyConsent: false,
        subject: '',
        turnstileToken: ''
      })

      expect(result.success).toBe(false)
      expect(result.fieldErrors).toBeDefined()
      expect(result.fieldErrors?.name).toBeDefined()
      expect(result.fieldErrors?.email).toBeDefined()
      expect(result.fieldErrors?.subject).toBeDefined()
      expect(result.fieldErrors?.message).toBeDefined()
    })

    it('should validate privacy consent is true', async () => {
      const { submitContactForm } = await import('../../app/actions/contact')

      const result = await submitContactForm({
        email: 'test@example.com',
        message: 'This is a test message that is long enough',
        name: 'Test User',
        privacyConsent: false,
        subject: 'Test Subject',
        turnstileToken: 'test-token'
      })

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.privacyConsent).toBeDefined()
    })

    it('should accept valid data with privacy consent', async () => {
      // Mock successful Turnstile verification
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        json: async () => ({ success: true })
      })

      // Mock successful email send
      mockSend.mockResolvedValue({
        error: null,
        id: 'test-email-id'
      })

      const { submitContactForm } = await import('../../app/actions/contact')

      const result = await submitContactForm({
        email: 'test@example.com',
        message: 'This is a test message that is long enough',
        name: 'Test User',
        privacyConsent: true,
        subject: 'Test Subject',
        turnstileToken: 'test-token'
      })

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockSend).toHaveBeenCalled()
    })

    it('should fail when Turnstile verification fails', async () => {
      // Mock failed Turnstile verification
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        json: async () => ({ success: false })
      })

      const { submitContactForm } = await import('../../app/actions/contact')

      const result = await submitContactForm({
        email: 'test@example.com',
        message: 'This is a test message that is long enough',
        name: 'Test User',
        privacyConsent: true,
        subject: 'Test Subject',
        turnstileToken: 'invalid-token'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('スパム対策')
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should handle Resend email sending errors', async () => {
      // Mock successful Turnstile verification
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        json: async () => ({ success: true })
      })

      // Mock email send error
      mockSend.mockResolvedValue({
        error: {
          message: 'Failed to send email',
          name: 'EmailError'
        }
      })

      const { submitContactForm } = await import('../../app/actions/contact')

      const result = await submitContactForm({
        email: 'test@example.com',
        message: 'This is a test message that is long enough',
        name: 'Test User',
        privacyConsent: true,
        subject: 'Test Subject',
        turnstileToken: 'test-token'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('メールの送信に失敗')
    })
  })
})
