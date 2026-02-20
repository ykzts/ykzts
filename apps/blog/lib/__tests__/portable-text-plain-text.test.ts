import { describe, expect, it } from 'vitest'
import { portableTextToPlainText } from '../portable-text'

describe('portableTextToPlainText', () => {
  it('returns empty string for null input', () => {
    expect(portableTextToPlainText(null)).toBe('')
  })

  it('returns empty string for undefined input', () => {
    expect(portableTextToPlainText(undefined)).toBe('')
  })

  it('returns empty string for empty array', () => {
    expect(portableTextToPlainText([])).toBe('')
  })

  it('converts a single text block to plain text', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Hello world' }]
      }
    ]
    expect(portableTextToPlainText(content)).toBe('Hello world')
  })

  it('joins multiple text blocks with newlines', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'First paragraph' }]
      },
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Second paragraph' }]
      }
    ]
    expect(portableTextToPlainText(content)).toBe(
      'First paragraph\nSecond paragraph'
    )
  })

  it('concatenates children text within a block', () => {
    const content = [
      {
        _type: 'block',
        children: [
          { _type: 'span', text: 'Hello ' },
          { _type: 'span', text: 'world' }
        ]
      }
    ]
    expect(portableTextToPlainText(content)).toBe('Hello world')
  })

  it('converts code block with language', () => {
    const content = [
      {
        _type: 'code',
        code: 'const x = 1',
        language: 'javascript'
      }
    ]
    expect(portableTextToPlainText(content)).toBe(
      '[code:javascript]\nconst x = 1'
    )
  })

  it('converts code block without language', () => {
    const content = [{ _type: 'code', code: 'const x = 1' }]
    expect(portableTextToPlainText(content)).toBe('[code]\nconst x = 1')
  })

  it('converts image block with alt text', () => {
    const content = [
      {
        _type: 'image',
        alt: 'A beautiful sunset',
        asset: { _type: 'reference', url: 'https://example.com/image.jpg' }
      }
    ]
    expect(portableTextToPlainText(content)).toBe('[image: A beautiful sunset]')
  })

  it('converts image block without alt text', () => {
    const content = [
      {
        _type: 'image',
        asset: { _type: 'reference', url: 'https://example.com/image.jpg' }
      }
    ]
    expect(portableTextToPlainText(content)).toBe('[image]')
  })

  it('handles unknown block types by returning empty string', () => {
    const content = [{ _type: 'unknown' }]
    expect(portableTextToPlainText(content)).toBe('')
  })

  it('handles mixed block types', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Intro text' }]
      },
      {
        _type: 'code',
        code: 'console.log("hello")',
        language: 'javascript'
      },
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Outro text' }]
      }
    ]
    expect(portableTextToPlainText(content)).toBe(
      'Intro text\n[code:javascript]\nconsole.log("hello")\nOutro text'
    )
  })

  it('handles block with no children', () => {
    const content = [{ _type: 'block', children: [] }]
    expect(portableTextToPlainText(content)).toBe('')
  })

  it('ignores non-object items in the array', () => {
    const content = [null, undefined, 42, 'string']
    expect(portableTextToPlainText(content as unknown[])).toBe('\n\n\n')
  })
})
