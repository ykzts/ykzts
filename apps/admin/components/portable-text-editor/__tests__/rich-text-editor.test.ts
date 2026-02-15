import { LinkNode } from '@lexical/link'
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
  ListItemNode,
  ListNode
} from '@lexical/list'
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode
} from '@lexical/rich-text'
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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

    it('should serialize underline text to Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const underlineText = $createTextNode('underline text')
        underlineText.toggleFormat('underline')
        paragraph.append(underlineText)
        root.append(paragraph)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText[0].children[0].marks).toContain('underline')
      expect(portableText[0].children[0].text).toBe('underline text')
    })

    it('should serialize combined formatting to Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('bold italic underline text')
        text.toggleFormat('bold')
        text.toggleFormat('italic')
        text.toggleFormat('underline')
        paragraph.append(text)
        root.append(paragraph)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText[0].children[0].marks).toContain('strong')
      expect(portableText[0].children[0].marks).toContain('em')
      expect(portableText[0].children[0].marks).toContain('underline')
    })

    it('should serialize empty editor to empty block', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText).toHaveLength(1)
      expect(portableText[0].children[0].text).toBe('')
    })

    it('should serialize multiple paragraphs to multiple blocks', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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

    it('should deserialize underline text from Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
      })

      const json = JSON.stringify([
        {
          _type: 'block',
          children: [
            { _type: 'span', marks: ['underline'], text: 'underline text' }
          ],
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
            expect(text.getTextContent()).toBe('underline text')
            expect(text.hasFormat('underline')).toBe(true)
          }
        }
      })
    })

    it('should handle invalid JSON gracefully', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
      })
      initializeEditorWithPortableText(editor2, json)

      const portableText2 = lexicalToPortableText(editor2)

      expect(portableText2[0].children[0].text).toBe('Test content')
    })

    it('should preserve formatting through round-trip', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
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

  describe('List Support', () => {
    it('should serialize bullet list to Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const list = $createListNode('bullet')
        const item1 = $createListItemNode()
        item1.append($createTextNode('First item'))
        const item2 = $createListItemNode()
        item2.append($createTextNode('Second item'))
        list.append(item1, item2)
        root.append(list)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText).toHaveLength(2)
      expect(portableText[0]._type).toBe('block')
      expect(portableText[0].listItem).toBe('bullet')
      expect(portableText[0].level).toBe(1)
      expect(portableText[0].children[0].text).toBe('First item')
      expect(portableText[1]._type).toBe('block')
      expect(portableText[1].listItem).toBe('bullet')
      expect(portableText[1].level).toBe(1)
      expect(portableText[1].children[0].text).toBe('Second item')
    })

    it('should serialize numbered list to Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
      })

      editor.update(() => {
        const root = $getRoot()

        const list = $createListNode('number')
        const item1 = $createListItemNode()
        item1.append($createTextNode('First step'))
        const item2 = $createListItemNode()
        item2.append($createTextNode('Second step'))
        list.append(item1, item2)
        root.append(list)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText).toHaveLength(2)
      expect(portableText[0]._type).toBe('block')
      expect(portableText[0].listItem).toBe('number')
      expect(portableText[0].level).toBe(1)
      expect(portableText[0].children[0].text).toBe('First step')
      expect(portableText[1]._type).toBe('block')
      expect(portableText[1].listItem).toBe('number')
      expect(portableText[1].level).toBe(1)
      expect(portableText[1].children[0].text).toBe('Second step')
    })

    it('should deserialize bullet list from Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
      })

      const json = JSON.stringify([
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Item 1' }],
          level: 1,
          listItem: 'bullet',
          markDefs: [],
          style: 'normal'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Item 2' }],
          level: 1,
          listItem: 'bullet',
          markDefs: [],
          style: 'normal'
        }
      ])

      initializeEditorWithPortableText(editor, json)

      editor.read(() => {
        const root = $getRoot()

        const list = root.getFirstChild()
        expect($isListNode(list)).toBe(true)

        if ($isListNode(list)) {
          expect(list.getListType()).toBe('bullet')
          const items = list.getChildren()
          expect(items).toHaveLength(2)

          if ($isListItemNode(items[0])) {
            const firstItemText = items[0].getTextContent()
            expect(firstItemText).toBe('Item 1')
          }

          if ($isListItemNode(items[1])) {
            const secondItemText = items[1].getTextContent()
            expect(secondItemText).toBe('Item 2')
          }
        }
      })
    })

    it('should deserialize numbered list from Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
      })

      const json = JSON.stringify([
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Step 1' }],
          level: 1,
          listItem: 'number',
          markDefs: [],
          style: 'normal'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Step 2' }],
          level: 1,
          listItem: 'number',
          markDefs: [],
          style: 'normal'
        }
      ])

      initializeEditorWithPortableText(editor, json)

      editor.read(() => {
        const root = $getRoot()

        const list = root.getFirstChild()
        expect($isListNode(list)).toBe(true)

        if ($isListNode(list)) {
          expect(list.getListType()).toBe('number')
          const items = list.getChildren()
          expect(items).toHaveLength(2)

          if ($isListItemNode(items[0])) {
            const firstItemText = items[0].getTextContent()
            expect(firstItemText).toBe('Step 1')
          }

          if ($isListItemNode(items[1])) {
            const secondItemText = items[1].getTextContent()
            expect(secondItemText).toBe('Step 2')
          }
        }
      })
    })

    it('should preserve list formatting through round-trip', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
      })

      editor.update(() => {
        const root = $getRoot()

        const list = $createListNode('bullet')
        const item = $createListItemNode()
        const text = $createTextNode('Bold item')
        text.toggleFormat('bold')
        item.append(text)
        list.append(item)
        root.append(list)
      })

      const portableText = lexicalToPortableText(editor)
      const json = JSON.stringify(portableText)

      const editor2 = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
      })
      initializeEditorWithPortableText(editor2, json)

      const portableText2 = lexicalToPortableText(editor2)

      expect(portableText2[0].listItem).toBe('bullet')
      expect(portableText2[0].children[0].marks).toContain('strong')
      expect(portableText2[0].children[0].text).toBe('Bold item')
    })

    it('should handle mixed content with lists and paragraphs', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode]
      })

      const json = JSON.stringify([
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Paragraph before list' }],
          markDefs: [],
          style: 'normal'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'List item' }],
          level: 1,
          listItem: 'bullet',
          markDefs: [],
          style: 'normal'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Paragraph after list' }],
          markDefs: [],
          style: 'normal'
        }
      ])

      initializeEditorWithPortableText(editor, json)

      editor.read(() => {
        const root = $getRoot()

        expect(root.getChildrenSize()).toBe(3)

        const firstChild = root.getFirstChild()
        expect($isParagraphNode(firstChild)).toBe(true)

        const secondChild = root.getChildren()[1]
        expect($isListNode(secondChild)).toBe(true)

        const thirdChild = root.getChildren()[2]
        expect($isParagraphNode(thirdChild)).toBe(true)
      })
    })
  })

  describe('Heading Support', () => {
    it('should serialize H2 heading to Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode, HeadingNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const heading = $createHeadingNode('h2')
        heading.append($createTextNode('Main Heading'))
        root.append(heading)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText).toHaveLength(1)
      expect(portableText[0]._type).toBe('block')
      expect(portableText[0].style).toBe('h2')
      expect(portableText[0].children[0].text).toBe('Main Heading')
    })

    it('should serialize H3 heading to Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode, HeadingNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const heading = $createHeadingNode('h3')
        heading.append($createTextNode('Subheading'))
        root.append(heading)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText).toHaveLength(1)
      expect(portableText[0]._type).toBe('block')
      expect(portableText[0].style).toBe('h3')
      expect(portableText[0].children[0].text).toBe('Subheading')
    })

    it('should serialize headings H4-H6 to Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode, HeadingNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const h4 = $createHeadingNode('h4')
        h4.append($createTextNode('H4 Heading'))
        const h5 = $createHeadingNode('h5')
        h5.append($createTextNode('H5 Heading'))
        const h6 = $createHeadingNode('h6')
        h6.append($createTextNode('H6 Heading'))
        root.append(h4, h5, h6)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText).toHaveLength(3)
      expect(portableText[0].style).toBe('h4')
      expect(portableText[0].children[0].text).toBe('H4 Heading')
      expect(portableText[1].style).toBe('h5')
      expect(portableText[1].children[0].text).toBe('H5 Heading')
      expect(portableText[2].style).toBe('h6')
      expect(portableText[2].children[0].text).toBe('H6 Heading')
    })

    it('should deserialize H2 heading from Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode, HeadingNode]
      })

      const json = JSON.stringify([
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Main Heading' }],
          markDefs: [],
          style: 'h2'
        }
      ])

      initializeEditorWithPortableText(editor, json)

      editor.read(() => {
        const root = $getRoot()
        const heading = root.getFirstChild()
        expect($isHeadingNode(heading)).toBe(true)

        if ($isHeadingNode(heading)) {
          expect(heading.getTag()).toBe('h2')
          expect(heading.getTextContent()).toBe('Main Heading')
        }
      })
    })

    it('should deserialize headings H3-H6 from Portable Text', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode, HeadingNode]
      })

      const json = JSON.stringify([
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'H3' }],
          markDefs: [],
          style: 'h3'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'H4' }],
          markDefs: [],
          style: 'h4'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'H5' }],
          markDefs: [],
          style: 'h5'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'H6' }],
          markDefs: [],
          style: 'h6'
        }
      ])

      initializeEditorWithPortableText(editor, json)

      editor.read(() => {
        const root = $getRoot()
        const children = root.getChildren()

        expect(children).toHaveLength(4)

        if ($isHeadingNode(children[0])) {
          expect(children[0].getTag()).toBe('h3')
          expect(children[0].getTextContent()).toBe('H3')
        }
        if ($isHeadingNode(children[1])) {
          expect(children[1].getTag()).toBe('h4')
          expect(children[1].getTextContent()).toBe('H4')
        }
        if ($isHeadingNode(children[2])) {
          expect(children[2].getTag()).toBe('h5')
          expect(children[2].getTextContent()).toBe('H5')
        }
        if ($isHeadingNode(children[3])) {
          expect(children[3].getTag()).toBe('h6')
          expect(children[3].getTextContent()).toBe('H6')
        }
      })
    })

    it('should preserve heading formatting through round-trip', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode, HeadingNode]
      })

      editor.update(() => {
        const root = $getRoot()
        const heading = $createHeadingNode('h2')
        const text = $createTextNode('Bold Heading')
        text.toggleFormat('bold')
        heading.append(text)
        root.append(heading)
      })

      const portableText = lexicalToPortableText(editor)
      const json = JSON.stringify(portableText)

      const editor2 = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode, HeadingNode]
      })
      initializeEditorWithPortableText(editor2, json)

      const portableText2 = lexicalToPortableText(editor2)

      expect(portableText2[0].style).toBe('h2')
      expect(portableText2[0].children[0].marks).toContain('strong')
      expect(portableText2[0].children[0].text).toBe('Bold Heading')
    })

    it('should handle mixed content with headings and paragraphs', () => {
      const editor = createEditor({
        nodes: [LinkNode, ImageNode, ListNode, ListItemNode, HeadingNode]
      })

      const json = JSON.stringify([
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Regular paragraph' }],
          markDefs: [],
          style: 'normal'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Heading text' }],
          markDefs: [],
          style: 'h2'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Another paragraph' }],
          markDefs: [],
          style: 'normal'
        }
      ])

      initializeEditorWithPortableText(editor, json)

      editor.read(() => {
        const root = $getRoot()
        const children = root.getChildren()

        expect(children).toHaveLength(3)

        expect($isParagraphNode(children[0])).toBe(true)
        expect($isHeadingNode(children[1])).toBe(true)
        expect($isParagraphNode(children[2])).toBe(true)

        if ($isHeadingNode(children[1])) {
          expect(children[1].getTag()).toBe('h2')
          expect(children[1].getTextContent()).toBe('Heading text')
        }
      })
    })
  })

  describe('Quote Support', () => {
    it('should serialize quote to Portable Text', () => {
      const editor = createEditor({
        nodes: [
          LinkNode,
          ImageNode,
          ListNode,
          ListItemNode,
          HeadingNode,
          QuoteNode
        ]
      })

      editor.update(() => {
        const root = $getRoot()
        const quote = $createQuoteNode()
        quote.append($createTextNode('This is a quote'))
        root.append(quote)
      })

      const portableText = lexicalToPortableText(editor)

      expect(portableText).toHaveLength(1)
      expect(portableText[0]._type).toBe('block')
      expect(portableText[0].style).toBe('blockquote')
      expect(portableText[0].children[0].text).toBe('This is a quote')
    })

    it('should deserialize quote from Portable Text', () => {
      const editor = createEditor({
        nodes: [
          LinkNode,
          ImageNode,
          ListNode,
          ListItemNode,
          HeadingNode,
          QuoteNode
        ]
      })

      const json = JSON.stringify([
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Quoted text' }],
          markDefs: [],
          style: 'blockquote'
        }
      ])

      initializeEditorWithPortableText(editor, json)

      editor.read(() => {
        const root = $getRoot()
        const quote = root.getFirstChild()
        expect($isQuoteNode(quote)).toBe(true)

        if ($isQuoteNode(quote)) {
          expect(quote.getTextContent()).toBe('Quoted text')
        }
      })
    })

    it('should preserve quote formatting through round-trip', () => {
      const editor = createEditor({
        nodes: [
          LinkNode,
          ImageNode,
          ListNode,
          ListItemNode,
          HeadingNode,
          QuoteNode
        ]
      })

      editor.update(() => {
        const root = $getRoot()
        const quote = $createQuoteNode()
        const text = $createTextNode('Bold quote')
        text.toggleFormat('bold')
        quote.append(text)
        root.append(quote)
      })

      const portableText = lexicalToPortableText(editor)
      const json = JSON.stringify(portableText)

      const editor2 = createEditor({
        nodes: [
          LinkNode,
          ImageNode,
          ListNode,
          ListItemNode,
          HeadingNode,
          QuoteNode
        ]
      })
      initializeEditorWithPortableText(editor2, json)

      const portableText2 = lexicalToPortableText(editor2)

      expect(portableText2[0].style).toBe('blockquote')
      expect(portableText2[0].children[0].marks).toContain('strong')
      expect(portableText2[0].children[0].text).toBe('Bold quote')
    })

    it('should handle mixed content with quotes and other blocks', () => {
      const editor = createEditor({
        nodes: [
          LinkNode,
          ImageNode,
          ListNode,
          ListItemNode,
          HeadingNode,
          QuoteNode
        ]
      })

      const json = JSON.stringify([
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Regular paragraph' }],
          markDefs: [],
          style: 'normal'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Quote text' }],
          markDefs: [],
          style: 'blockquote'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Another paragraph' }],
          markDefs: [],
          style: 'normal'
        }
      ])

      initializeEditorWithPortableText(editor, json)

      editor.read(() => {
        const root = $getRoot()
        const children = root.getChildren()

        expect(children).toHaveLength(3)

        expect($isParagraphNode(children[0])).toBe(true)
        expect($isQuoteNode(children[1])).toBe(true)
        expect($isParagraphNode(children[2])).toBe(true)

        if ($isQuoteNode(children[1])) {
          expect(children[1].getTextContent()).toBe('Quote text')
        }
      })
    })
  })
})
