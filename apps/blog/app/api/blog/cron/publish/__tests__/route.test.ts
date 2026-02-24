import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock environment variable
vi.stubEnv('CRON_SECRET', 'test-cron-secret')

// Mock revalidateTag
const mockRevalidateTag = vi.fn()
vi.mock('next/cache', () => ({
  revalidateTag: mockRevalidateTag
}))

// Mock Supabase admin client
const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  supabaseAdmin: mockSupabase
}))

describe('GET /api/cron/publish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 for missing authorization header', async () => {
    const { GET } = await import('../route')

    const request = new NextRequest(
      'http://localhost:3000/api/blog/cron/publish',
      {
        method: 'GET'
      }
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('Unauthorized')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('should return 401 for invalid authorization token', async () => {
    const { GET } = await import('../route')

    const request = new NextRequest(
      'http://localhost:3000/api/blog/cron/publish',
      {
        headers: {
          authorization: 'Bearer invalid-token'
        },
        method: 'GET'
      }
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('Unauthorized')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('should return 200 when no posts need to be published', async () => {
    const { GET } = await import('../route')

    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockLte = vi.fn().mockResolvedValue({
      data: [],
      error: null
    })

    mockSupabase.from.mockReturnValue({
      eq: mockEq,
      lte: mockLte,
      select: mockSelect
    })

    const request = new NextRequest(
      'http://localhost:3000/api/blog/cron/publish',
      {
        headers: {
          authorization: 'Bearer test-cron-secret'
        },
        method: 'GET'
      }
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('No posts to publish')
    expect(data.publishedCount).toBe(0)
    expect(mockSupabase.from).toHaveBeenCalledWith('posts')
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('should publish scheduled posts and revalidate cache', async () => {
    const { GET } = await import('../route')

    const scheduledPosts = [
      { id: '1', slug: 'post-1', title: 'Post 1' },
      { id: '2', slug: 'post-2', title: 'Post 2' }
    ]

    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockLte = vi.fn().mockResolvedValue({
      data: scheduledPosts,
      error: null
    })

    const mockUpdate = vi.fn().mockReturnThis()
    const mockIn = vi.fn().mockResolvedValue({
      error: null
    })

    mockSupabase.from
      .mockReturnValueOnce({
        eq: mockEq,
        lte: mockLte,
        select: mockSelect
      })
      .mockReturnValueOnce({
        in: mockIn,
        update: mockUpdate
      })

    const request = new NextRequest(
      'http://localhost:3000/api/blog/cron/publish',
      {
        headers: {
          authorization: 'Bearer test-cron-secret'
        },
        method: 'GET'
      }
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Published 2 post(s)')
    expect(data.publishedCount).toBe(2)
    expect(data.posts).toHaveLength(2)
    expect(data.posts[0]).toEqual({ id: '1', slug: 'post-1', title: 'Post 1' })
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'published' })
    expect(mockIn).toHaveBeenCalledWith('id', ['1', '2'])
    expect(mockRevalidateTag).toHaveBeenCalledWith('posts', 'max')
    expect(mockRevalidateTag).toHaveBeenCalledTimes(1)
  })

  it('should return 500 when query fails', async () => {
    const { GET } = await import('../route')

    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockLte = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    })

    mockSupabase.from.mockReturnValue({
      eq: mockEq,
      lte: mockLte,
      select: mockSelect
    })

    const request = new NextRequest(
      'http://localhost:3000/api/blog/cron/publish',
      {
        headers: {
          authorization: 'Bearer test-cron-secret'
        },
        method: 'GET'
      }
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.message).toBe('Failed to publish scheduled posts')
    expect(data.error).toBe('Database error')
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('should return 500 when update fails', async () => {
    const { GET } = await import('../route')

    const scheduledPosts = [{ id: '1', slug: 'post-1', title: 'Post 1' }]

    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockLte = vi.fn().mockResolvedValue({
      data: scheduledPosts,
      error: null
    })

    const mockUpdate = vi.fn().mockReturnThis()
    const mockIn = vi.fn().mockResolvedValue({
      error: { message: 'Update failed' }
    })

    mockSupabase.from
      .mockReturnValueOnce({
        eq: mockEq,
        lte: mockLte,
        select: mockSelect
      })
      .mockReturnValueOnce({
        in: mockIn,
        update: mockUpdate
      })

    const request = new NextRequest(
      'http://localhost:3000/api/blog/cron/publish',
      {
        headers: {
          authorization: 'Bearer test-cron-secret'
        },
        method: 'GET'
      }
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.message).toBe('Failed to publish scheduled posts')
    expect(data.error).toBe('Update failed')
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })
})
