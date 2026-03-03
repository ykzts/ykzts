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

  it('converts _type code block to fenced code block', () => {
    const content = [
      {
        _key: 'key_12',
        _type: 'code',
        code: 'server {\n  listen 80;\n}',
        language: 'nginx'
      }
    ]
    const result = portableTextToMarkdown(content)
    expect(result).toContain('```nginx')
    expect(result).toContain('server {')
    expect(result).toContain('```')
  })

  it('converts _type code block with null language to fenced code block', () => {
    const content = [
      {
        _key: 'key_12',
        _type: 'code',
        code: 'console.log("hello")',
        language: null
      }
    ]
    const result = portableTextToMarkdown(content)
    expect(result).toContain('```\nconsole.log("hello")\n```')
  })

  it('converts code block (style: code) to fenced code block', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'console.log("hello")' }],
        language: 'javascript',
        markDefs: [],
        style: 'code'
      }
    ]
    const result = portableTextToMarkdown(content)
    expect(result).toContain('```javascript')
    expect(result).toContain('console.log("hello")')
    expect(result).toContain('```')
  })

  it('converts code block without language to fenced code block', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'plain code' }],
        markDefs: [],
        style: 'code'
      }
    ]
    const result = portableTextToMarkdown(content)
    expect(result).toContain('```\nplain code\n```')
  })

  it('converts image block to markdown image syntax', () => {
    const content = [
      {
        _type: 'image',
        alt: 'A test image',
        asset: {
          _type: 'reference',
          url: 'https://example.com/image.png'
        }
      }
    ]
    const result = portableTextToMarkdown(content)
    expect(result).toContain('![A test image](https://example.com/image.png)')
  })

  it('converts image block without alt text to markdown image syntax', () => {
    const content = [
      {
        _type: 'image',
        asset: {
          _type: 'reference',
          url: 'https://example.com/image.png'
        }
      }
    ]
    const result = portableTextToMarkdown(content)
    expect(result).toContain('![](https://example.com/image.png)')
  })

  it('returns empty string for image block without url', () => {
    const content = [
      {
        _type: 'image',
        alt: 'No URL',
        asset: { _type: 'reference' }
      }
    ]
    const result = portableTextToMarkdown(content)
    expect(result).toBe('')
  })

  it('shifts heading levels by headingOffset', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Section' }],
        style: 'h2'
      }
    ]
    const result = portableTextToMarkdown(content, { headingOffset: 3 })
    expect(result).toContain('##### Section')
    expect(result).not.toMatch(/^## Section/m)
  })

  it('clamps headings at h6 when offset exceeds max', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Deep heading' }],
        style: 'h4'
      }
    ]
    const result = portableTextToMarkdown(content, { headingOffset: 5 })
    expect(result).toContain('###### Deep heading')
  })

  it('does not shift headings when headingOffset is 0', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Normal heading' }],
        style: 'h1'
      }
    ]
    const result = portableTextToMarkdown(content, { headingOffset: 0 })
    expect(result).toContain('# Normal heading')
  })
})
