'use client'

import { $isCodeNode } from '@lexical/code'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_ENTER_COMMAND
} from 'lexical'
import { useEffect } from 'react'

/**
 * Plugin that enables exiting a code block by pressing Enter on an empty line.
 * Shift+Enter always inserts a newline within the code block.
 */
export function CodeExitPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        // Shift+Enter: always insert newline (default behavior)
        if (event?.shiftKey) return false

        const selection = $getSelection()
        if (!$isRangeSelection(selection) || !selection.isCollapsed())
          return false

        const anchorNode = selection.anchor.getNode()
        const topElement =
          anchorNode.getKey() === 'root'
            ? anchorNode
            : anchorNode.getTopLevelElementOrThrow()

        if (!$isCodeNode(topElement)) return false

        // Build the text content before the cursor within the code block.
        // LineBreakNode.getTextContent() returns '\n', so this correctly
        // accumulates the full text including line breaks.
        const children = topElement.getChildren()
        const anchorKey = anchorNode.getKey()
        const anchorOffset = selection.anchor.offset

        let textBeforeCursor = ''
        let found = false

        for (const child of children) {
          if (child.getKey() === anchorKey) {
            textBeforeCursor += child.getTextContent().slice(0, anchorOffset)
            found = true
            break
          }
          textBeforeCursor += child.getTextContent()
        }

        if (!found) return false

        // Check if the current line (after the last newline) is empty
        const lastNL = textBeforeCursor.lastIndexOf('\n')
        const currentLine =
          lastNL >= 0 ? textBeforeCursor.slice(lastNL + 1) : textBeforeCursor

        if (currentLine !== '') return false

        // We're on an empty line — exit the code block
        event?.preventDefault()

        // Remove the trailing newline character that created this empty line,
        // or remove the entire code block if it is completely empty.
        if (lastNL >= 0) {
          selection.deleteCharacter(true)
        } else {
          // The code block has no content at all; remove it
          topElement.remove()
        }

        // Insert a new paragraph after the code block and move the cursor there
        const newParagraph = $createParagraphNode()
        if (topElement.isAttached()) {
          topElement.insertAfter(newParagraph)
        }
        newParagraph.select()

        return true
      },
      COMMAND_PRIORITY_HIGH
    )
  }, [editor])

  return null
}
