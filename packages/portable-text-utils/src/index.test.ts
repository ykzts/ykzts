import { describe, expect, it } from 'vitest'
import { portableTextToMarkdown } from './index'

describe('portableTextToMarkdown', () => {
  it('returns empty string for null input', () => {
    expect(portableTextToMarkdown(null)).toBe('')
  })

  it('returns empty string for undefined input', () => {
    expect(portableTextToMarkdown(undefined)).toBe('')
  })

  it('returns empty string for empty array', () => {
    expect(portableTextToMarkdown([])).toBe('')
  })

  it('converts a paragraph block to markdown', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Hello world' }],
        style: 'normal'
      }
    ]
    const result = portableTextToMarkdown(content)
    expect(result).toContain('Hello world')
  })

  it('converts a heading block to markdown', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'My Heading' }],
        style: 'h2'
      }
    ]
    const result = portableTextToMarkdown(content)
    expect(result).toContain('My Heading')
    expect(result).toContain('##')
  })

  it('converts multiple blocks to markdown', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'First paragraph' }],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Second paragraph' }],
        style: 'normal'
      }
    ]
    const result = portableTextToMarkdown(content)
    expect(result).toContain('First paragraph')
    expect(result).toContain('Second paragraph')
  })

  it('returns empty string on non-array input', () => {
    expect(portableTextToMarkdown('not an array')).toBe('')
    expect(portableTextToMarkdown({ invalid: 'object' })).toBe('')
  })
})
