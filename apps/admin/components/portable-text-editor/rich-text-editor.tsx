'use client'

import { LinkNode } from '@lexical/link'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import type { EditorState, LexicalEditor } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorStatePlugin } from './plugins/editor-state-plugin'
import { LinkPlugin } from './plugins/link-plugin'
import { ToolbarPlugin } from './plugins/toolbar-plugin'
import {
  initializeEditorWithPortableText,
  lexicalToPortableText
} from './portable-text-serializer'

const editorTheme = {
  link: 'text-accent hover:underline',
  paragraph: 'mb-1',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline'
  }
}

type RichTextEditorProps = {
  id?: string
  initialValue?: string
  name: string
  onChange?: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({
  id,
  initialValue,
  name,
  onChange,
  placeholder
}: RichTextEditorProps) {
  const [isClient, setIsClient] = useState(false)
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const initialConfig = {
    editorState: initialValue
      ? (editor: LexicalEditor) => {
          initializeEditorWithPortableText(editor, initialValue)
        }
      : undefined,
    namespace: 'RichTextEditor',
    nodes: [LinkNode],
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
    theme: editorTheme
  }

  const handleEditorChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      editorState.read(() => {
        const portableText = lexicalToPortableText(editor)
        const jsonString = JSON.stringify(portableText)

        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = jsonString
        }

        if (onChange) {
          onChange(jsonString)
        }
      })
    },
    [onChange]
  )

  if (!isClient) {
    return (
      <div className="rounded border border-border bg-muted/5 p-4">
        <div className="h-32 animate-pulse bg-muted/20" />
      </div>
    )
  }

  return (
    <div>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative rounded border border-border bg-card">
          <ToolbarPlugin />
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="min-h-[150px] overflow-auto px-4 py-3 text-foreground outline-none"
                  id={id}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
              placeholder={
                <div className="pointer-events-none absolute top-3 left-4 text-muted">
                  {placeholder || 'テキストを入力してください...'}
                </div>
              }
            />
          </div>
          <HistoryPlugin />
          <AutoFocusPlugin />
          <LinkPlugin />
        </div>
        <EditorStatePlugin onChange={handleEditorChange} />
      </LexicalComposer>

      <input name={name} ref={hiddenInputRef} type="hidden" />
    </div>
  )
}
