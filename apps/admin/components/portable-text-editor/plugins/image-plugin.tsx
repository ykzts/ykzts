'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $insertNodes,
  $isRootNode,
  COMMAND_PRIORITY_EDITOR,
  createCommand
} from 'lexical'
import { useEffect } from 'react'
import { $createImageNode } from '../nodes/image-node'

export const INSERT_IMAGE_COMMAND = createCommand<{
  altText: string
  src: string
}>('INSERT_IMAGE_COMMAND')

export function ImagePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const imageNode = $createImageNode({
          altText: payload.altText,
          src: payload.src
        })
        $insertNodes([imageNode])
        // If the image ended up inside a non-root element (e.g. a code block),
        // move it to the root level so the serializer can find it.
        const parent = imageNode.getParent()
        if (parent !== null && !$isRootNode(parent)) {
          const topLevel = imageNode.getTopLevelElement()
          if (topLevel !== null) {
            topLevel.insertAfter(imageNode)
          }
        }
        return true
      },
      COMMAND_PRIORITY_EDITOR
    )
  }, [editor])

  return null
}
