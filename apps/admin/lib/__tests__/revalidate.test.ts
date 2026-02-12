import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { invalidateCaches } from '../revalidate'

// Mock fetch
global.fetch = vi.fn()

// Mock environment variables
const originalEnv = process.env

describe('invalidateCaches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ now: Date.now(), revalidated: true }), {
        status: 200
      })
    )
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should skip cache invalidation when REVALIDATE_SECRET is not configured', async () => {
    delete process.env.REVALIDATE_SECRET
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await invalidateCaches('posts')

    expect(fetch).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'REVALIDATE_SECRET not configured, skipping cache invalidation'
    )

    consoleSpy.mockRestore()
  })

  it('should skip cache invalidation when BLOG_URL and PORTFOLIO_URL are not configured', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    delete process.env.BLOG_URL
    delete process.env.PORTFOLIO_URL
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await invalidateCaches('posts')

    expect(fetch).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'BLOG_URL and PORTFOLIO_URL not configured, skipping cache invalidation'
    )

    consoleSpy.mockRestore()
  })

  it('should call revalidation endpoint for blog when BLOG_URL is configured', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    process.env.BLOG_URL = 'https://example.blog'
    delete process.env.PORTFOLIO_URL

    await invalidateCaches('posts')

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('https://example.blog/api/revalidate', {
      body: JSON.stringify({ tag: 'posts' }),
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': 'test-secret'
      },
      method: 'POST'
    })
  })

  it('should call revalidation endpoint for portfolio when PORTFOLIO_URL is configured', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    process.env.PORTFOLIO_URL = 'https://example.com'
    delete process.env.BLOG_URL

    await invalidateCaches('works')

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('https://example.com/api/revalidate', {
      body: JSON.stringify({ tag: 'works' }),
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': 'test-secret'
      },
      method: 'POST'
    })
  })

  it('should call revalidation endpoints for both blog and portfolio', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    process.env.BLOG_URL = 'https://example.blog'
    process.env.PORTFOLIO_URL = 'https://example.com'

    await invalidateCaches('posts')

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenCalledWith('https://example.blog/api/revalidate', {
      body: JSON.stringify({ tag: 'posts' }),
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': 'test-secret'
      },
      method: 'POST'
    })
    expect(fetch).toHaveBeenCalledWith('https://example.com/api/revalidate', {
      body: JSON.stringify({ tag: 'posts' }),
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': 'test-secret'
      },
      method: 'POST'
    })
  })

  it('should handle fetch errors gracefully', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    process.env.BLOG_URL = 'https://example.blog'
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await invalidateCaches('posts')

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(consoleSpy).toHaveBeenCalledWith(
      'Cache invalidation failed:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('should work with different cache tags', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    process.env.BLOG_URL = 'https://example.blog'

    await invalidateCaches('profile')

    expect(fetch).toHaveBeenCalledWith('https://example.blog/api/revalidate', {
      body: JSON.stringify({ tag: 'profile' }),
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': 'test-secret'
      },
      method: 'POST'
    })
  })
})
