'use client'

import { Button } from '@ykzts/ui/components/button'
import { Upload, UserCircle, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { deleteAvatar, uploadAvatar } from '@/lib/upload-avatar'

type AvatarUploadProps = {
  currentAvatarUrl?: string | null
  onUploadComplete?: (url: string) => void
  onDeleteComplete?: () => void
}

export function AvatarUpload({
  currentAvatarUrl,
  onUploadComplete,
  onDeleteComplete
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    currentAvatarUrl || null
  )
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setPreview(currentAvatarUrl || null)
      setError(null)
      return
    }

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError(
        'サポートされていない画像形式です。JPEG、PNG、GIF、WebPのみアップロード可能です。'
      )
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError(
        'ファイルサイズが大きすぎます。5MB以下の画像をアップロードしてください。'
      )
      return
    }

    setError(null)

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    const fileInput = fileInputRef.current
    if (!fileInput?.files?.[0]) {
      setError('ファイルを選択してください。')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('avatar', fileInput.files[0])

      const result = await uploadAvatar(formData)

      if (result.error) {
        setError(result.error)
        setPreview(currentAvatarUrl || null)
      } else if (result.url) {
        setPreview(result.url)
        onUploadComplete?.(result.url)
      }
    } catch (_err) {
      setError('アップロード中にエラーが発生しました。')
      setPreview(currentAvatarUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentAvatarUrl) return

    setDeleting(true)
    setError(null)

    try {
      const result = await deleteAvatar()

      if (result.error) {
        setError(result.error)
      } else {
        setPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        onDeleteComplete?.()
      }
    } catch (_err) {
      setError('削除中にエラーが発生しました。')
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
        // Create a new FileList with the dropped file
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        fileInputRef.current.files = dataTransfer.files
      }
      handleFileChange(file)
    }
  }

  const hasChanged =
    fileInputRef.current?.files?.[0] && preview !== currentAvatarUrl

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 block font-medium">プロフィール画像</div>
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Preview */}
          <div className="flex items-center justify-center">
            {preview ? (
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-border">
                <Image
                  alt="Avatar preview"
                  className="object-cover"
                  fill
                  src={preview}
                />
              </div>
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-border bg-muted">
                <UserCircle className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Upload area */}
          <div className="flex-1">
            <button
              className={`flex min-h-32 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/10'
              }`}
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
              <p className="mb-3 text-center text-muted-foreground text-xs">
                JPEG、PNG、GIF、WebP（最大5MB）
              </p>
              <input
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                ref={fileInputRef}
                type="file"
              />
              <Button
                disabled={uploading || deleting}
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                type="button"
                variant="secondary"
              >
                ファイルを選択
              </Button>
            </button>

            {/* Action buttons */}
            <div className="mt-3 flex gap-2">
              {hasChanged && (
                <Button
                  disabled={uploading || deleting}
                  onClick={handleUpload}
                  size="sm"
                  type="button"
                >
                  {uploading ? 'アップロード中...' : 'アップロード'}
                </Button>
              )}
              {currentAvatarUrl && !hasChanged && (
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
          </div>
        </div>

        {error && (
          <div className="mt-2 rounded border border-error bg-error/10 p-3 text-error text-sm">
            {error}
          </div>
        )}

        <p className="mt-2 text-muted-foreground text-sm">
          プロフィール画像は管理画面、ブログ、ポートフォリオサイト全体で表示されます。
        </p>
      </div>
    </div>
  )
}
