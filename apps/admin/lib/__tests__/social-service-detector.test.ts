import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  detectServiceFromURL,
  extractFediverseCreatorFromURL
} from '../social-service-detector'

// Mock fetch for NodeInfo tests
global.fetch = vi.fn()

describe('extractFediverseCreatorFromURL', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should extract fediverse creator from Mastodon URL via WebFinger', async () => {
    const mockFetch = fetch as ReturnType<typeof vi.fn>
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ subject: 'acct:username@mastodon.social' }),
      ok: true
    } as Response)

    const result = await extractFediverseCreatorFromURL(
      'https://mastodon.social/@username'
    )
    expect(result).toBe('@username@mastodon.social')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://mastodon.social/.well-known/webfinger?resource=acct%3Ausername%40mastodon.social',
      expect.objectContaining({ headers: expect.anything() })
    )
  })

  it('should return the canonical subject from WebFinger even if it differs', async () => {
    const mockFetch = fetch as ReturnType<typeof vi.fn>
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ subject: 'acct:canonical@mastodon.social' }),
      ok: true
    } as Response)

    const result = await extractFediverseCreatorFromURL(
      'https://mastodon.social/@username/123456'
    )
    expect(result).toBe('@canonical@mastodon.social')
  })

  it('should return null when WebFinger request fails', async () => {
    const mockFetch = fetch as ReturnType<typeof vi.fn>
    mockFetch.mockResolvedValueOnce({ ok: false } as Response)

    const result = await extractFediverseCreatorFromURL(
      'https://fedibird.com/@ykzts'
    )
    expect(result).toBeNull()
  })

  it('should return null when WebFinger returns no acct subject', async () => {
    const mockFetch = fetch as ReturnType<typeof vi.fn>
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ subject: 'https://mastodon.social/users/username' }),
      ok: true
    } as Response)

    const result = await extractFediverseCreatorFromURL(
      'https://mastodon.social/@username'
    )
    expect(result).toBeNull()
  })

  it('should return null for URLs without /@username pattern', async () => {
    const result = await extractFediverseCreatorFromURL(
      'https://github.com/username'
    )
    expect(result).toBeNull()
  })

  it('should return null for invalid URL', async () => {
    const result = await extractFediverseCreatorFromURL('not-a-url')
    expect(result).toBeNull()
  })

  it('should return null for empty string', async () => {
    const result = await extractFediverseCreatorFromURL('')
    expect(result).toBeNull()
  })

  it('should return null for URL with only slash path', async () => {
    const result = await extractFediverseCreatorFromURL('https://example.com/')
    expect(result).toBeNull()
  })

  it('should return null for HTTP URL (not HTTPS)', async () => {
    const result = await extractFediverseCreatorFromURL(
      'http://mastodon.social/@username'
    )
    expect(result).toBeNull()
  })

  it('should return null for private IP addresses (192.168.x.x)', async () => {
    const result = await extractFediverseCreatorFromURL(
      'https://192.168.1.1/@username'
    )
    expect(result).toBeNull()
  })

  it('should return null for private IP addresses (10.x.x.x)', async () => {
    const result = await extractFediverseCreatorFromURL(
      'https://10.0.0.1/@username'
    )
    expect(result).toBeNull()
  })

  it('should return null for private IP addresses (172.16-31.x.x)', async () => {
    const result = await extractFediverseCreatorFromURL(
      'https://172.16.0.1/@username'
    )
    expect(result).toBeNull()
  })

  it('should return null for loopback address (127.x.x.x)', async () => {
    const result = await extractFediverseCreatorFromURL(
      'https://127.0.0.1/@username'
    )
    expect(result).toBeNull()
  })

  it('should return null for localhost', async () => {
    const result = await extractFediverseCreatorFromURL(
      'https://localhost/@username'
    )
    expect(result).toBeNull()
  })

  it('should return null for link-local addresses (169.254.x.x)', async () => {
    const result = await extractFediverseCreatorFromURL(
      'https://169.254.1.1/@username'
    )
    expect(result).toBeNull()
  })

  it('should return null on WebFinger fetch error', async () => {
    const mockFetch = fetch as ReturnType<typeof vi.fn>
    mockFetch.mockRejectedValueOnce(new Error('Timeout'))

    const result = await extractFediverseCreatorFromURL(
      'https://mastodon.social/@username'
    )
    expect(result).toBeNull()
  })
})

