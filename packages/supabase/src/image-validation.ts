export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Map MIME types to file extensions
export const MIME_TO_EXT: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateImageFile(file: File): { error?: string } | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      error:
        "サポートされていない画像形式です。JPEG、PNG、GIF、WebPのみアップロード可能です。",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      error:
        "ファイルサイズが大きすぎます。5MB以下の画像をアップロードしてください。",
    };
  }

  const fileExt = MIME_TO_EXT[file.type];
  if (!fileExt) {
    return {
      error: "不明な画像形式です。",
    };
  }

  return null;
}
