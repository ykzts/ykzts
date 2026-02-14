'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
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
        return true
      },
      COMMAND_PRIORITY_EDITOR
    )
  }, [editor])

  return null
}
