'use client'

import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical'
import { Bold, Image, Italic, Link2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { uploadImage } from '@/lib/upload-image'
import { INSERT_IMAGE_COMMAND } from './image-plugin'
import { validateUrl } from './link-plugin'

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isLink, setIsLink] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))

      // Check if we're in a link - check both anchor and focus nodes
      const anchorNode = selection.anchor.getNode()
      const focusNode = selection.focus.getNode()
      const anchorParent = anchorNode.getParent()
      const focusParent = focusNode.getParent()
      setIsLink(
        $isLinkNode(anchorNode) ||
          $isLinkNode(anchorParent) ||
          $isLinkNode(focusNode) ||
          $isLinkNode(focusParent)
      )
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
      if (url && validateUrl(url)) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
      }
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [editor, isLink])

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files || files.length === 0) return

      const file = files[0]
      setIsUploading(true)

      try {
        const result = await uploadImage({ file })

        if (result.error) {
          // TODO: Replace with toast notification in future enhancement
          // Using browser alert for MVP, but should be replaced with:
          // - Toast notification component
          // - Proper error display in the UI
          alert(result.error)
        } else if (result.url) {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            altText: file.name.replace(/\.[^/.]+$/, ''),
            src: result.url
          })
        }
      } catch (error) {
        console.error('Image upload error:', error)
        // TODO: Replace with toast notification in future enhancement
        alert('画像のアップロードに失敗しました。')
      } finally {
        setIsUploading(false)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [editor]
  )

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex gap-1 border-border border-b bg-muted/5 p-2">
      <button
        aria-label="太字"
        className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
          isBold ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
        }`}
        onClick={formatBold}
        type="button"
      >
        <Bold />
      </button>
      <button
        aria-label="斜体"
        className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
          isItalic ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
        }`}
        onClick={formatItalic}
        type="button"
      >
        <Italic />
      </button>
      <button
        aria-label="リンク"
        className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
          isLink ? 'bg-muted/30 text-primary' : 'text-muted-foreground'
        }`}
        onClick={insertLink}
        type="button"
      >
        <Link2 />
      </button>
      <button
        aria-label="画像"
        className={`rounded px-3 py-1 text-sm transition-colors hover:bg-muted/20 ${
          isUploading ? 'cursor-not-allowed opacity-50' : ''
        } text-muted-foreground`}
        disabled={isUploading}
        onClick={triggerImageUpload}
        type="button"
      >
        <Image />
      </button>
      <input
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleImageUpload}
        ref={fileInputRef}
        type="file"
      />
    </div>
  )
}
