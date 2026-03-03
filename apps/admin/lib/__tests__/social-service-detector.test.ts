import { beforeEach, describe, expect, it, vi } from 'vitest'
import { detectServiceFromURL } from '../social-service-detector'

// Mock fetch for NodeInfo tests
global.fetch = vi.fn()

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
