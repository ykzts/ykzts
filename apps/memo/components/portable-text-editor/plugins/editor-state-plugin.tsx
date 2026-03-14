'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { EditorState, LexicalEditor } from 'lexical'
import { useEffect } from 'react'

export function EditorStatePlugin({
  onChange
}: {
  onChange: (editorState: EditorState, editor: LexicalEditor) => void
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState, editor)
    })
  }, [editor, onChange])

  return null
}
