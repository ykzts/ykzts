import type { Json } from '@ykzts/supabase'
import { describe, expect, it } from 'vitest'
import { extractFirstParagraph } from '../portable-text-utils'

describe('extractFirstParagraph', () => {
  describe('Valid Portable Text content', () => {
    it('should extract text from first normal paragraph', () => {
      const content = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'This is the first paragraph.'
            }
          ],
          markDefs: [],
          style: 'normal'
        },
        {
          _key: 'block2',
          _type: 'block',
          children: [
            {
              _key: 'span2',
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

    it('should concatenate multiple text spans in a paragraph', () => {
      const content = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'This is '
            },
            {
              _key: 'span2',
              _type: 'span',
              marks: ['strong'],
              text: 'bold text'
            },
            {
              _key: 'span3',
              _type: 'span',
              marks: [],
              text: ' in a paragraph.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = extractFirstParagraph(content)
      expect(result).toBe('This is bold text in a paragraph.')
    })

    it('should skip non-normal blocks and find first normal paragraph', () => {
      const content = [
        {
          _key: 'heading1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'This is a heading'
            }
          ],
          markDefs: [],
          style: 'h1'
        },
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span2',
              _type: 'span',
              marks: [],
              text: 'This is the first paragraph.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = extractFirstParagraph(content)
      expect(result).toBe('This is the first paragraph.')
    })

    it('should skip image blocks', () => {
      const content = [
        {
          _key: 'image1',
          _type: 'image',
          alt: 'An image',
          asset: {
            _type: 'reference',
            url: 'https://example.com/image.jpg'
          }
        },
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'First paragraph after image.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = extractFirstParagraph(content)
      expect(result).toBe('First paragraph after image.')
    })

    it('should truncate text longer than maxLength', () => {
      const longText = 'A'.repeat(250)
      const content = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: longText
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = extractFirstParagraph(content, 200)
      expect(result).toBe(`${'A'.repeat(200)}...`)
      expect(result.length).toBe(203) // 200 + '...'
    })

    it('should use custom maxLength', () => {
      const content = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'Short text that will be truncated.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = extractFirstParagraph(content, 10)
      expect(result).toBe('Short text...')
      expect(result.length).toBe(13) // 10 characters + '...'
    })

    it('should not add ellipsis if text is exactly maxLength', () => {
      const content = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'Exactly20Characters!'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = extractFirstParagraph(content, 20)
      expect(result).toBe('Exactly20Characters!')
      expect(result.length).toBe(20)
    })

    it('should trim whitespace', () => {
      const content = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: '   Text with spaces   '
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = extractFirstParagraph(content)
      expect(result).toBe('Text with spaces')
    })

    it('should skip empty paragraphs', () => {
      const content = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: '   '
            }
          ],
          markDefs: [],
          style: 'normal'
        },
        {
          _key: 'block2',
          _type: 'block',
          children: [
            {
              _key: 'span2',
              _type: 'span',
              marks: [],
              text: 'First non-empty paragraph.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = extractFirstParagraph(content)
      expect(result).toBe('First non-empty paragraph.')
    })
  })

  describe('Edge cases', () => {
    it('should return empty string for empty array', () => {
      const result = extractFirstParagraph([])
      expect(result).toBe('')
    })

    it('should return empty string for non-array input', () => {
      expect(extractFirstParagraph(null as unknown as Json)).toBe('')
      expect(extractFirstParagraph(undefined as unknown as Json)).toBe('')
      expect(extractFirstParagraph('string' as unknown as Json)).toBe('')
      expect(extractFirstParagraph(123 as unknown as Json)).toBe('')
      expect(extractFirstParagraph({} as unknown as Json)).toBe('')
    })

    it('should return empty string when no normal paragraphs exist', () => {
      const content = [
        {
          _key: 'heading1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'Only a heading'
            }
          ],
          markDefs: [],
          style: 'h1'
        },
        {
          _key: 'code1',
          _type: 'code',
          code: 'console.log("code")',
          language: 'javascript'
        }
      ]

      const result = extractFirstParagraph(content)
      expect(result).toBe('')
    })

    it('should handle blocks without children array', () => {
      const content = [
        {
          _key: 'block1',
          _type: 'block',
          style: 'normal'
          // children is missing
        },
        {
          _key: 'block2',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'Valid paragraph.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = extractFirstParagraph(content)
      expect(result).toBe('Valid paragraph.')
    })

    it('should handle children without text property', () => {
      const content = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: []
              // text is missing
            },
            {
              _key: 'span2',
              _type: 'span',
              marks: [],
              text: 'Valid text.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = extractFirstParagraph(content)
      expect(result).toBe('Valid text.')
    })

    it('should handle malformed blocks', () => {
      const content = [
        null,
        undefined,
        'string',
        123,
        [],
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'Valid paragraph.'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = extractFirstParagraph(content)
      expect(result).toBe('Valid paragraph.')
    })
  })

  describe('Japanese text', () => {
    it('should handle Japanese text correctly', () => {
      const content = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'これは日本語のテキストです。これはブログ記事の概要として使用されます。'
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = extractFirstParagraph(content)
      expect(result).toBe(
        'これは日本語のテキストです。これはブログ記事の概要として使用されます。'
      )
    })

    it('should truncate Japanese text correctly', () => {
      const content = [
        {
          _key: 'block1',
          _type: 'block',
          children: [
            {
              _key: 'span1',
              _type: 'span',
              marks: [],
              text: 'あ'.repeat(250)
            }
          ],
          markDefs: [],
          style: 'normal'
        }
      ]

      const result = extractFirstParagraph(content, 200)
      expect(result).toBe(`${'あ'.repeat(200)}...`)
      expect(result.length).toBe(203)
    })
  })
})
