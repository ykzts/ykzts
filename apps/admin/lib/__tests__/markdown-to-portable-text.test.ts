import { describe, expect, it } from 'vitest'
import { parseMarkdownForPost } from '../markdown-to-portable-text'

describe('parseMarkdownForPost', () => {
  it('should extract title from first h1 heading', () => {
    const markdown = '# My Post Title\n\nBody content here.'
    const { title } = parseMarkdownForPost(markdown)
    expect(title).toBe('My Post Title')
  })

  it('should return empty title when no h1 heading exists', () => {
    const markdown = '## Section\n\nBody content here.'
    const { title } = parseMarkdownForPost(markdown)
    expect(title).toBe('')
  })

  it('should convert body content to Portable Text JSON string', () => {
    const markdown = '# Title\n\nThis is a paragraph.'
    const { contentJson } = parseMarkdownForPost(markdown)
    const blocks = JSON.parse(contentJson)
    expect(Array.isArray(blocks)).toBe(true)
    expect(blocks.length).toBeGreaterThan(0)
    expect(blocks[0]._type).toBe('block')
    expect(blocks[0].style).toBe('normal')
  })

  it('should exclude the h1 title from body content', () => {
    const markdown = '# Title\n\nBody paragraph.'
    const { contentJson } = parseMarkdownForPost(markdown)
    const blocks = JSON.parse(contentJson)
    const h1Blocks = blocks.filter((b: { style?: string }) => b.style === 'h1')
    expect(h1Blocks.length).toBe(0)
  })

  it('should convert code blocks to internal block format', () => {
    const markdown = '# Title\n\n```javascript\nconsole.log("hello")\n```'
    const { contentJson } = parseMarkdownForPost(markdown)
    const blocks = JSON.parse(contentJson)
    const codeBlock = blocks.find((b: { style?: string }) => b.style === 'code')
    expect(codeBlock).toBeDefined()
    expect(codeBlock._type).toBe('block')
    expect(codeBlock.language).toBe('javascript')
    expect(codeBlock.children[0].text).toContain('console.log')
  })

  it('should handle markdown with no content after title', () => {
    const markdown = '# Title Only'
    const { title, contentJson } = parseMarkdownForPost(markdown)
    expect(title).toBe('Title Only')
    const blocks = JSON.parse(contentJson)
    expect(Array.isArray(blocks)).toBe(true)
  })

  it('should handle empty markdown', () => {
    const markdown = ''
    const { title, contentJson } = parseMarkdownForPost(markdown)
    expect(title).toBe('')
    const blocks = JSON.parse(contentJson)
    expect(Array.isArray(blocks)).toBe(true)
  })

  it('should preserve bold text in body content', () => {
    const markdown = '# Title\n\nThis has **bold** text.'
    const { contentJson } = parseMarkdownForPost(markdown)
    const blocks = JSON.parse(contentJson)
    const paragraph = blocks.find(
      (b: { style?: string }) => b.style === 'normal'
    )
    const boldSpan = paragraph?.children?.find((s: { marks?: string[] }) =>
      s.marks?.includes('strong')
    )
    expect(boldSpan).toBeDefined()
    expect(boldSpan.text).toBe('bold')
  })

  it('should preserve h2-h6 headings in body content', () => {
    const markdown = '# Title\n\n## Section\n\nParagraph.'
    const { contentJson } = parseMarkdownForPost(markdown)
    const blocks = JSON.parse(contentJson)
    const h2Block = blocks.find((b: { style?: string }) => b.style === 'h2')
    expect(h2Block).toBeDefined()
    expect(h2Block.children[0].text).toBe('Section')
  })

  it('should only extract the first h1 heading as title', () => {
    const markdown = '# First Title\n\n# Second Title\n\nContent.'
    const { title, contentJson } = parseMarkdownForPost(markdown)
    expect(title).toBe('First Title')
    const blocks = JSON.parse(contentJson)
    // The second h1 should be included in body (as a paragraph or h1 depending on serializer)
    const textContent = JSON.stringify(blocks)
    expect(textContent).toContain('Second Title')
  })
})
