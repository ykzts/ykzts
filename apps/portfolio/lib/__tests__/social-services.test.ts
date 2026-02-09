import { describe, expect, it } from 'vitest'
import { getSocialInfo } from '../social-services'

describe('getSocialInfo', () => {
  const name = 'Test User'

  it('should return correct info for facebook', () => {
    const result = getSocialInfo(
      'https://www.facebook.com/example',
      'facebook',
      name
    )

    expect(result.label).toBe('Test UserのFacebookアカウント')
    expect(result.url).toBe('https://www.facebook.com/example')
    expect(result.icon).toBeDefined()
  })

  it('should return correct info for github', () => {
    const result = getSocialInfo('https://github.com/testuser', 'github', name)

    expect(result.label).toBe('Test UserのGitHubアカウント')
    expect(result.url).toBe('https://github.com/testuser')
    expect(result.icon).toBeDefined()
  })

  it('should return correct info for mastodon', () => {
    const result = getSocialInfo(
      'https://test.example/@testuser',
      'mastodon',
      name
    )

    expect(result.label).toBe('Test UserのMastodonアカウント')
    expect(result.url).toBe('https://test.example/@testuser')
    expect(result.icon).toBeDefined()
  })

  it('should return correct info for threads', () => {
    const result = getSocialInfo(
      'https://threads.net/@example',
      'threads',
      name
    )

    expect(result.label).toBe('Test UserのThreadsアカウント')
    expect(result.url).toBe('https://threads.net/@example')
    expect(result.icon).toBeDefined()
  })

  it('should return correct info for x', () => {
    const result = getSocialInfo('https://x.com/testuser', 'x', name)

    expect(result.label).toBe('Test UserのXアカウント')
    expect(result.url).toBe('https://x.com/testuser')
    expect(result.icon).toBeDefined()
  })

  it('should throw error for unknown service', () => {
    expect(() => {
      getSocialInfo('https://example.com', 'unknown', name)
    }).toThrow('Unknown or missing social service: unknown')
  })

  it('should throw error for null service', () => {
    expect(() => {
      getSocialInfo('https://example.com', null, name)
    }).toThrow('Unknown or missing social service: null')
  })

  it('should use custom name in label', () => {
    const customName = 'テストユーザー'
    const result = getSocialInfo(
      'https://github.com/test',
      'github',
      customName
    )

    expect(result.label).toBe('テストユーザーのGitHubアカウント')
  })
})
