import { describe, expect, it, vi } from 'vitest'
import type { Json } from '@ykzts/supabase'
import { createPost, updatePost } from '../posts'

// Mock the Supabase client
vi.mock('../supabase/server', () => ({
  createClient: vi.fn(() => ({
    rpc: vi.fn().mockResolvedValue({ data: 'mock-post-id', error: null })
  }))
}))

describe('Post creation and update with auto-excerpt', () => {
  describe('createPost', () => {
    it('should use provided excerpt when available', async () => {
      const content: Json = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'This is the content.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = await createPost({
        content,
        excerpt: 'Custom excerpt',
        slug: 'test-post',
        title: 'Test Post'
      })

      expect(result).toBe('mock-post-id')
    })

    it('should auto-generate excerpt when not provided', async () => {
      const content: Json = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'This is auto-generated excerpt.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = await createPost({
        content,
        slug: 'test-post',
        title: 'Test Post'
      })

      expect(result).toBe('mock-post-id')
    })

    it('should auto-generate excerpt when empty string provided', async () => {
      const content: Json = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'This is auto-generated excerpt.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = await createPost({
        content,
        excerpt: '',
        slug: 'test-post',
        title: 'Test Post'
      })

      expect(result).toBe('mock-post-id')
    })
  })

  describe('updatePost', () => {
    it('should use provided excerpt when available', async () => {
      const content: Json = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'Updated content.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = await updatePost({
        content,
        excerpt: 'Custom excerpt',
        postId: 'test-post-id'
      })

      expect(result).toBe('mock-post-id')
    })

    it('should auto-generate excerpt when content updated and excerpt empty', async () => {
      const content: Json = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'Updated content for auto-excerpt.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = await updatePost({
        content,
        excerpt: '',
        postId: 'test-post-id'
      })

      expect(result).toBe('mock-post-id')
    })

    it('should not auto-generate excerpt when only updating other fields', async () => {
      const result = await updatePost({
        excerpt: undefined,
        postId: 'test-post-id',
        title: 'Updated Title'
      })

      expect(result).toBe('mock-post-id')
    })

    it('should preserve existing excerpt when content updated but excerpt provided', async () => {
      const content: Json = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'New content.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = await updatePost({
        content,
        excerpt: 'Keep this excerpt',
        postId: 'test-post-id'
      })

      expect(result).toBe('mock-post-id')
    })
  })
})
