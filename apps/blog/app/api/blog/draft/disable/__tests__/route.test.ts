import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock draftMode
const mockDisable = vi.fn()
const mockDraftMode = vi.fn().mockResolvedValue({
  disable: mockDisable
})

vi.mock('next/headers', () => ({
  draftMode: mockDraftMode
}))

describe('GET /api/blog/draft/disable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should disable draft mode and redirect to homepage', async () => {
    const { GET } = await import('../route')

    const request = new NextRequest(
      'http://localhost:3000/api/blog/draft/disable',
      {
        method: 'GET'
      }
    )

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/blog')
    expect(mockDraftMode).toHaveBeenCalled()
    expect(mockDisable).toHaveBeenCalled()
  })
})
