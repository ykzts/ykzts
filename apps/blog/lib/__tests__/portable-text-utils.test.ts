import type { PortableTextBlock } from '@portabletext/types'
import { extractFirstParagraph } from '@ykzts/portable-text-utils'
import { describe, expect, it } from 'vitest'
import type { PortableTextValue } from '../portable-text'

describe('extractFirstParagraph', () => {
  it('should extract text from the first paragraph', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [
          {
            _key: '1-1',
            _type: 'span',
            marks: [],
            text: 'This is the first paragraph.'
          }
        ],
        markDefs: [],
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
            text: 'This is the second paragraph.'
          }
        ],
        markDefs: [],
        style: 'normal'
      }
    ]

    const result = extractFirstParagraph(content)
    expect(result).toBe('This is the first paragraph.')
  })

  it('should concatenate text from multiple spans in a paragraph', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [
          { _key: '1-1', _type: 'span', marks: [], text: 'This is ' },
          { _key: '1-2', _type: 'span', marks: ['strong'], text: 'important' },
          { _key: '1-3', _type: 'span', marks: [], text: ' text.' }
        ],
        markDefs: [],
        style: 'normal'
      }
    ]

    const result = extractFirstParagraph(content)
    expect(result).toBe('This is important text.')
  })

  it('should truncate text longer than maxLength and add ellipsis', () => {
    const longText = 'A'.repeat(200)
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [{ _key: '1-1', _type: 'span', marks: [], text: longText }],
        markDefs: [],
        style: 'normal'
      }
    ]

    const result = extractFirstParagraph(content, 150)
    expect(result).toBe(`${'A'.repeat(150)}...`)
    expect(result.length).toBe(153) // 150 + 3 for ellipsis
  })

  it('should respect custom maxLength parameter', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [
          {
            _key: '1-1',
            _type: 'span',
            marks: [],
            text: 'Short text that is under 100 chars'
          }
        ],
        markDefs: [],
        style: 'normal'
      }
    ]

    const result = extractFirstParagraph(content, 100)
    expect(result).toBe('Short text that is under 100 chars')
  })

  it('should skip headings and find first normal paragraph', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [
          { _key: '1-1', _type: 'span', marks: [], text: 'Heading Text' }
        ],
        markDefs: [],
        style: 'h2'
      },
      {
        _key: '2',
        _type: 'block',
        children: [
          {
            _key: '2-1',
            _type: 'span',
            marks: [],
            text: 'First paragraph text.'
          }
        ],
        markDefs: [],
        style: 'normal'
      }
    ]

    const result = extractFirstParagraph(content)
    expect(result).toBe('First paragraph text.')
  })

  it('should skip code blocks and other non-block types', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'code',
        code: 'const x = 1;',
        language: 'javascript'
      } as unknown as PortableTextBlock,
      {
        _key: '2',
        _type: 'block',
        children: [
          {
            _key: '2-1',
            _type: 'span',
            marks: [],
            text: 'First paragraph text.'
          }
        ],
        markDefs: [],
        style: 'normal'
      }
    ]

    const result = extractFirstParagraph(content)
    expect(result).toBe('First paragraph text.')
  })

  it('should return empty string when content is null', () => {
    const result = extractFirstParagraph(null)
    expect(result).toBe('')
  })

  it('should return empty string when content is undefined', () => {
    const result = extractFirstParagraph(undefined)
    expect(result).toBe('')
  })

  it('should return empty string when content is empty array', () => {
    const content: PortableTextValue = []
    const result = extractFirstParagraph(content)
    expect(result).toBe('')
  })

  it('should return empty string when no normal paragraphs exist', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [{ _key: '1-1', _type: 'span', marks: [], text: 'Heading' }],
        markDefs: [],
        style: 'h1'
      },
      {
        _key: '2',
        _type: 'code',
        code: 'const x = 1;',
        language: 'javascript'
      } as unknown as PortableTextBlock
    ]

    const result = extractFirstParagraph(content)
    expect(result).toBe('')
  })

  it('should handle paragraphs with only whitespace', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [{ _key: '1-1', _type: 'span', marks: [], text: '   ' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _key: '2',
        _type: 'block',
        children: [
          { _key: '2-1', _type: 'span', marks: [], text: 'Real content here.' }
        ],
        markDefs: [],
        style: 'normal'
      }
    ]

    const result = extractFirstParagraph(content)
    expect(result).toBe('Real content here.')
  })

  it('should handle Japanese text', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [
          {
            _key: '1-1',
            _type: 'span',
            marks: [],
            text: 'これは日本語のテキストです。'
          }
        ],
        markDefs: [],
        style: 'normal'
      }
    ]

    const result = extractFirstParagraph(content)
    expect(result).toBe('これは日本語のテキストです。')
  })

  it('should truncate Japanese text correctly', () => {
    const japaneseText =
      '日本語のテキストがとても長い場合、適切に切り詰められるべきです。これは日本語の文字列処理のテストケースです。さらに多くのテキストを追加して、制限を超えるようにします。'
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [
          { _key: '1-1', _type: 'span', marks: [], text: japaneseText }
        ],
        markDefs: [],
        style: 'normal'
      }
    ]

    const result = extractFirstParagraph(content, 50)
    expect(result).toBe(`${japaneseText.slice(0, 50)}...`)
    expect(result.length).toBe(53) // 50 + 3 for ellipsis
  })
})
