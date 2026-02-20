import { describe, expect, it } from 'vitest'
import { getBlogPostUrl } from './blog-urls'

describe('getBlogPostUrl', () => {
  it('should generate correct URL for a valid post', () => {
    const url = getBlogPostUrl('my-awesome-post', '2024-02-15T10:30:00.000Z')
    expect(url).toBe('https://example.com/blog/2024/02/15/my-awesome-post')
  })

  it('should handle single digit months and days', () => {
    const url = getBlogPostUrl('test-post', '2024-01-05T10:30:00.000Z')
    expect(url).toBe('https://example.com/blog/2024/01/05/test-post')
  })

  it('should handle double digit months and days', () => {
    const url = getBlogPostUrl('test-post', '2024-12-25T10:30:00.000Z')
    expect(url).toBe('https://example.com/blog/2024/12/25/test-post')
  })

  it('should return null when publishedAt is null', () => {
    const url = getBlogPostUrl('my-post', null)
    expect(url).toBeNull()
  })

  it('should return null when publishedAt is empty string', () => {
    const url = getBlogPostUrl('my-post', '')
    expect(url).toBeNull()
  })

  it('should return null when slug is empty', () => {
    const url = getBlogPostUrl('', '2024-02-15T10:30:00.000Z')
    expect(url).toBeNull()
  })

  it('should return null when publishedAt is invalid', () => {
    const url = getBlogPostUrl('my-post', 'invalid-date')
    expect(url).toBeNull()
  })

  it('should handle UTC dates correctly', () => {
    const url = getBlogPostUrl('test-post', '2024-06-30T23:59:59.999Z')
    expect(url).toBe('https://example.com/blog/2024/06/30/test-post')
  })

  it('should handle year transitions', () => {
    const url = getBlogPostUrl('new-year-post', '2024-01-01T00:00:00.000Z')
    expect(url).toBe('https://example.com/blog/2024/01/01/new-year-post')
  })

  it('should return null when slug is whitespace only', () => {
    const url = getBlogPostUrl('   ', '2024-02-15T10:30:00.000Z')
    expect(url).toBeNull()
  })

  it('should encode special characters in slug', () => {
    const url = getBlogPostUrl('my awesome post', '2024-02-15T10:30:00.000Z')
    expect(url).toBe('https://example.com/blog/2024/02/15/my%20awesome%20post')
  })
})
