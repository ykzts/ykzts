import { describe, expect, it } from 'vitest'
import { extractHeadings } from '../extract-headings'
import type { PortableTextValue } from '../portable-text'

describe('extractHeadings', () => {
  it('should extract h2 and h3 headings', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [
          { _key: '1-1', _type: 'span', marks: [], text: 'Introduction' }
        ],
        markDefs: [],
        style: 'h2'
      },
      {
        _key: '2',
        _type: 'block',
        children: [
          { _key: '2-1', _type: 'span', marks: [], text: 'Normal paragraph' }
        ],
        markDefs: [],
        style: 'normal'
      },
      {
        _key: '3',
        _type: 'block',
        children: [
          { _key: '3-1', _type: 'span', marks: [], text: 'Getting Started' }
        ],
        markDefs: [],
        style: 'h3'
      }
    ]

    const headings = extractHeadings(content)

    expect(headings).toHaveLength(2)
    expect(headings[0]).toEqual({
      id: 'introduction',
      level: 2,
      text: 'Introduction'
    })
    expect(headings[1]).toEqual({
      id: 'getting-started',
      level: 3,
      text: 'Getting Started'
    })
  })

  it('should ignore h1 and other heading levels', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [{ _key: '1-1', _type: 'span', marks: [], text: 'Title' }],
        markDefs: [],
        style: 'h1'
      },
      {
        _key: '2',
        _type: 'block',
        children: [{ _key: '2-1', _type: 'span', marks: [], text: 'Section' }],
        markDefs: [],
        style: 'h2'
      },
      {
        _key: '3',
        _type: 'block',
        children: [
          { _key: '3-1', _type: 'span', marks: [], text: 'Small heading' }
        ],
        markDefs: [],
        style: 'h4'
      }
    ]

    const headings = extractHeadings(content)

    expect(headings).toHaveLength(1)
    expect(headings[0].text).toBe('Section')
    expect(headings[0].level).toBe(2)
  })

  it('should handle empty content', () => {
    const content: PortableTextValue = []
    const headings = extractHeadings(content)

    expect(headings).toHaveLength(0)
  })

  it('should handle content without headings', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [
          { _key: '1-1', _type: 'span', marks: [], text: 'Just a paragraph' }
        ],
        markDefs: [],
        style: 'normal'
      }
    ]

    const headings = extractHeadings(content)

    expect(headings).toHaveLength(0)
  })

  it('should generate valid IDs from heading text', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [
          { _key: '1-1', _type: 'span', marks: [], text: 'Hello World!' }
        ],
        markDefs: [],
        style: 'h2'
      },
      {
        _key: '2',
        _type: 'block',
        children: [
          { _key: '2-1', _type: 'span', marks: [], text: 'React & TypeScript' }
        ],
        markDefs: [],
        style: 'h2'
      },
      {
        _key: '3',
        _type: 'block',
        children: [
          { _key: '3-1', _type: 'span', marks: [], text: '日本語のタイトル' }
        ],
        markDefs: [],
        style: 'h2'
      }
    ]

    const headings = extractHeadings(content)

    expect(headings[0].id).toBe('hello-world')
    expect(headings[1].id).toBe('react-typescript')
    expect(headings[2].id).toBe('日本語のタイトル')
  })

  it('should handle headings with multiple text spans', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [
          { _key: '1-1', _type: 'span', marks: [], text: 'Using ' },
          { _key: '1-2', _type: 'span', marks: ['strong'], text: 'React' },
          { _key: '1-3', _type: 'span', marks: [], text: ' Hooks' }
        ],
        markDefs: [],
        style: 'h2'
      }
    ]

    const headings = extractHeadings(content)

    expect(headings).toHaveLength(1)
    expect(headings[0].text).toBe('Using React Hooks')
    expect(headings[0].id).toBe('using-react-hooks')
  })

  it('should handle special characters in heading text', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [
          { _key: '1-1', _type: 'span', marks: [], text: 'What is "React"?' }
        ],
        markDefs: [],
        style: 'h2'
      },
      {
        _key: '2',
        _type: 'block',
        children: [
          { _key: '2-1', _type: 'span', marks: [], text: 'C++ vs C#' }
        ],
        markDefs: [],
        style: 'h3'
      }
    ]

    const headings = extractHeadings(content)

    expect(headings[0].id).toBe('what-is-react')
    expect(headings[1].id).toBe('c-vs-c')
  })

  it('should handle duplicate heading text by appending counter', () => {
    const content: PortableTextValue = [
      {
        _key: '1',
        _type: 'block',
        children: [{ _key: '1-1', _type: 'span', marks: [], text: 'Example' }],
        markDefs: [],
        style: 'h2'
      },
      {
        _key: '2',
        _type: 'block',
        children: [{ _key: '2-1', _type: 'span', marks: [], text: 'Example' }],
        markDefs: [],
        style: 'h2'
      },
      {
        _key: '3',
        _type: 'block',
        children: [{ _key: '3-1', _type: 'span', marks: [], text: 'Example' }],
        markDefs: [],
        style: 'h3'
      }
    ]

    const headings = extractHeadings(content)

    expect(headings).toHaveLength(3)
    expect(headings[0].id).toBe('example')
    expect(headings[1].id).toBe('example-1')
    expect(headings[2].id).toBe('example-2')
  })
})
