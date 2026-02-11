'use client'

import { CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import type { EditorState, LexicalEditor } from 'lexical'
import { useEffect, useRef, useState } from 'react'
import { LinkPlugin } from './link-plugin'
import {
  initializeEditorWithPortableText,
  lexicalToPortableText
} from './portable-text-serializer'
import { ToolbarPlugin } from './toolbar-plugin'

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
  initialValue?: string
  name: string
  onChange?: (value: string) => void
}

export function RichTextEditor({
  initialValue,
  name,
  onChange
}: RichTextEditorProps) {
  const [isClient, setIsClient] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
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
    namespace: 'PortableTextEditor',
    nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode, LinkNode],
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
    theme: editorTheme
  }

  const handleEditorChange = (
    editorState: EditorState,
    editor: LexicalEditor
  ) => {
    editorState.read(() => {
      const portableText = lexicalToPortableText(editor)
      const jsonString = JSON.stringify(portableText)

      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = jsonString
      }

      if (onChange) {
        onChange(jsonString)
      }

      setPreviewContent(jsonString)
    })
  }

  if (!isClient) {
    return (
      <div className="rounded border border-border bg-muted/5 p-4">
        <div className="h-32 animate-pulse bg-muted/20" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative rounded border border-border bg-card">
          <ToolbarPlugin />
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[150px] resize-y overflow-auto px-4 py-3 text-foreground outline-none" />
              }
              ErrorBoundary={LexicalErrorBoundary}
              placeholder={
                <div className="pointer-events-none absolute top-3 left-4 text-muted">
                  自己紹介を入力してください...
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

      <div className="flex items-center gap-2">
        <button
          className="btn-secondary text-sm"
          onClick={() => setShowPreview(!showPreview)}
          type="button"
        >
          {showPreview ? 'プレビューを非表示' : 'プレビューを表示'}
        </button>
      </div>

      {showPreview && previewContent && (
        <div className="rounded border border-border bg-muted/5 p-4">
          <div className="mb-2 font-medium text-sm">プレビュー (JSON)</div>
          <pre className="overflow-auto text-xs">
            {JSON.stringify(JSON.parse(previewContent), null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

function EditorStatePlugin({
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
