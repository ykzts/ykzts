import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock environment variable
vi.stubEnv('REVALIDATE_SECRET', 'test-secret-key')

// Mock revalidateTag
const mockRevalidateTag = vi.fn()
vi.mock('next/cache', () => ({
  revalidateTag: mockRevalidateTag
}))

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 for invalid secret', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/revalidate', {
      body: JSON.stringify({ tag: 'posts' }),
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': 'invalid-secret'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('Invalid secret')
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('should return 401 when secret header is missing', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/revalidate', {
      body: JSON.stringify({ tag: 'posts' }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('Invalid secret')
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid JSON body', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/revalidate', {
      body: 'invalid json',
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': 'test-secret-key'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('Invalid JSON body')
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('should return 400 for missing tag field', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/revalidate', {
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': 'test-secret-key'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('Invalid request body')
    expect(data.errors).toBeDefined()
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('should return 400 for empty tag', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/revalidate', {
      body: JSON.stringify({ tag: '' }),
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': 'test-secret-key'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('Invalid request body')
    expect(data.errors).toBeDefined()
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('should return 400 for non-string tag', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/revalidate', {
      body: JSON.stringify({ tag: 123 }),
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': 'test-secret-key'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('Invalid request body')
    expect(data.errors).toBeDefined()
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('should successfully revalidate with valid tag', async () => {
    const { POST } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/revalidate', {
      body: JSON.stringify({ tag: 'posts' }),
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': 'test-secret-key'
      },
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.revalidated).toBe(true)
    expect(data.now).toBeDefined()
    expect(typeof data.now).toBe('number')
    expect(mockRevalidateTag).toHaveBeenCalledWith('posts', 'max')
    expect(mockRevalidateTag).toHaveBeenCalledTimes(1)
  })

  it('should successfully revalidate with different tag names', async () => {
    const { POST } = await import('../route')

    const tags = ['posts', 'works', 'profile']

    for (const tag of tags) {
      mockRevalidateTag.mockClear()

      const request = new NextRequest('http://localhost:3000/api/revalidate', {
        body: JSON.stringify({ tag }),
        headers: {
          'content-type': 'application/json',
          'x-revalidate-secret': 'test-secret-key'
        },
        method: 'POST'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.revalidated).toBe(true)
      expect(mockRevalidateTag).toHaveBeenCalledWith(tag, 'max')
    }
  })
})
