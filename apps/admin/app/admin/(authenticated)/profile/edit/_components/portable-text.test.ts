import { describe, expect, it } from 'vitest'

// Test the Portable Text format structure
describe('Portable Text Format', () => {
  it('should have correct structure for plain text', () => {
    const portableText = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Hello world' }],
        markDefs: [],
        style: 'normal'
      }
    ]

    expect(portableText).toHaveLength(1)
    expect(portableText[0]._type).toBe('block')
    expect(portableText[0].children).toHaveLength(1)
    expect(portableText[0].children[0].text).toBe('Hello world')
  })

  it('should have correct structure for bold text', () => {
    const portableText = [
      {
        _type: 'block',
        children: [
          { _type: 'span', text: 'Normal ' },
          { _type: 'span', marks: ['strong'], text: 'bold' },
          { _type: 'span', text: ' text' }
        ],
        markDefs: [],
        style: 'normal'
      }
    ]

    expect(portableText[0].children[1].marks).toContain('strong')
    expect(portableText[0].children[1].text).toBe('bold')
  })

  it('should have correct structure for italic text', () => {
    const portableText = [
      {
        _type: 'block',
        children: [{ _type: 'span', marks: ['em'], text: 'italic text' }],
        markDefs: [],
        style: 'normal'
      }
    ]

    expect(portableText[0].children[0].marks).toContain('em')
  })

  it('should have correct structure for links', () => {
    const portableText = [
      {
        _type: 'block',
        children: [
          { _type: 'span', marks: ['link-123'], text: 'Click here' }
        ],
        markDefs: [
          { _key: 'link-123', _type: 'link', href: 'https://example.com' }
        ],
        style: 'normal'
      }
    ]

    expect(portableText[0].markDefs).toHaveLength(1)
    expect(portableText[0].markDefs[0]._type).toBe('link')
    expect(portableText[0].markDefs[0].href).toBe('https://example.com')
    expect(portableText[0].children[0].marks).toContain('link-123')
  })

  it('should handle multiple paragraphs', () => {
    const portableText = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'First paragraph' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Second paragraph' }],
        markDefs: [],
        style: 'normal'
      }
    ]

    expect(portableText).toHaveLength(2)
    expect(portableText[0].children[0].text).toBe('First paragraph')
    expect(portableText[1].children[0].text).toBe('Second paragraph')
  })

  it('should handle empty content', () => {
    const portableText = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: '' }],
        markDefs: [],
        style: 'normal'
      }
    ]

    expect(portableText).toHaveLength(1)
    expect(portableText[0].children[0].text).toBe('')
  })

  it('should handle combined formatting', () => {
    const portableText = [
      {
        _type: 'block',
        children: [
          { _type: 'span', marks: ['strong', 'em'], text: 'bold and italic' }
        ],
        markDefs: [],
        style: 'normal'
      }
    ]

    expect(portableText[0].children[0].marks).toContain('strong')
    expect(portableText[0].children[0].marks).toContain('em')
  })

  it('should validate JSON serialization', () => {
    const portableText = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Test' }],
        markDefs: [],
        style: 'normal'
      }
    ]

    const json = JSON.stringify(portableText)
    const parsed = JSON.parse(json)

    expect(parsed).toEqual(portableText)
  })
})
