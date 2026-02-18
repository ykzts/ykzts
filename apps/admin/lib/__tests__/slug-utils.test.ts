import { describe, expect, it } from 'vitest'
import { cleanSlug } from '../slug-utils'

describe('cleanSlug', () => {
  describe('Valid slugs', () => {
    it('should preserve valid lowercase slug', () => {
      expect(cleanSlug('hello-world')).toBe('hello-world')
    })

    it('should preserve numbers in slug', () => {
      expect(cleanSlug('article-123')).toBe('article-123')
    })

    it('should preserve multiple hyphens between words', () => {
      expect(cleanSlug('my-blog-post')).toBe('my-blog-post')
    })
  })

  describe('Case normalization', () => {
    it('should convert uppercase to lowercase', () => {
      expect(cleanSlug('HELLO-WORLD')).toBe('hello-world')
    })

    it('should convert mixed case to lowercase', () => {
      expect(cleanSlug('Hello-World')).toBe('hello-world')
    })
  })

  describe('Whitespace handling', () => {
    it('should trim leading whitespace', () => {
      expect(cleanSlug('   hello-world')).toBe('hello-world')
    })

    it('should trim trailing whitespace', () => {
      expect(cleanSlug('hello-world   ')).toBe('hello-world')
    })

    it('should trim both leading and trailing whitespace', () => {
      expect(cleanSlug('   hello-world   ')).toBe('hello-world')
    })

    it('should replace spaces with hyphens', () => {
      expect(cleanSlug('hello world')).toBe('hello-world')
    })
  })

  describe('Invalid character replacement', () => {
    it('should replace special characters with hyphens', () => {
      expect(cleanSlug('hello@world')).toBe('hello-world')
      expect(cleanSlug('hello#world')).toBe('hello-world')
      expect(cleanSlug('hello!world')).toBe('hello-world')
    })

    it('should replace Japanese characters and normalize hyphens', () => {
      expect(cleanSlug('こんにちは世界')).toBe('')
    })

    it('should replace mixed content and normalize hyphens', () => {
      expect(cleanSlug('hello世界world')).toBe('hello-world')
    })

    it('should handle underscores', () => {
      expect(cleanSlug('hello_world')).toBe('hello-world')
    })

    it('should handle dots', () => {
      expect(cleanSlug('hello.world')).toBe('hello-world')
    })
  })

  describe('Multiple hyphens normalization', () => {
    it('should replace multiple consecutive hyphens with single hyphen', () => {
      expect(cleanSlug('hello---world')).toBe('hello-world')
    })

    it('should handle many consecutive hyphens', () => {
      expect(cleanSlug('hello----------world')).toBe('hello-world')
    })

    it('should normalize hyphens from special character replacement', () => {
      expect(cleanSlug('hello@#$%world')).toBe('hello-world')
    })
  })

  describe('Leading and trailing hyphens', () => {
    it('should remove leading hyphen', () => {
      expect(cleanSlug('-hello-world')).toBe('hello-world')
    })

    it('should remove trailing hyphen', () => {
      expect(cleanSlug('hello-world-')).toBe('hello-world')
    })

    it('should remove both leading and trailing hyphens', () => {
      expect(cleanSlug('-hello-world-')).toBe('hello-world')
    })

    it('should remove multiple leading hyphens', () => {
      expect(cleanSlug('---hello-world')).toBe('hello-world')
    })

    it('should remove multiple trailing hyphens', () => {
      expect(cleanSlug('hello-world---')).toBe('hello-world')
    })
  })

  describe('Complex scenarios', () => {
    it('should handle AI-generated slug with extra formatting', () => {
      expect(cleanSlug('  Hello World! 123  ')).toBe('hello-world-123')
    })

    it('should handle Japanese title converted to English', () => {
      expect(cleanSlug('GenAI Slug Generation')).toBe('genai-slug-generation')
    })

    it('should handle slug with multiple transformations needed', () => {
      expect(cleanSlug('  --Hello@World!!--  ')).toBe('hello-world')
    })

    it('should handle empty-like strings after cleaning', () => {
      expect(cleanSlug('---')).toBe('')
      expect(cleanSlug('@#$%')).toBe('')
      expect(cleanSlug('   ')).toBe('')
    })

    it('should preserve valid slug-like strings', () => {
      expect(cleanSlug('my-awesome-blog-post-2024')).toBe(
        'my-awesome-blog-post-2024'
      )
    })
  })

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      expect(cleanSlug('')).toBe('')
    })

    it('should handle single character', () => {
      expect(cleanSlug('a')).toBe('a')
      expect(cleanSlug('1')).toBe('1')
      expect(cleanSlug('-')).toBe('')
    })

    it('should handle only invalid characters', () => {
      expect(cleanSlug('こんにちは')).toBe('')
    })

    it('should handle very long slugs', () => {
      const longSlug = 'a'.repeat(200)
      expect(cleanSlug(longSlug)).toBe(longSlug)
    })
  })
})
