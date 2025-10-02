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
      const { getWorks } = await import('../../lib/sanity')
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

      const { getWorks } = await import('../../lib/sanity')
      await expect(getWorks()).rejects.toThrow()
    })

    it('should handle empty array response', async () => {
      mockFetch.mockResolvedValue([])

      const { getWorks } = await import('../../lib/sanity')
      const result = await getWorks()

      expect(result).toEqual([])
    })
  })

  describe('getProfile', () => {
    it('should return parsed profile data when valid data is returned', async () => {
      const mockData = {
        bio: 'Test bio',
        bioJa: 'テストバイオ',
        email: 'test@example.com',
        name: 'Test User',
        nameJa: 'テストユーザー',
        socialLinks: [
          {
            label: 'GitHub Account',
            labelJa: 'GitHubアカウント',
            platform: 'GitHub',
            url: 'https://github.com/test'
          }
        ],
        tagline: 'Test tagline',
        taglineJa: 'テストタグライン'
      }

      mockFetch.mockResolvedValue(mockData)

      const { getProfile } = await import('../../lib/sanity')
      const result = await getProfile()

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('*[_type == "profile"]')
      )
    })

    it('should return null when no profile exists', async () => {
      mockFetch.mockResolvedValue(null)

      const { getProfile } = await import('../../lib/sanity')
      const result = await getProfile()

      expect(result).toBeNull()
    })

    it('should throw an error when invalid email is returned', async () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'Test User'
      }

      mockFetch.mockResolvedValue(invalidData)

      const { getProfile } = await import('../../lib/sanity')
      await expect(getProfile()).rejects.toThrow()
    })

    it('should handle optional fields', async () => {
      const minimalData = {
        email: 'test@example.com',
        name: 'Test User'
      }

      mockFetch.mockResolvedValue(minimalData)

      const { getProfile } = await import('../../lib/sanity')
      const result = await getProfile()

      expect(result).toEqual(minimalData)
    })
  })
})
