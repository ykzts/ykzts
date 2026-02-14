import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  detectImages,
  getExtensionFromMimeType,
  getMimeType
} from '../lib/detect-images.ts'

describe('detectImages', () => {
  let testDir: string

  beforeEach(async () => {
    // Create temporary test directory
    testDir = join('/tmp', `test-detect-images-${Date.now()}`)
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    // Clean up test directory
    await rm(testDir, { force: true, recursive: true })
  })

  it('should detect markdown image syntax', async () => {
    const mdxPath = join(testDir, 'test.mdx')
    const imagePath = join(testDir, 'image.png')

    // Create a real image file
    await writeFile(imagePath, Buffer.from([]))

    const content = `---
title: Test
---

Some text with an image:

![Alt text](./image.png)

More text.`

    await writeFile(mdxPath, content)

    const images = await detectImages(content, mdxPath)

    expect(images).toHaveLength(1)
    expect(images[0].altText).toBe('Alt text')
    expect(images[0].path).toBe('./image.png')
    expect(images[0].absolutePath).toBe(imagePath)
    expect(images[0].exists).toBe(true)
  })

  it('should detect JSX img tags', async () => {
    const mdxPath = join(testDir, 'test.mdx')
    const imagePath = join(testDir, 'photo.jpg')

    await writeFile(imagePath, Buffer.from([]))

    const content = `---
title: Test
---

<img src="./photo.jpg" alt="Photo description" />`

    await writeFile(mdxPath, content)

    const images = await detectImages(content, mdxPath)

    expect(images).toHaveLength(1)
    expect(images[0].altText).toBe('Photo description')
    expect(images[0].path).toBe('./photo.jpg')
    expect(images[0].exists).toBe(true)
  })

  it('should handle images without alt text', async () => {
    const mdxPath = join(testDir, 'test.mdx')
    const imagePath = join(testDir, 'image.png')

    await writeFile(imagePath, Buffer.from([]))

    const content = '![](./image.png)'

    const images = await detectImages(content, mdxPath)

    expect(images).toHaveLength(1)
    expect(images[0].altText).toBe('')
  })

  it('should skip external URLs', async () => {
    const mdxPath = join(testDir, 'test.mdx')

    const content = `
![External](https://example.com/image.png)
![Another external](http://example.com/photo.jpg)
<img src="//cdn.example.com/img.png" alt="CDN" />
`

    const images = await detectImages(content, mdxPath)

    expect(images).toHaveLength(0)
  })

  it('should mark missing images as not exists', async () => {
    const mdxPath = join(testDir, 'test.mdx')

    const content = '![Missing](./missing.png)'

    const images = await detectImages(content, mdxPath)

    expect(images).toHaveLength(1)
    expect(images[0].exists).toBe(false)
  })

  it('should detect multiple images', async () => {
    const mdxPath = join(testDir, 'test.mdx')
    const image1 = join(testDir, 'img1.png')
    const image2 = join(testDir, 'img2.jpg')

    await writeFile(image1, Buffer.from([]))
    await writeFile(image2, Buffer.from([]))

    const content = `
![First](./img1.png)

Some text

![Second](./img2.jpg)
`

    const images = await detectImages(content, mdxPath)

    expect(images).toHaveLength(2)
    expect(images[0].path).toBe('./img1.png')
    expect(images[1].path).toBe('./img2.jpg')
  })

  it('should handle images in subdirectories', async () => {
    const mdxPath = join(testDir, 'test.mdx')
    const imgDir = join(testDir, 'img')
    const imagePath = join(imgDir, 'photo.png')

    await mkdir(imgDir)
    await writeFile(imagePath, Buffer.from([]))

    const content = '![Photo](./img/photo.png)'

    const images = await detectImages(content, mdxPath)

    expect(images).toHaveLength(1)
    expect(images[0].path).toBe('./img/photo.png')
    expect(images[0].absolutePath).toBe(imagePath)
    expect(images[0].exists).toBe(true)
  })

  it('should not duplicate images found in both markdown and JSX', async () => {
    const mdxPath = join(testDir, 'test.mdx')
    const imagePath = join(testDir, 'image.png')

    await writeFile(imagePath, Buffer.from([]))

    const content = `
![Alt](./image.png)
<img src="./image.png" alt="Alt" />
`

    const images = await detectImages(content, mdxPath)

    expect(images).toHaveLength(1)
  })

  it('should handle various image formats', async () => {
    const mdxPath = join(testDir, 'test.mdx')

    // Create files with different extensions
    const formats = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp']
    for (const format of formats) {
      await writeFile(join(testDir, `image.${format}`), Buffer.from([]))
    }

    const content = formats.map((fmt) => `![Image](./image.${fmt})`).join('\n')

    const images = await detectImages(content, mdxPath)

    expect(images).toHaveLength(formats.length)
    for (const image of images) {
      expect(image.exists).toBe(true)
    }
  })

  it('should handle JSX img without alt attribute', async () => {
    const mdxPath = join(testDir, 'test.mdx')
    const imagePath = join(testDir, 'image.png')

    await writeFile(imagePath, Buffer.from([]))

    const content = '<img src="./image.png" />'

    const images = await detectImages(content, mdxPath)

    expect(images).toHaveLength(1)
    expect(images[0].altText).toBe('')
  })

  it('should handle complex JSX img tags with multiple attributes', async () => {
    const mdxPath = join(testDir, 'test.mdx')
    const imagePath = join(testDir, 'image.png')

    await writeFile(imagePath, Buffer.from([]))

    const content =
      '<img className="my-class" src="./image.png" alt="Description" width="800" height="600" />'

    const images = await detectImages(content, mdxPath)

    expect(images).toHaveLength(1)
    expect(images[0].altText).toBe('Description')
    expect(images[0].exists).toBe(true)
  })
})

describe('getMimeType', () => {
  it('should return correct MIME type for common image formats', () => {
    expect(getMimeType('image.png')).toBe('image/png')
    expect(getMimeType('photo.jpg')).toBe('image/jpeg')
    expect(getMimeType('photo.jpeg')).toBe('image/jpeg')
    expect(getMimeType('animation.gif')).toBe('image/gif')
    expect(getMimeType('vector.svg')).toBe('image/svg+xml')
    expect(getMimeType('modern.webp')).toBe('image/webp')
  })

  it('should be case insensitive', () => {
    expect(getMimeType('IMAGE.PNG')).toBe('image/png')
    expect(getMimeType('Photo.JPG')).toBe('image/jpeg')
  })

  it('should return default MIME type for unknown extensions', () => {
    expect(getMimeType('file.txt')).toBe('application/octet-stream')
    expect(getMimeType('file.unknown')).toBe('application/octet-stream')
  })
})

describe('getExtensionFromMimeType', () => {
  it('should return correct extension for MIME types', () => {
    expect(getExtensionFromMimeType('image/png')).toBe('png')
    expect(getExtensionFromMimeType('image/jpeg')).toBe('jpg')
    expect(getExtensionFromMimeType('image/gif')).toBe('gif')
    expect(getExtensionFromMimeType('image/svg+xml')).toBe('svg')
    expect(getExtensionFromMimeType('image/webp')).toBe('webp')
  })

  it('should return default extension for unknown MIME types', () => {
    expect(getExtensionFromMimeType('application/pdf')).toBe('bin')
    expect(getExtensionFromMimeType('text/plain')).toBe('bin')
  })
})
