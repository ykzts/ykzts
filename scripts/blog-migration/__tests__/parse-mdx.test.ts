import { describe, expect, it } from 'vitest'
import { parseMDXContent } from '../lib/parse-mdx'

describe('parseMDXContent', () => {
  it('should parse basic frontmatter and content', () => {
    const mdx = `---
authors: [ykzts]
date: 2022-11-03T21:45:00+09:00
tags: [game]
title: Test Post
---

This is the content of the post.`

    const result = parseMDXContent(mdx)

    expect(result.frontmatter).toEqual({
      authors: ['ykzts'],
      date: '2022-11-03T21:45:00+09:00',
      tags: ['game'],
      title: 'Test Post'
    })
    expect(result.content).toBe('This is the content of the post.')
  })

  it('should parse frontmatter with last_update', () => {
    const mdx = `---
authors: [ykzts]
date: 2022-11-03T21:45:00+09:00
last_update:
  author: ykzts
  date: 2024-12-07T12:00:00+09:00
tags: [game]
title: Test Post with Update
---

Content here.`

    const result = parseMDXContent(mdx)

    expect(result.frontmatter.date).toBe('2022-11-03T21:45:00+09:00')
    expect(result.frontmatter.last_update).toEqual({
      author: 'ykzts',
      date: '2024-12-07T12:00:00+09:00'
    })
    expect(result.frontmatter.title).toBe('Test Post with Update')
  })

  it('should handle multiple tags', () => {
    const mdx = `---
authors: [ykzts]
date: 2018-04-24T23:30:00+09:00
tags: [tech, web, javascript]
title: Multi Tag Post
---

Content.`

    const result = parseMDXContent(mdx)

    expect(result.frontmatter.tags).toEqual(['tech', 'web', 'javascript'])
  })

  it('should handle empty tags', () => {
    const mdx = `---
authors: [ykzts]
date: 2018-04-24T23:30:00+09:00
tags: []
title: No Tags Post
---

Content.`

    const result = parseMDXContent(mdx)

    expect(result.frontmatter.tags).toEqual([])
  })

  it('should throw error when frontmatter is missing', () => {
    const mdx = 'Just content without frontmatter'

    expect(() => parseMDXContent(mdx)).toThrow('No frontmatter found')
  })

  it('should handle multiline content', () => {
    const mdx = `---
authors: [ykzts]
date: 2022-11-03T21:45:00+09:00
title: Multiline Post
---

Line 1

Line 2

Line 3`

    const result = parseMDXContent(mdx)

    expect(result.content).toBe('Line 1\n\nLine 2\n\nLine 3')
  })

  it('should parse frontmatter without last_update correctly', () => {
    const mdx = `---
authors: [ykzts]
date: 2016-09-25T00:00:00+09:00
tags: [misc]
title: First Post
---

This is my first post.`

    const result = parseMDXContent(mdx)

    expect(result.frontmatter.last_update).toBeUndefined()
    expect(result.frontmatter.date).toBe('2016-09-25T00:00:00+09:00')
  })
})
