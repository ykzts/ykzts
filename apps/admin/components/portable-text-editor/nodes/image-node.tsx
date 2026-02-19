'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread
} from 'lexical'
import { $getNodeByKey, DecoratorNode } from 'lexical'
import type { ReactElement } from 'react'
import { useState } from 'react'
import { ImageAltDialog } from '../plugins/image-alt-dialog'

export type SerializedImageNode = Spread<
  {
    altText: string
    height?: number
    src: string
    width?: number
  },
  SerializedLexicalNode
>

type ImageComponentProps = {
  altText: string
  height?: number
  nodeKey: NodeKey
  src: string
  width?: number
}

function ImageComponent({
  altText,
  height,
  nodeKey,
  src,
  width
}: ImageComponentProps) {
  const [editor] = useLexicalComposerContext()
  const [showAltDialog, setShowAltDialog] = useState(false)

  const handleAltConfirm = (newAlt: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isImageNode(node)) {
        node.setAltText(newAlt)
      }
    })
  }

  return (
    <>
      <button
        aria-label={
          altText
            ? `${altText}（クリックしてalt属性を編集）`
            : 'クリックしてalt属性を編集'
        }
        className="cursor-pointer border-0 bg-transparent p-0"
        onClick={() => setShowAltDialog(true)}
        title="クリックしてalt属性を編集"
        type="button"
      >
        {/* biome-ignore lint/performance/noImgElement: next/image is not suitable for user-uploaded content in the editor */}
        <img
          alt={altText}
          className="my-2 h-auto max-w-full"
          height={height}
          src={src}
          width={width}
        />
      </button>
      <ImageAltDialog
        initialAlt={altText}
        onConfirm={handleAltConfirm}
        onOpenChange={setShowAltDialog}
        open={showAltDialog}
      />
    </>
  )
}

export class ImageNode extends DecoratorNode<ReactElement> {
  __src: string
  __altText: string
  __width?: number
  __height?: number

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key
    )
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, src, width } = serializedNode
    const node = $createImageNode({ altText, height, src, width })
    return node
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      height: this.__height,
      src: this.getSrc(),
      type: 'image',
      version: 1,
      width: this.__width
    }
  }

  constructor(
    src: string,
    altText: string,
    width?: number,
    height?: number,
    key?: NodeKey
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__width = width
    this.__height = height
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img')
    element.setAttribute('src', this.__src)
    element.setAttribute('alt', this.__altText)
    if (this.__width) {
      element.setAttribute('width', this.__width.toString())
    }
    if (this.__height) {
      element.setAttribute('height', this.__height.toString())
    }
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0
      })
    }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    const theme = config.theme
    const className = theme.image
    if (className !== undefined) {
      span.className = className
    }
    return span
  }

  updateDOM(): false {
    return false
  }

  getSrc(): string {
    return this.__src
  }

  getAltText(): string {
    return this.__altText
  }

  setAltText(altText: string): void {
    const writable = this.getWritable()
    writable.__altText = altText
  }

  decorate(): ReactElement {
    return (
      <ImageComponent
        altText={this.__altText}
        height={this.__height}
        nodeKey={this.__key}
        src={this.__src}
        width={this.__width}
      />
    )
  }
}

export function $createImageNode({
  altText,
  height,
  src,
  width
}: {
  altText: string
  height?: number
  src: string
  width?: number
}): ImageNode {
  return new ImageNode(src, altText, width, height)
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode
    const node = $createImageNode({
      altText,
      height: height ? Number(height) : undefined,
      src,
      width: width ? Number(width) : undefined
    })
    return { node }
  }
  return null
}
