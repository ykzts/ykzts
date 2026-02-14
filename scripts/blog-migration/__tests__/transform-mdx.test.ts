import { describe, expect, it } from 'vitest'
import {
  createImageMappings,
  type ImageUrlMapping,
  transformMDXContent
} from '../lib/transform-mdx.ts'

describe('transformMDXContent', () => {
  it('should transform markdown image syntax', () => {
    const content = `---
title: Test
---

![Alt text](./img/photo.jpg)

Some content.`

    const mappings: ImageUrlMapping[] = [
      {
        altText: 'Alt text',
        newUrl: 'https://storage.example.com/images/photo.jpg',
        originalPath: './img/photo.jpg'
      }
    ]

    const result = transformMDXContent(content, mappings)

    expect(result).toContain(
      '![Alt text](https://storage.example.com/images/photo.jpg)'
    )
    expect(result).not.toContain('./img/photo.jpg')
  })

  it('should transform JSX img tags', () => {
    const content = `---
title: Test
---

<img src="./img/photo.jpg" alt="Photo" />`

    const mappings: ImageUrlMapping[] = [
      {
        altText: 'Photo',
        newUrl: 'https://storage.example.com/images/photo.jpg',
        originalPath: './img/photo.jpg'
      }
    ]

    const result = transformMDXContent(content, mappings)

    expect(result).toContain(
      '<img src="https://storage.example.com/images/photo.jpg" alt="Photo" />'
    )
    expect(result).not.toContain('src="./img/photo.jpg"')
  })

  it('should handle multiple images', () => {
    const content = `
![First](./img1.png)
![Second](./img2.jpg)
`

    const mappings: ImageUrlMapping[] = [
      {
        altText: 'First',
        newUrl: 'https://storage.example.com/img1.png',
        originalPath: './img1.png'
      },
      {
        altText: 'Second',
        newUrl: 'https://storage.example.com/img2.jpg',
        originalPath: './img2.jpg'
      }
    ]

    const result = transformMDXContent(content, mappings)

    expect(result).toContain('![First](https://storage.example.com/img1.png)')
    expect(result).toContain('![Second](https://storage.example.com/img2.jpg)')
  })

  it('should preserve content that is not images', () => {
    const content = `---
title: Test
---

Some text before.

![Photo](./img.jpg)

Some text after.

## Heading

More content.`

    const mappings: ImageUrlMapping[] = [
      {
        altText: 'Photo',
        newUrl: 'https://storage.example.com/img.jpg',
        originalPath: './img.jpg'
      }
    ]

    const result = transformMDXContent(content, mappings)

    expect(result).toContain('Some text before.')
    expect(result).toContain('Some text after.')
    expect(result).toContain('## Heading')
    expect(result).toContain('More content.')
  })

  it('should handle JSX img tags with multiple attributes', () => {
    const content =
      '<img className="photo" src="./img.png" alt="Description" width="800" />'

    const mappings: ImageUrlMapping[] = [
      {
        altText: 'Description',
        newUrl: 'https://storage.example.com/img.png',
        originalPath: './img.png'
      }
    ]

    const result = transformMDXContent(content, mappings)

    expect(result).toContain('src="https://storage.example.com/img.png"')
    expect(result).toContain('alt="Description"')
    expect(result).toContain('className="photo"')
    expect(result).toContain('width="800"')
  })

  it('should handle images without alt text', () => {
    const content = '![](./img.png)'

    const mappings: ImageUrlMapping[] = [
      {
        altText: '',
        newUrl: 'https://storage.example.com/img.png',
        originalPath: './img.png'
      }
    ]

    const result = transformMDXContent(content, mappings)

    expect(result).toBe('![](https://storage.example.com/img.png)')
  })

  it('should handle paths with special regex characters', () => {
    const content = '![Photo](./img/photo(1).jpg)'

    const mappings: ImageUrlMapping[] = [
      {
        altText: 'Photo',
        newUrl: 'https://storage.example.com/photo.jpg',
        originalPath: './img/photo(1).jpg'
      }
    ]

    const result = transformMDXContent(content, mappings)

    expect(result).toContain('![Photo](https://storage.example.com/photo.jpg)')
  })

  it('should not transform images that are not in mappings', () => {
    const content = `
![Photo1](./img1.png)
![Photo2](./img2.png)
`

    const mappings: ImageUrlMapping[] = [
      {
        altText: 'Photo1',
        newUrl: 'https://storage.example.com/img1.png',
        originalPath: './img1.png'
      }
    ]

    const result = transformMDXContent(content, mappings)

    expect(result).toContain('![Photo1](https://storage.example.com/img1.png)')
    expect(result).toContain('![Photo2](./img2.png)') // Not transformed
  })

  it('should handle complex Docusaurus-style markdown', () => {
    const content = `<div className="row">
  <div className="col col--6">

[![Alt1](./img/img1.jpg)](./img/img1.jpg)

  </div>
  <div className="col col--6">

[![Alt2](./img/img2.jpg)](./img/img2.jpg)

  </div>
</div>`

    const mappings: ImageUrlMapping[] = [
      {
        altText: 'Alt1',
        newUrl: 'https://storage.example.com/img1.jpg',
        originalPath: './img/img1.jpg'
      },
      {
        altText: 'Alt2',
        newUrl: 'https://storage.example.com/img2.jpg',
        originalPath: './img/img2.jpg'
      }
    ]

    const result = transformMDXContent(content, mappings)

    // The images inside the link syntax should be transformed
    expect(result).toContain('[![Alt1](https://storage.example.com/img1.jpg)]')
    expect(result).toContain('[![Alt2](https://storage.example.com/img2.jpg)]')
  })
})

