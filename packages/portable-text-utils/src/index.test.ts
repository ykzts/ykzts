import { describe, expect, it } from 'vitest'
import {
  parseMarkdownForPost,
  portableTextToHTML,
  portableTextToMarkdown
} from './index'

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

  it('clamps headings at h1 when headingOffset is negative', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Lower bound heading' }],
        style: 'h2'
      }
    ]
    const result = portableTextToMarkdown(content, { headingOffset: -5 })
    expect(result).toContain('# Lower bound heading')
    expect(result).not.toMatch(/^## Lower bound heading/m)
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

describe('portableTextToHTML', () => {
  it('converts a paragraph block to HTML', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Hello, world!' }],
        style: 'normal'
      }
    ]
    const result = portableTextToHTML(content)
    expect(result).toContain('Hello, world!')
    expect(result).toContain('<p>')
  })

  it('returns empty string for null input', () => {
    expect(portableTextToHTML(null)).toBe('')
  })

  it('returns empty string for undefined input', () => {
    expect(portableTextToHTML(undefined)).toBe('')
  })

  it('converts a heading block to HTML', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'A Heading' }],
        style: 'h2'
      }
    ]
    const result = portableTextToHTML(content)
    expect(result).toContain('A Heading')
    expect(result).toContain('<h2>')
  })

  it('converts code block style to pre/code', () => {
    const content = [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'const x = 1' }],
        style: 'code'
      }
    ]
    const result = portableTextToHTML(content)
    expect(result).toContain('const x = 1')
    expect(result).toContain('<pre>')
    expect(result).toContain('<code>')
  })

  it('converts image type block to figure/img', () => {
    const content = [
      {
        _type: 'image',
        alt: 'A test image',
        asset: { url: 'https://example.com/image.png' }
      }
    ]
    const result = portableTextToHTML(
      content as Parameters<typeof portableTextToHTML>[0]
    )
    expect(result).toContain('<figure>')
    expect(result).toContain('<img')
    expect(result).toContain('alt="A test image"')
    expect(result).toContain('src="https://example.com/image.png"')
    expect(result).toContain('<figcaption>A test image</figcaption>')
  })

  it('converts image type block without alt text to figure/img without figcaption', () => {
    const content = [
      {
        _type: 'image',
        asset: { url: 'https://example.com/image.png' }
      }
    ]
    const result = portableTextToHTML(
      content as Parameters<typeof portableTextToHTML>[0]
    )
    expect(result).toContain('<figure>')
    expect(result).toContain('<img')
    expect(result).not.toContain('<figcaption>')
  })

  it('converts _type code block (object form) with language to pre/code', () => {
    const content = [
      {
        _type: 'code',
        code: 'const x = 1',
        language: 'javascript'
      }
    ]
    const result = portableTextToHTML(
      content as Parameters<typeof portableTextToHTML>[0]
    )
    expect(result).toContain('const x = 1')
    expect(result).toContain('<pre>')
    expect(result).toContain('language-javascript')
  })

  it('converts _type code block (object form) without language to pre/code', () => {
    const content = [
      {
        _type: 'code',
        code: 'hello world'
      }
    ]
    const result = portableTextToHTML(
      content as Parameters<typeof portableTextToHTML>[0]
    )
    expect(result).toContain('hello world')
    expect(result).toContain('<pre>')
    expect(result).toContain('<code>')
  })
})

describe('parseMarkdownForPost', () => {
  it('parses markdown without frontmatter using h1 as title', () => {
    const md = '# My Title\n\nSome content.'
    const result = parseMarkdownForPost(md)
    expect(result.title).toBe('My Title')
    expect(result.tags).toEqual([])
    expect(result.excerpt).toBe('')
    expect(result.publishedAt).toBeNull()
    const blocks = JSON.parse(result.contentJson)
    expect(blocks.some((b: { style?: string }) => b.style === 'h1')).toBe(false)
  })

  it('extracts title from frontmatter', () => {
    const md = '---\ntitle: Frontmatter Title\n---\n\nContent here.'
    const result = parseMarkdownForPost(md)
    expect(result.title).toBe('Frontmatter Title')
  })

  it('frontmatter title takes precedence over h1', () => {
    const md = '---\ntitle: FM Title\n---\n\n# H1 Title\n\nContent.'
    const result = parseMarkdownForPost(md)
    expect(result.title).toBe('FM Title')
    const blocks = JSON.parse(result.contentJson)
    expect(blocks.some((b: { style?: string }) => b.style === 'h1')).toBe(true)
  })

  it('extracts tags from frontmatter YAML sequence', () => {
    const md = '---\ntags:\n  - TypeScript\n  - React\n---\n\nContent.'
    const result = parseMarkdownForPost(md)
    expect(result.tags).toEqual(['TypeScript', 'React'])
  })

  it('extracts tags from frontmatter comma-separated string', () => {
    const md = '---\ntags: TypeScript, React\n---\n\nContent.'
    const result = parseMarkdownForPost(md)
    expect(result.tags).toEqual(['TypeScript', 'React'])
  })

  it('extracts excerpt from frontmatter', () => {
    const md = '---\nexcerpt: This is a summary.\n---\n\nContent.'
    const result = parseMarkdownForPost(md)
    expect(result.excerpt).toBe('This is a summary.')
  })

  it('extracts publishedAt from frontmatter date field', () => {
    const md = '---\ndate: 2026-03-03\n---\n\nContent.'
    const result = parseMarkdownForPost(md)
    expect(result.publishedAt).not.toBeNull()
    expect(result.publishedAt).toMatch(/^2026-03-03/)
  })

  it('extracts publishedAt from frontmatter published_at field', () => {
    const md = '---\npublished_at: 2026-03-03T12:00:00Z\n---\n\nContent.'
    const result = parseMarkdownForPost(md)
    expect(result.publishedAt).toBe('2026-03-03T12:00:00.000Z')
  })

  it('published_at takes precedence over date', () => {
    const md =
      '---\npublished_at: 2026-06-01T00:00:00Z\ndate: 2026-01-01\n---\n\nContent.'
    const result = parseMarkdownForPost(md)
    expect(result.publishedAt).toBe('2026-06-01T00:00:00.000Z')
  })

  it('returns null publishedAt when no date fields are present', () => {
    const md = '---\ntitle: No Date\n---\n\nContent.'
    const result = parseMarkdownForPost(md)
    expect(result.publishedAt).toBeNull()
  })

  it('strips frontmatter from body content', () => {
    const md =
      '---\ntitle: Test\ntags: [a, b]\n---\n\nParagraph after frontmatter.'
    const result = parseMarkdownForPost(md)
    const blocks = JSON.parse(result.contentJson)
    const texts = blocks
      .flatMap((b: { children?: Array<{ text?: string }> }) => b.children ?? [])
      .map((c: { text?: string }) => c.text ?? '')
      .join(' ')
    expect(texts).toContain('Paragraph after frontmatter')
    expect(texts).not.toContain('---')
  })
})
