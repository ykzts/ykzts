import { portableTextToHTML } from '@ykzts/portable-text-utils'
import { describe, expect, test } from 'vitest'

describe('portableTextToHTML', () => {
  test('should convert simple PortableText to HTML', () => {
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

  test('should return empty string for null content', () => {
    const result = portableTextToHTML(null)
    expect(result).toBe('')
  })

  test('should return empty string for undefined content', () => {
    const result = portableTextToHTML(undefined)
    expect(result).toBe('')
  })

  test('should handle heading blocks', () => {
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

  test('should handle multiple paragraphs', () => {
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

    const result = portableTextToHTML(content)
    expect(result).toContain('First paragraph')
    expect(result).toContain('Second paragraph')
  })

  test('should handle code block style', () => {
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

  test('should handle image type blocks', () => {
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

  test('should handle image type blocks without alt text', () => {
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

  test('should handle code type blocks (object form)', () => {
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
    expect(result).toContain('<code')
    expect(result).toContain('language-javascript')
  })

  test('should handle code type blocks without language', () => {
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