describe('createImageMappings', () => {
  it('should create mappings from image references and uploaded URLs', () => {
    const images = [
      {
        absolutePath: '/path/to/img1.png',
        altText: 'Image 1',
        exists: true,
        path: './img1.png'
      },
      {
        absolutePath: '/path/to/img2.jpg',
        altText: 'Image 2',
        exists: true,
        path: './img2.jpg'
      }
    ]

    const uploadedUrls = new Map([
      ['/path/to/img1.png', 'https://storage.example.com/img1.png'],
      ['/path/to/img2.jpg', 'https://storage.example.com/img2.jpg']
    ])

    const mappings = createImageMappings(images, uploadedUrls)

    expect(mappings).toHaveLength(2)
    expect(mappings[0]).toEqual({
      altText: 'Image 1',
      newUrl: 'https://storage.example.com/img1.png',
      originalPath: './img1.png'
    })
    expect(mappings[1]).toEqual({
      altText: 'Image 2',
      newUrl: 'https://storage.example.com/img2.jpg',
      originalPath: './img2.jpg'
    })
  })

  it('should skip images without uploaded URLs', () => {
    const images = [
      {
        absolutePath: '/path/to/img1.png',
        altText: 'Image 1',
        exists: true,
        path: './img1.png'
      },
      {
        absolutePath: '/path/to/img2.jpg',
        altText: 'Image 2',
        exists: true,
        path: './img2.jpg'
      }
    ]

    const uploadedUrls = new Map([
      ['/path/to/img1.png', 'https://storage.example.com/img1.png']
      // img2.jpg is missing
    ])

    const mappings = createImageMappings(images, uploadedUrls)

    expect(mappings).toHaveLength(1)
    expect(mappings[0].originalPath).toBe('./img1.png')
  })

  it('should return empty array when no images match', () => {
    const images = [
      {
        absolutePath: '/path/to/img1.png',
        altText: 'Image 1',
        exists: true,
        path: './img1.png'
      }
    ]

    const uploadedUrls = new Map([
      ['/path/to/different.png', 'https://storage.example.com/different.png']
    ])

    const mappings = createImageMappings(images, uploadedUrls)

    expect(mappings).toHaveLength(0)
  })
})
