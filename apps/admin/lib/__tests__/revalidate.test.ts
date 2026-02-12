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

  it('should skip cache invalidation when REVALIDATE_URLS is not configured', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    delete process.env.REVALIDATE_URLS
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await invalidateCaches('posts')

    expect(fetch).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'REVALIDATE_URLS not configured, skipping cache invalidation'
    )

    consoleSpy.mockRestore()
  })

  it('should skip cache invalidation when REVALIDATE_URLS is empty', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    process.env.REVALIDATE_URLS = '  ,  , '
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await invalidateCaches('posts')

    expect(fetch).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'No valid URLs in REVALIDATE_URLS, skipping cache invalidation'
    )

    consoleSpy.mockRestore()
  })

  it('should call revalidation endpoint for a single URL', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    process.env.REVALIDATE_URLS = 'https://example.blog/api/blog/revalidate'

    await invalidateCaches('posts')

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      'https://example.blog/api/blog/revalidate',
      expect.objectContaining({
        body: JSON.stringify({ tag: 'posts' }),
        headers: {
          'content-type': 'application/json',
          'x-revalidate-secret': 'test-secret'
        },
        method: 'POST'
      })
    )
  })

  it('should call revalidation endpoints for multiple comma-separated URLs', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    process.env.REVALIDATE_URLS =
      'https://example.blog/api/blog/revalidate,https://example.com/api/revalidate'

    await invalidateCaches('posts')

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenCalledWith(
      'https://example.blog/api/blog/revalidate',
      expect.objectContaining({
        body: JSON.stringify({ tag: 'posts' }),
        method: 'POST'
      })
    )
    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/api/revalidate',
      expect.objectContaining({
        body: JSON.stringify({ tag: 'posts' }),
        method: 'POST'
      })
    )
  })

  it('should handle fetch errors gracefully using Promise.allSettled', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    process.env.REVALIDATE_URLS = 'https://example.blog/api/blog/revalidate'
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await invalidateCaches('posts')

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(consoleSpy).toHaveBeenCalledWith(
      'Cache invalidation network error for https://example.blog/api/blog/revalidate:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('should work with different cache tags', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    process.env.REVALIDATE_URLS = 'https://example.blog/api/blog/revalidate'

    await invalidateCaches('profile')

    expect(fetch).toHaveBeenCalledWith(
      'https://example.blog/api/blog/revalidate',
      expect.objectContaining({
        body: JSON.stringify({ tag: 'profile' })
      })
    )
  })

  it('should log error for failed HTTP responses', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    process.env.REVALIDATE_URLS = 'https://example.blog/api/blog/revalidate'
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: 'Invalid secret' }), {
        status: 401,
        statusText: 'Unauthorized'
      })
    )
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await invalidateCaches('posts')

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(consoleSpy).toHaveBeenCalledWith(
      'Cache invalidation failed for https://example.blog/api/blog/revalidate: 401 Unauthorized'
    )

    consoleSpy.mockRestore()
  })

  it('should trim whitespace from URLs', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    process.env.REVALIDATE_URLS =
      ' https://example.blog/api/blog/revalidate , https://example.com/api/revalidate '

    await invalidateCaches('posts')

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenCalledWith(
      'https://example.blog/api/blog/revalidate',
      expect.any(Object)
    )
    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/api/revalidate',
      expect.any(Object)
    )
  })

  it('should use AbortSignal timeout', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    process.env.REVALIDATE_URLS = 'https://example.blog/api/blog/revalidate'

    await invalidateCaches('posts')

    expect(fetch).toHaveBeenCalledWith(
      'https://example.blog/api/blog/revalidate',
      expect.objectContaining({
        signal: expect.any(AbortSignal)
      })
    )
  })
})
