import { LinkNode } from '@lexical/link'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  $isTextNode,
  createEditor
} from 'lexical'
import { describe, expect, it } from 'vitest'
import { $createImageNode, $isImageNode, ImageNode } from '../nodes/image-node'
import {
  initializeEditorWithPortableText,
  lexicalToPortableText
} from '../portable-text-serializer'

describe('Portable Text Serializer', () => {
  describe('lexicalToPortableText', () => {
    it('should serialize plain text to Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('Hello world')
        paragraph.append(text)
        root.append(paragraph)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText).toHaveLength(1)
      expect(portableText[0]._type).toBe('block')
      expect(portableText[0].children).toHaveLength(1)
      expect(portableText[0].children[0]._type).toBe('span')
      expect(portableText[0].children[0].text).toBe('Hello world')
      expect(portableText[0].children[0]._key).toBeDefined()
    })

    it('should serialize bold text to Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const boldText = $createTextNode('bold text')
        boldText.toggleFormat('bold')
        paragraph.append(boldText)
        root.append(paragraph)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText[0].children[0].marks).toContain('strong')
      expect(portableText[0].children[0].text).toBe('bold text')
    })

    it('should serialize italic text to Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const italicText = $createTextNode('italic text')
        italicText.toggleFormat('italic')
        paragraph.append(italicText)
        root.append(paragraph)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText[0].children[0].marks).toContain('em')
      expect(portableText[0].children[0].text).toBe('italic text')
    })

    it('should serialize combined formatting to Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('bold italic text')
        text.toggleFormat('bold')
        text.toggleFormat('italic')
        paragraph.append(text)
        root.append(paragraph)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText[0].children[0].marks).toContain('strong')
      expect(portableText[0].children[0].marks).toContain('em')
    })

    it('should serialize empty editor to empty block', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText).toHaveLength(1)
      expect(portableText[0].children[0].text).toBe('')
    })

    it('should serialize multiple paragraphs to multiple blocks', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      editor.update(() => {
        const root = $getRoot()

        const paragraph1 = $createParagraphNode()
        const text1 = $createTextNode('First paragraph')
        paragraph1.append(text1)

        const paragraph2 = $createParagraphNode()
        const text2 = $createTextNode('Second paragraph')
        paragraph2.append(text2)

        root.append(paragraph1, paragraph2)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText).toHaveLength(2)
      expect(portableText[0].children[0].text).toBe('First paragraph')
      expect(portableText[1].children[0].text).toBe('Second paragraph')
    })
  })

  describe('initializeEditorWithPortableText', () => {
    it('should deserialize plain text from Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      const json = JSON.stringify([
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Hello world' }],
          markDefs: [],
          style: 'normal'
        }
      ])

      initializeEditorWithPortableText(editor, json)

      editor.read(() => {
        const root = $getRoot()
        const paragraph = root.getFirstChild()
        expect($isParagraphNode(paragraph)).toBe(true)

        if ($isParagraphNode(paragraph)) {
          const text = paragraph.getFirstChild()
          expect($isTextNode(text)).toBe(true)
          if ($isTextNode(text)) {
            expect(text.getTextContent()).toBe('Hello world')
          }
        }
      })
    })

    it('should deserialize bold text from Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      const json = JSON.stringify([
        {
          _type: 'block',
          children: [{ _type: 'span', marks: ['strong'], text: 'bold text' }],
          markDefs: [],
          style: 'normal'
        }
      ])

      initializeEditorWithPortableText(editor, json)

      editor.read(() => {
        const root = $getRoot()
        const paragraph = root.getFirstChild()

        if ($isParagraphNode(paragraph)) {
          const text = paragraph.getFirstChild()
          if ($isTextNode(text)) {
            expect(text.getTextContent()).toBe('bold text')
            expect(text.hasFormat('bold')).toBe(true)
          }
        }
      })
    })

    it('should deserialize italic text from Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      const json = JSON.stringify([
        {
          _type: 'block',
          children: [{ _type: 'span', marks: ['em'], text: 'italic text' }],
          markDefs: [],
          style: 'normal'
        }
      ])

      initializeEditorWithPortableText(editor, json)

      editor.read(() => {
        const root = $getRoot()
        const paragraph = root.getFirstChild()

        if ($isParagraphNode(paragraph)) {
          const text = paragraph.getFirstChild()
          if ($isTextNode(text)) {
            expect(text.getTextContent()).toBe('italic text')
            expect(text.hasFormat('italic')).toBe(true)
          }
        }
      })
    })

    it('should handle invalid JSON gracefully', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      initializeEditorWithPortableText(editor, 'invalid json')

      // Should not throw and editor should remain usable
      editor.read(() => {
        const root = $getRoot()
        expect(root).toBeDefined()
      })
    })
  })

  describe('Round-trip serialization', () => {
    it('should preserve plain text through round-trip', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('Test content')
        paragraph.append(text)
        root.append(paragraph)
      })

      const portableText = lexicalToPortableText(editor)
      const json = JSON.stringify(portableText)

      const editor2 = createEditor({
        nodes: [LinkNode, ImageNode]
      })
      initializeEditorWithPortableText(editor2, json)

      const portableText2 = lexicalToPortableText(editor2)

      expect(portableText2[0].children[0].text).toBe('Test content')
    })

    it('should preserve formatting through round-trip', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('Bold italic')
        text.toggleFormat('bold')
        text.toggleFormat('italic')
        paragraph.append(text)
        root.append(paragraph)
      })

      const portableText = lexicalToPortableText(editor)
      const json = JSON.stringify(portableText)

      const editor2 = createEditor({
        nodes: [LinkNode, ImageNode]
      })
      initializeEditorWithPortableText(editor2, json)

      const portableText2 = lexicalToPortableText(editor2)

      expect(portableText2[0].children[0].marks).toContain('strong')
      expect(portableText2[0].children[0].marks).toContain('em')
      expect(portableText2[0].children[0].text).toBe('Bold italic')
    })
  })

  describe('Image Node', () => {
    it('should serialize image to Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const imageNode = $createImageNode({
          altText: 'Test image',
          src: 'https://example.com/image.jpg'
        })
        root.append(imageNode)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText).toHaveLength(1)
      expect(portableText[0]._type).toBe('image')
      if (portableText[0]._type === 'image') {
        expect(portableText[0].alt).toBe('Test image')
        expect(portableText[0].asset.url).toBe('https://example.com/image.jpg')
        expect(portableText[0]._key).toBeDefined()
      }
    })

    it('should deserialize image from Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      const json = JSON.stringify([
        {
          _key: 'test-key',
          _type: 'image',
          alt: 'Test image',
          asset: {
            _type: 'reference',
            url: 'https://example.com/image.jpg'
          }
        }
      ])

      initializeEditorWithPortableText(editor, json)

      editor.read(() => {
        const root = $getRoot()
        const imageNode = root.getFirstChild()
        expect($isImageNode(imageNode)).toBe(true)

        if ($isImageNode(imageNode)) {
          expect(imageNode.getAltText()).toBe('Test image')
          expect(imageNode.getSrc()).toBe('https://example.com/image.jpg')
        }
      })
    })

    it('should preserve images through round-trip', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const imageNode = $createImageNode({
          altText: 'Round trip image',
          src: 'https://example.com/roundtrip.png'
        })
        root.append(imageNode)
      })

      const portableText = lexicalToPortableText(editor)
      const json = JSON.stringify(portableText)

      const editor2 = createEditor({
        nodes: [LinkNode, ImageNode]
      })
      initializeEditorWithPortableText(editor2, json)

      const portableText2 = lexicalToPortableText(editor2)

      expect(portableText2).toHaveLength(1)
      expect(portableText2[0]._type).toBe('image')
      if (portableText2[0]._type === 'image') {
        expect(portableText2[0].alt).toBe('Round trip image')
        expect(portableText2[0].asset.url).toBe(
          'https://example.com/roundtrip.png'
        )
      }
    })

    it('should handle mixed content with images and text blocks', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      editor.update(() => {
        const root = $getRoot()

        // Add text block
        const paragraph = $createParagraphNode()
        const text = $createTextNode('Text before image')
        paragraph.append(text)
        root.append(paragraph)

        // Add image
        const imageNode = $createImageNode({
          altText: 'Middle image',
          src: 'https://example.com/middle.jpg'
        })
        root.append(imageNode)

        // Add another text block
        const paragraph2 = $createParagraphNode()
        const text2 = $createTextNode('Text after image')
        paragraph2.append(text2)
        root.append(paragraph2)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText).toHaveLength(3)
      expect(portableText[0]._type).toBe('block')
      expect(portableText[1]._type).toBe('image')
      expect(portableText[2]._type).toBe('block')

      if (portableText[0]._type === 'block') {
        expect(portableText[0].children[0].text).toBe('Text before image')
      }
      if (portableText[1]._type === 'image') {
        expect(portableText[1].alt).toBe('Middle image')
      }
      if (portableText[2]._type === 'block') {
        expect(portableText[2].children[0].text).toBe('Text after image')
      }
    })

    it('should handle malformed image blocks gracefully', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      // Test with missing asset
      const jsonWithoutAsset = JSON.stringify([
        {
          _key: 'test-key-1',
          _type: 'image',
          alt: 'Image without asset'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Valid text' }],
          markDefs: []
        }
      ])

      initializeEditorWithPortableText(editor, jsonWithoutAsset)

      editor.read(() => {
        const root = $getRoot()
        // Should only have the valid text block, malformed image skipped
        expect(root.getChildrenSize()).toBe(1)
        const paragraph = root.getFirstChild()
        expect($isParagraphNode(paragraph)).toBe(true)
      })

      // Test with missing url in asset
      const editor2 = createEditor({
        nodes: [LinkNode, ImageNode]
      })

      const jsonWithoutUrl = JSON.stringify([
        {
          _key: 'test-key-2',
          _type: 'image',
          alt: 'Image without URL',
          asset: {
            _type: 'reference'
          }
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Another valid text' }],
          markDefs: []
        }
      ])

      initializeEditorWithPortableText(editor2, jsonWithoutUrl)

      editor2.read(() => {
        const root = $getRoot()
        // Should only have the valid text block, malformed image skipped
        expect(root.getChildrenSize()).toBe(1)
        const paragraph = root.getFirstChild()
        expect($isParagraphNode(paragraph)).toBe(true)
      })
    })
  })
})
