import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock environment variables first
vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'test-dataset')
vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'test-project-id')

// Mock @sanity/client
const mockFetch = vi.fn()
vi.mock('@sanity/client', () => ({
  createClient: vi.fn(() => ({
    fetch: mockFetch
  }))
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  cacheTag: vi.fn()
}))

describe('Sanity utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getWorks', () => {
    it('should return parsed works data when valid data is returned', async () => {
      const mockData = [
        {
          content: [{ _type: 'block', children: [{ text: 'Test content' }] }],
          slug: 'test-work',
          title: 'Test Work'
        }
      ]

      mockFetch.mockResolvedValue(mockData)

      // Import after mocking
      const { getWorks } = await import('../sanity')
      const result = await getWorks()

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('*[_type == "work"]')
      )
    })

    it('should throw an error when invalid data is returned', async () => {
      const invalidData = [
        {
          content: [{ _type: 'block', children: [{ text: 'Test content' }] }],
          slug: 'test-work'
          // Missing required title field
        }
      ]

      mockFetch.mockResolvedValue(invalidData)

      const { getWorks } = await import('../sanity')
      await expect(getWorks()).rejects.toThrow()
    })

    it('should handle empty array response', async () => {
      mockFetch.mockResolvedValue([])

      const { getWorks } = await import('../sanity')
      const result = await getWorks()

      expect(result).toEqual([])
    })
  })
})
