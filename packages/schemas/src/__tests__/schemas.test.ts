import { describe, expect, it } from 'vitest'
import { post, profile, work } from '../index.js'

describe('Sanity Schemas', () => {
  describe('post schema', () => {
    it('should have correct type and name', () => {
      expect(post.type).toBe('document')
      expect(post.name).toBe('post')
      expect(post.title).toBe('Post')
    })

    it('should have required fields', () => {
      expect(post.fields).toBeDefined()
      expect(post.fields.length).toBeGreaterThan(0)

      const titleField = post.fields.find((field) => field.name === 'title')
      expect(titleField).toBeDefined()
      expect(titleField?.type).toBe('string')
    })
  })

  describe('work schema', () => {
    it('should have correct type and name', () => {
      expect(work.type).toBe('document')
      expect(work.name).toBe('work')
      expect(work.title).toBe('Work')
    })

    it('should have required fields', () => {
      expect(work.fields).toBeDefined()
      expect(work.fields.length).toBeGreaterThan(0)

      const titleField = work.fields.find((field) => field.name === 'title')
      const contentField = work.fields.find((field) => field.name === 'content')
      const slugField = work.fields.find((field) => field.name === 'slug')
      const startsAtField = work.fields.find(
        (field) => field.name === 'startsAt'
      )

      expect(titleField).toBeDefined()
      expect(titleField?.type).toBe('string')

      expect(contentField).toBeDefined()
      expect(contentField?.type).toBe('array')

      expect(slugField).toBeDefined()
      expect(slugField?.type).toBe('slug')

      expect(startsAtField).toBeDefined()
      expect(startsAtField?.type).toBe('date')
    })

    it('should have ordering configuration', () => {
      expect(work.orderings).toBeDefined()
      expect(work.orderings.length).toBeGreaterThan(0)

      const startsAtOrdering = work.orderings.find(
        (ordering) => ordering.name === 'startsAt'
      )
      expect(startsAtOrdering).toBeDefined()
      expect(startsAtOrdering?.by[0].field).toBe('startsAt')
      expect(startsAtOrdering?.by[0].direction).toBe('desc')
    })
  })

  describe('profile schema', () => {
    it('should have correct type and name', () => {
      expect(profile.type).toBe('document')
      expect(profile.name).toBe('profile')
      expect(profile.title).toBe('Profile')
    })

    it('should have required fields', () => {
      expect(profile.fields).toBeDefined()
      expect(profile.fields.length).toBeGreaterThan(0)
    })
  })
})
