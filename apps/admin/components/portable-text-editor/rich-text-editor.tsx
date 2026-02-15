'use client'

import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode } from '@lexical/rich-text'
import type { EditorState, LexicalEditor } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageNode } from './nodes/image-node'
import { EditorStatePlugin } from './plugins/editor-state-plugin'
import { ImagePlugin } from './plugins/image-plugin'
import { LinkPlugin } from './plugins/link-plugin'
import { ToolbarPlugin } from './plugins/toolbar-plugin'
import {
  initializeEditorWithPortableText,
  lexicalToPortableText
} from './portable-text-serializer'

const editorTheme = {
  heading: {
    h1: 'text-4xl font-bold mb-4',
    h2: 'text-3xl font-bold mb-3',
    h3: 'text-2xl font-bold mb-2',
    h4: 'text-xl font-bold mb-2',
    h5: 'text-lg font-bold mb-1',
    h6: 'text-base font-bold mb-1'
  },
  link: 'text-primary hover:underline',
  list: {
    listitem: 'ml-8',
    nested: {
      listitem: 'list-none'
    },
    ol: 'list-decimal',
    ul: 'list-disc'
  },
  paragraph: 'mb-1',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline'
  }
}

type RichTextEditorProps = {
  autoFocus?: boolean
  id?: string
  initialValue?: string
  name: string
  onChange?: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({
  autoFocus = false,
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
    nodes: [LinkNode, ImageNode, ListNode, ListItemNode, HeadingNode],
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
                <div className="pointer-events-none absolute top-3 left-4 text-muted-foreground">
                  {placeholder || 'テキストを入力してください...'}
                </div>
              }
            />
          </div>
          <HistoryPlugin />
          <ListPlugin />
          {autoFocus && <AutoFocusPlugin />}
          <LinkPlugin />
          <ImagePlugin />
        </div>
        <EditorStatePlugin onChange={handleEditorChange} />
      </LexicalComposer>

      <input
        defaultValue={initialValue || ''}
        name={name}
        ref={hiddenInputRef}
        type="hidden"
      />
    </div>
  )
}
