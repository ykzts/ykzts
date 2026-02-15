import { describe, expect, it } from 'vitest'
import { convertMDXToPortableText } from '../lib/mdx-to-portable-text'

describe('Footnote conversion', () => {
  it('should convert GFM footnote references to marks', () => {
    const mdx = 'Here is some text with a footnote[^1].\n\n[^1]: This is the footnote.'
    const result = convertMDXToPortableText(mdx)

    // Find the paragraph block
    const paragraph = result.find((block) => block._type === 'block')
    expect(paragraph).toBeDefined()
    
    if (paragraph && paragraph._type === 'block') {
      // Check if markDefs includes a footnoteReference
      const footnoteRef = paragraph.markDefs?.find(
        (mark) => mark._type === 'footnoteReference'
      )
      expect(footnoteRef).toBeDefined()
      expect(footnoteRef?.identifier).toBe('1')
    }
  })

  it('should convert GFM footnote definitions to blocks', () => {
    const mdx = 'Text[^1].\n\n[^1]: This is the footnote.'
    const result = convertMDXToPortableText(mdx)

    // Find the footnote block
    const footnote = result.find((block) => block._type === 'footnote')
    expect(footnote).toBeDefined()
    
    if (footnote && footnote._type === 'footnote') {
      expect(footnote.identifier).toBe('1')
      expect(footnote.children).toBeDefined()
      expect(Array.isArray(footnote.children)).toBe(true)
    }
  })

  it('should handle multiple footnotes', () => {
    const mdx = `Text with first[^1] and second[^2] footnote.

[^1]: First footnote.
[^2]: Second footnote.`
    
    const result = convertMDXToPortableText(mdx)

    // Check for footnote blocks
    const footnotes = result.filter((block) => block._type === 'footnote')
    expect(footnotes).toHaveLength(2)
    
    const footnote1 = footnotes.find((fn) => fn._type === 'footnote' && fn.identifier === '1')
    const footnote2 = footnotes.find((fn) => fn._type === 'footnote' && fn.identifier === '2')
    
    expect(footnote1).toBeDefined()
    expect(footnote2).toBeDefined()
  })

  it('should handle footnote definition with formatting', () => {
    const mdx = 'Text[^1].\n\n[^1]: Footnote with **bold** and *italic*.'
    const result = convertMDXToPortableText(mdx)

    const footnote = result.find((block) => block._type === 'footnote')
    expect(footnote).toBeDefined()
    
    if (footnote && footnote._type === 'footnote') {
      expect(footnote.children.length).toBeGreaterThan(0)
      
      // Check if the footnote content has the expected formatting
      const firstChild = footnote.children[0]
      if (firstChild._type === 'block') {
        const hasMarks = firstChild.children.some(
          (child) => child.marks && child.marks.length > 0
        )
        expect(hasMarks).toBe(true)
      }
    }
  })
})
