import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock environment variable
vi.stubEnv('DRAFT_SECRET', 'test-draft-secret')

// Mock draftMode
const mockEnable = vi.fn()
const mockDraftMode = vi.fn().mockResolvedValue({
  enable: mockEnable
})

vi.mock('next/headers', () => ({
  draftMode: mockDraftMode
}))

describe('GET /api/draft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 for missing secret', async () => {
    const { GET } = await import('../route')

    const request = new NextRequest(
      'http://localhost:3000/api/draft?slug=test-post',
      {
        method: 'GET'
      }
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('Invalid token')
    expect(mockDraftMode).not.toHaveBeenCalled()
  })

  it('should return 401 for invalid secret', async () => {
    const { GET } = await import('../route')

    const request = new NextRequest(
      'http://localhost:3000/api/draft?secret=wrong-secret&slug=test-post',
      {
        method: 'GET'
      }
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('Invalid token')
    expect(mockDraftMode).not.toHaveBeenCalled()
  })

  it('should return 400 for missing slug', async () => {
    const { GET } = await import('../route')

    const request = new NextRequest(
      'http://localhost:3000/api/draft?secret=test-draft-secret',
      {
        method: 'GET'
      }
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('Missing slug parameter')
    expect(mockDraftMode).not.toHaveBeenCalled()
  })

  it('should enable draft mode and redirect with valid credentials', async () => {
    const { GET } = await import('../route')

    const request = new NextRequest(
      'http://localhost:3000/api/draft?secret=test-draft-secret&slug=test-post',
      {
        method: 'GET'
      }
    )

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/blog?preview=test-post'
    )
    expect(mockDraftMode).toHaveBeenCalled()
    expect(mockEnable).toHaveBeenCalled()
  })
})
