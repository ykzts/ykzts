'use client'

import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical'
import { useCallback, useEffect, useState } from 'react'

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isLink, setIsLink] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))

      // Check if we're in a link
      const node = selection.anchor.getNode()
      const parent = node.getParent()
      setIsLink($isLinkNode(parent) || $isLinkNode(node))
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      })
    )
  }, [editor, updateToolbar])

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
  }

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
  }

  const insertLink = useCallback(() => {
    if (!isLink) {
      // TODO: Replace with custom accessible modal in future enhancement
      // Using browser prompt for MVP, but should be replaced with:
      // - Custom modal with proper focus management
      // - Keyboard navigation support
      // - Screen reader announcements
      // - Cancel button
      const url = prompt(
        'リンクのURLを入力してください（例: https://example.com）:'
      )
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
      }
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [editor, isLink])

  return (
    <div className="flex gap-1 border-b border-border bg-muted/5 p-2">
      <button
        aria-label="太字"
        className={`rounded px-3 py-1 font-bold text-sm transition-colors hover:bg-muted/20 ${
          isBold ? 'bg-muted/30 text-accent' : 'text-muted'
        }`}
        onClick={formatBold}
        type="button"
      >
        B
      </button>
      <button
        aria-label="斜体"
        className={`rounded px-3 py-1 font-serif italic text-sm transition-colors hover:bg-muted/20 ${
          isItalic ? 'bg-muted/30 text-accent' : 'text-muted'
        }`}
        onClick={formatItalic}
        type="button"
      >
        I
      </button>
      <button
        aria-label="リンク"
        className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
          isLink ? 'bg-muted/30 text-accent' : 'text-muted'
        }`}
        onClick={insertLink}
        type="button"
      >
        🔗
      </button>
    </div>
  )
}
