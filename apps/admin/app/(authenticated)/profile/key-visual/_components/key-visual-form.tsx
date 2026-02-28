'use client'

import { Button } from '@ykzts/ui/components/button'
import { Input } from '@ykzts/ui/components/input'
import { ImageOff, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useActionState, useRef, useState } from 'react'
import { getImageDimensions } from '@/lib/upload-image'
import { deleteKeyVisual, uploadKeyVisual } from '@/lib/upload-key-visual'
import { saveKeyVisual } from '../actions'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

type KeyVisualData = {
  alt_text: string | null
  artist_name: string | null
  artist_url: string | null
  attribution: string | null
  height: number
  id: string
  url: string
  width: number
}

type KeyVisualFormProps = {
  currentKeyVisual?: KeyVisualData | null
}

export function KeyVisualForm({ currentKeyVisual }: KeyVisualFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [state, formAction, isPending] = useActionState(saveKeyVisual, null)

  const [currentUrl, setCurrentUrl] = useState<string | null>(
    currentKeyVisual?.url ?? null
  )
  const [preview, setPreview] = useState<string | null>(
    currentKeyVisual?.url ?? null
  )
  const [dimensions, setDimensions] = useState<{
    height: number
    width: number
  } | null>(
    currentKeyVisual
      ? { height: currentKeyVisual.height, width: currentKeyVisual.width }
      : null
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setPreview(currentUrl)
      setSelectedFile(null)
      setUploadError(null)
      return
    }

    // Client-side validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(
        'サポートされていない画像形式です。JPEG、PNG、GIF、WebPのみアップロード可能です。'
      )
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError(
        'ファイルサイズが大きすぎます。5MB以下の画像をアップロードしてください。'
      )
      return
    }

    setUploadError(null)
    setSelectedFile(file)

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Get dimensions
    try {
      const dims = await getImageDimensions(file)
      setDimensions(dims)
    } catch {
      setDimensions(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('ファイルを選択してください。')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('key_visual', selectedFile)

      const result = await uploadKeyVisual(formData)

      if (result.error) {
        setUploadError(result.error)
        setPreview(currentUrl)
      } else if (result.url) {
        setCurrentUrl(result.url)
        setPreview(result.url)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (_err) {
      setUploadError('アップロード中にエラーが発生しました。')
      setPreview(currentUrl)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setUploadError(null)

    try {
      const result = await deleteKeyVisual()

      if (result.error) {
        setUploadError(result.error)
      } else {
        setCurrentUrl(null)
        setPreview(null)
        setDimensions(null)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        router.refresh()
      }
    } catch (_err) {
      setUploadError('削除中にエラーが発生しました。')
    } finally {
      setDeleting(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0]
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        fileInputRef.current.files = dataTransfer.files
      }
      handleFileChange(file)
    }
  }

  const hasNewFile = !!selectedFile

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded border border-error bg-error/10 p-4 text-error">
          {state.error}
        </div>
      )}

      <div className="space-y-3">
        {/* Preview */}
        {preview && (
          <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border-2 border-border">
            <Image
              alt="キービジュアルのプレビュー"
              className="object-cover"
              fill
              sizes="384px"
              src={preview}
            />
          </div>
        )}

        {/* Upload area */}
        <button
          aria-describedby="key-visual-upload-help"
          aria-label="キービジュアルをアップロード"
          className={`flex min-h-32 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/10'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          type="button"
        >
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="mb-1 text-center text-sm">
            ドラッグ&amp;ドロップまたはクリックして画像を選択
          </p>
          <p
            className="mb-3 text-center text-muted-foreground text-xs"
            id="key-visual-upload-help"
          >
            JPEG、PNG、GIF、WebP（最大5MB）
          </p>
          <input
            accept={ALLOWED_TYPES.join(',')}
            aria-label="キービジュアルファイル"
            className="sr-only"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            ref={fileInputRef}
            type="file"
          />
        </button>

        {/* Upload/Delete action buttons */}
        <div className="flex gap-2">
          {hasNewFile && (
            <Button
              disabled={uploading || deleting}
              onClick={handleUpload}
              size="sm"
              type="button"
            >
              {uploading ? 'アップロード中...' : 'アップロード'}
            </Button>
          )}
          {currentUrl && !hasNewFile && (
            <Button
              disabled={uploading || deleting}
              onClick={handleDelete}
              size="sm"
              type="button"
              variant="destructive"
            >
              {deleting ? (
                '削除中...'
              ) : (
                <>
                  <X className="mr-1 h-4 w-4" />
                  削除
                </>
              )}
            </Button>
          )}
        </div>

        {uploadError && (
          <div
            className="rounded border border-error bg-error/10 p-3 text-error text-sm"
            role="alert"
          >
            {uploadError}
          </div>
        )}

        {!currentUrl && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <ImageOff className="h-4 w-4" />
            <span>キービジュアルが設定されていません</span>
          </div>
        )}
      </div>

      {/* Hidden fields for form submission */}
      {currentUrl && (
        <>
          <input name="key_visual_url" type="hidden" value={currentUrl} />
          {dimensions && (
            <>
              <input
                name="key_visual_width"
                type="hidden"
                value={dimensions.width}
              />
              <input
                name="key_visual_height"
                type="hidden"
                value={dimensions.height}
              />
            </>
          )}
        </>
      )}

      {/* Metadata fields */}
      {currentUrl && (
        <div className="space-y-4">
          <div>
            <label
              className="mb-2 block font-medium"
              htmlFor="key_visual_alt_text"
            >
              代替テキスト (alt)
            </label>
            <Input
              defaultValue={currentKeyVisual?.alt_text ?? ''}
              id="key_visual_alt_text"
              name="key_visual_alt_text"
              placeholder="画像の説明"
              type="text"
            />
          </div>

          <div>
            <label
              className="mb-2 block font-medium"
              htmlFor="key_visual_artist_name"
            >
              アーティスト名
            </label>
            <Input
              defaultValue={currentKeyVisual?.artist_name ?? ''}
              id="key_visual_artist_name"
              name="key_visual_artist_name"
              placeholder="作者名"
              type="text"
            />
          </div>

          <div>
            <label
              className="mb-2 block font-medium"
              htmlFor="key_visual_artist_url"
            >
              アーティストURL
            </label>
            <Input
              defaultValue={currentKeyVisual?.artist_url ?? ''}
              id="key_visual_artist_url"
              name="key_visual_artist_url"
              placeholder="https://example.com/artist"
              type="url"
            />
          </div>

          <div>
            <label
              className="mb-2 block font-medium"
              htmlFor="key_visual_attribution"
            >
              帰属情報
            </label>
            <Input
              defaultValue={currentKeyVisual?.attribution ?? ''}
              id="key_visual_attribution"
              name="key_visual_attribution"
              placeholder="例: CC BY 4.0"
              type="text"
            />
          </div>
        </div>
      )}

      <p className="text-muted-foreground text-sm">
        プロフィールページのヘッダーに表示される背景画像です。
      </p>

      <div className="flex gap-4">
        {currentUrl && (
          <Button disabled={isPending || uploading || deleting} type="submit">
            {isPending ? '保存中...' : '保存'}
          </Button>
        )}
        <Button
          onClick={() => {
            router.push('/profile')
          }}
          type="button"
          variant="secondary"
        >
          戻る
        </Button>
      </div>
    </form>
  )
}
