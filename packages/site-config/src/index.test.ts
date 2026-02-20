import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSiteHost, getSiteName, getSiteOrigin } from './index'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getSiteOrigin', () => {
  it('returns the fallback URL when env is not set', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', undefined)
    expect(getSiteOrigin().href).toBe('https://example.com/')
  })

  it('returns the URL from NEXT_PUBLIC_SITE_ORIGIN when set', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', 'https://ykzts.com')
    expect(getSiteOrigin().href).toBe('https://ykzts.com/')
  })

  it('falls back to example.com when the env value is an invalid URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', 'not-a-url')
    expect(getSiteOrigin().href).toBe('https://example.com/')
  })
})

describe('getSiteHost', () => {
  it('returns the host without protocol when env is not set', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', undefined)
    expect(getSiteHost()).toBe('example.com')
  })

  it('returns the host from NEXT_PUBLIC_SITE_ORIGIN when set', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', 'https://ykzts.com')
    expect(getSiteHost()).toBe('ykzts.com')
  })
})

describe('getSiteName', () => {
  it('returns the fallback name when env is not set', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_NAME', undefined)
    expect(getSiteName()).toBe('example.com')
  })

  it('returns the name from NEXT_PUBLIC_SITE_NAME when set', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_NAME', 'ykzts.com')
    expect(getSiteName()).toBe('ykzts.com')
  })
})