describe('detectServiceFromURL', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Known services', () => {
    it('should detect GitHub', async () => {
      const result = await detectServiceFromURL('https://github.com/username')
      expect(result).toBe('github')
    })

    it('should detect X (x.com)', async () => {
      const result = await detectServiceFromURL('https://x.com/username')
      expect(result).toBe('x')
    })

    it('should detect X (twitter.com)', async () => {
      const result = await detectServiceFromURL('https://twitter.com/username')
      expect(result).toBe('x')
    })

    it('should detect Facebook (facebook.com)', async () => {
      const result = await detectServiceFromURL('https://facebook.com/username')
      expect(result).toBe('facebook')
    })

    it('should detect Facebook (fb.com)', async () => {
      const result = await detectServiceFromURL('https://fb.com/username')
      expect(result).toBe('facebook')
    })

    it('should detect Threads', async () => {
      const result = await detectServiceFromURL('https://threads.net/@username')
      expect(result).toBe('threads')
    })

    it('should detect Mastodon (mastodon.social)', async () => {
      const result = await detectServiceFromURL(
        'https://mastodon.social/@username'
      )
      expect(result).toBe('mastodon')
    })

    it('should detect Mastodon (mstdn.jp)', async () => {
      const result = await detectServiceFromURL('https://mstdn.jp/@username')
      expect(result).toBe('mastodon')
    })

    it('should detect Mastodon (fedibird.com)', async () => {
      const result = await detectServiceFromURL(
        'https://fedibird.com/@username'
      )
      expect(result).toBe('mastodon')
    })

    it('should detect Mastodon (pawoo.net)', async () => {
      const result = await detectServiceFromURL('https://pawoo.net/@username')
      expect(result).toBe('mastodon')
    })

    it('should detect subdomain of known service', async () => {
      const result = await detectServiceFromURL(
        'https://www.github.com/username'
      )
      expect(result).toBe('github')
    })
  })

  describe('NodeInfo protocol', () => {
    it('should detect Mastodon via NodeInfo', async () => {
      const mockFetch = fetch as ReturnType<typeof vi.fn>

      // Mock well-known response
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          links: [
            {
              href: 'https://unknown.social/nodeinfo/2.1',
              rel: 'http://nodeinfo.diaspora.software/ns/schema/2.1'
            }
          ]
        }),
        ok: true
      } as Response)

      // Mock nodeinfo response
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          software: {
            name: 'mastodon'
          }
        }),
        ok: true
      } as Response)

      const result = await detectServiceFromURL(
        'https://unknown.social/@username'
      )
      expect(result).toBe('mastodon')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should detect Pleroma via NodeInfo', async () => {
      const mockFetch = fetch as ReturnType<typeof vi.fn>

      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          links: [
            {
              href: 'https://pleroma.example/nodeinfo/2.0',
              rel: 'http://nodeinfo.diaspora.software/ns/schema/2.0'
            }
          ]
        }),
        ok: true
      } as Response)

      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          software: {
            name: 'pleroma'
          }
        }),
        ok: true
      } as Response)

      const result = await detectServiceFromURL('https://pleroma.example/user')
      expect(result).toBe('mastodon')
    })

    it('should detect Misskey via NodeInfo', async () => {
      const mockFetch = fetch as ReturnType<typeof vi.fn>

      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          links: [
            {
              href: 'https://misskey.example/nodeinfo/2.1',
              rel: 'http://nodeinfo.diaspora.software/ns/schema/2.1'
            }
          ]
        }),
        ok: true
      } as Response)

      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          software: {
            name: 'misskey'
          }
        }),
        ok: true
      } as Response)

      const result = await detectServiceFromURL('https://misskey.example/notes')
      expect(result).toBe('mastodon')
    })

    it('should detect Firefish via NodeInfo', async () => {
      const mockFetch = fetch as ReturnType<typeof vi.fn>

      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          links: [
            {
              href: 'https://firefish.example/nodeinfo/2.1',
              rel: 'http://nodeinfo.diaspora.software/ns/schema/2.1'
            }
          ]
        }),
        ok: true
      } as Response)

      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          software: {
            name: 'firefish'
          }
        }),
        ok: true
      } as Response)

      const result = await detectServiceFromURL(
        'https://firefish.example/notes'
      )
      expect(result).toBe('mastodon')
    })

    it('should return null if NodeInfo well-known fails', async () => {
      const mockFetch = fetch as ReturnType<typeof vi.fn>

      mockFetch.mockResolvedValueOnce({
        ok: false
      } as Response)

      const result = await detectServiceFromURL('https://unknown.example/user')
      expect(result).toBeNull()
    })

    it('should return null if NodeInfo endpoint fails', async () => {
      const mockFetch = fetch as ReturnType<typeof vi.fn>

      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          links: [
            {
              href: 'https://unknown.example/nodeinfo/2.1',
              rel: 'http://nodeinfo.diaspora.software/ns/schema/2.1'
            }
          ]
        }),
        ok: true
      } as Response)

      mockFetch.mockResolvedValueOnce({
        ok: false
      } as Response)

      const result = await detectServiceFromURL('https://unknown.example/user')
      expect(result).toBeNull()
    })

    it('should return null for unknown software', async () => {
      const mockFetch = fetch as ReturnType<typeof vi.fn>

      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          links: [
            {
              href: 'https://unknown.example/nodeinfo/2.1',
              rel: 'http://nodeinfo.diaspora.software/ns/schema/2.1'
            }
          ]
        }),
        ok: true
      } as Response)

      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          software: {
            name: 'unknown-software'
          }
        }),
        ok: true
      } as Response)

      const result = await detectServiceFromURL('https://unknown.example/user')
      expect(result).toBeNull()
    })

    it('should handle timeout', async () => {
      const mockFetch = fetch as ReturnType<typeof vi.fn>

      mockFetch.mockRejectedValueOnce(new Error('Timeout'))

      const result = await detectServiceFromURL('https://timeout.example/user')
      expect(result).toBeNull()
    })
  })

  describe('Invalid URLs', () => {
    it('should return null for invalid URL', async () => {
      const result = await detectServiceFromURL('not-a-url')
      expect(result).toBeNull()
    })

    it('should return null for empty string', async () => {
      const result = await detectServiceFromURL('')
      expect(result).toBeNull()
    })
  })
})
