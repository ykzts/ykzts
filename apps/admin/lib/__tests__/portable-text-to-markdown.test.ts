import { describe, expect, it } from 'vitest'
import { portableTextToMarkdown } from '../portable-text-to-markdown'

describe('portableTextToMarkdown', () => {
  it('should convert simple Portable Text to Markdown', () => {
    const portableText = [
      {
        _key: '1',
        _type: 'block',
        children: [
          {
            _key: '1-1',
            _type: 'span',
            marks: [],
            text: 'Hello world'
          }
        ],
        style: 'normal'
      }
    ]

    const result = portableTextToMarkdown(portableText)
    expect(result).toContain('Hello world')
  })

  it('should convert heading to Markdown', () => {
    const portableText = [
      {
        _key: '1',
        _type: 'block',
        children: [
          {
            _key: '1-1',
            _type: 'span',
            marks: [],
            text: 'Title'
          }
        ],
        style: 'h1'
      }
    ]

    const result = portableTextToMarkdown(portableText)
    expect(result).toContain('# Title')
  })

  it('should convert bold text to Markdown', () => {
    const portableText = [
      {
        _key: '1',
        _type: 'block',
        children: [
          {
            _key: '1-1',
            _type: 'span',
            marks: ['strong'],
            text: 'Bold text'
          }
        ],
        markDefs: [],
        style: 'normal'
      }
    ]

    const result = portableTextToMarkdown(portableText)
    expect(result).toContain('**Bold text**')
  })

  it('should return empty string for undefined content', () => {
    const result = portableTextToMarkdown(undefined)
    expect(result).toBe('')
  })

  it('should return empty string for non-array content', () => {
    const result = portableTextToMarkdown({ invalid: 'object' })
    expect(result).toBe('')
  })

  it('should handle empty array', () => {
    const result = portableTextToMarkdown([])
    expect(result).toBe('')
  })

  it('should convert multiple paragraphs', () => {
    const portableText = [
      {
        _key: '1',
        _type: 'block',
        children: [
          {
            _key: '1-1',
            _type: 'span',
            marks: [],
            text: 'First paragraph'
          }
        ],
        style: 'normal'
      },
      {
        _key: '2',
        _type: 'block',
        children: [
          {
            _key: '2-1',
            _type: 'span',
            marks: [],
            text: 'Second paragraph'
          }
        ],
        style: 'normal'
      }
    ]

    const result = portableTextToMarkdown(portableText)
    expect(result).toContain('First paragraph')
    expect(result).toContain('Second paragraph')
  })

  it('should convert lists to Markdown', () => {
    const portableText = [
      {
        _key: '1',
        _type: 'block',
        children: [
          {
            _key: '1-1',
            _type: 'span',
            marks: [],
            text: 'Item 1'
          }
        ],
        listItem: 'bullet',
        style: 'normal'
      },
      {
        _key: '2',
        _type: 'block',
        children: [
          {
            _key: '2-1',
            _type: 'span',
            marks: [],
            text: 'Item 2'
          }
        ],
        listItem: 'bullet',
        style: 'normal'
      }
    ]

    const result = portableTextToMarkdown(portableText)
    expect(result).toContain('Item 1')
    expect(result).toContain('Item 2')
  })
})
