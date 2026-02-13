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

// Mock Supabase client
const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase
}))

describe('GET /api/blog/draft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 for missing secret', async () => {
    const { GET } = await import('../route')

    const request = new NextRequest(
      'http://localhost:3000/api/blog/draft?slug=test-post',
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
      'http://localhost:3000/api/blog/draft?secret=wrong-secret&slug=test-post',
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
      'http://localhost:3000/api/blog/draft?secret=test-draft-secret',
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

  it('should enable draft mode and redirect to post with valid credentials', async () => {
    const { GET } = await import('../route')

    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        published_at: '2024-01-15T12:00:00Z',
        slug: 'test-post'
      },
      error: null
    })

    mockSupabase.from.mockReturnValue({
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
      select: mockSelect
    })

    const request = new NextRequest(
      'http://localhost:3000/api/blog/draft?secret=test-draft-secret&slug=test-post',
      {
        method: 'GET'
      }
    )

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/blog/2024/01/15/test-post'
    )
    expect(mockDraftMode).toHaveBeenCalled()
    expect(mockEnable).toHaveBeenCalled()
  })
})
