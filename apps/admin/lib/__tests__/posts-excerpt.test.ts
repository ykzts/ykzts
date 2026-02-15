import type { Json } from '@ykzts/supabase'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPost, updatePost } from '../posts'

// Mock the Supabase client with parameter capture
const mockRpc = vi.fn().mockResolvedValue({ data: 'mock-post-id', error: null })

vi.mock('../supabase/server', () => ({
  createClient: vi.fn(() => ({
    rpc: mockRpc
  }))
}))

describe('Post creation and update with auto-excerpt', () => {
  beforeEach(() => {
    mockRpc.mockClear()
  })

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
      expect(mockRpc).toHaveBeenCalledWith('create_post', {
        p_content: content,
        p_excerpt: 'Custom excerpt',
        p_published_at: undefined,
        p_slug: 'test-post',
        p_status: undefined,
        p_tags: undefined,
        p_title: 'Test Post'
      })
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
      const call = mockRpc.mock.calls[0]
      expect(call[0]).toBe('create_post')
      expect(call[1].p_excerpt).toBe('This is auto-generated excerpt.')
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
      const call = mockRpc.mock.calls[0]
      expect(call[0]).toBe('create_post')
      expect(call[1].p_excerpt).toBe('This is auto-generated excerpt.')
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
      expect(mockRpc).toHaveBeenCalledWith('update_post', {
        p_change_summary: undefined,
        p_content: content,
        p_excerpt: 'Custom excerpt',
        p_post_id: 'test-post-id',
        p_published_at: undefined,
        p_slug: undefined,
        p_status: undefined,
        p_tags: undefined,
        p_title: undefined
      })
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
      const call = mockRpc.mock.calls[0]
      expect(call[0]).toBe('update_post')
      expect(call[1].p_excerpt).toBe('Updated content for auto-excerpt.')
    })

    it('should not auto-generate excerpt when content updated but excerpt undefined', async () => {
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
        excerpt: undefined,
        postId: 'test-post-id'
      })

      expect(result).toBe('mock-post-id')
      const call = mockRpc.mock.calls[0]
      expect(call[0]).toBe('update_post')
      // undefined means "don't update excerpt" - preserve existing in database
      expect(call[1].p_excerpt).toBeUndefined()
    })

    it('should not auto-generate excerpt when only updating other fields', async () => {
      const result = await updatePost({
        excerpt: undefined,
        postId: 'test-post-id',
        title: 'Updated Title'
      })

      expect(result).toBe('mock-post-id')
      const call = mockRpc.mock.calls[0]
      expect(call[0]).toBe('update_post')
      expect(call[1].p_excerpt).toBeUndefined()
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
      const call = mockRpc.mock.calls[0]
      expect(call[0]).toBe('update_post')
      expect(call[1].p_excerpt).toBe('Keep this excerpt')
    })
  })
})
